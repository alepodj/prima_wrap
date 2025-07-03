import { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import {
  IAuthModuleService,
  ICustomerModuleService,
} from '@medusajs/framework/types'
import { createEmployeesWorkflow } from '../../../../../workflows/employee/workflows'
import { COMPANY_MODULE } from '../../../../../modules/company'
import { ICompanyModuleService } from '../../../../../types'
import Scrypt from 'scrypt-kdf'

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { token } = req.params
  const { password } = req.body
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  if (!password) {
    return res.status(400).json({
      message: 'Password is required',
    })
  }

  try {
    // Get all invites and filter by token in JavaScript
    const { data: invites } = await query.graph({
      entity: 'employee_invite',
      fields: [
        'id',
        'email',
        'first_name',
        'last_name',
        'company_id',
        'status',
        'expires_at',
        'token',
      ],
    })

    // Find the invite by token
    const invite = invites.find((inv: any) => inv.token === token)

    if (!invite) {
      return res.status(404).json({
        message: 'Invalid or expired invitation link',
      })
    }

    console.log('Found invite for acceptance:', invite)

    // Check if invite is valid
    if (invite.status !== 'pending') {
      return res.status(400).json({
        message: 'This invitation has already been used',
      })
    }

    if (new Date(invite.expires_at) < new Date()) {
      return res.status(400).json({
        message: 'This invitation has expired',
      })
    }

    // Check if customer already exists
    const { data: existingCustomers } = await query.graph({
      entity: 'customer',
      fields: ['id'],
      filters: {
        email: invite.email,
      },
    })

    let customerId: string
    const customerModule = req.scope.resolve<ICustomerModuleService>(
      Modules.CUSTOMER
    )

    // Try to update existing customer first, only delete if update fails
    if (existingCustomers.length > 0) {
      try {
        // Try to update the existing customer with minimal data to avoid metadata issues
        const updateData = {
          id: existingCustomers[0].id,
          first_name: invite.first_name,
          last_name: invite.last_name,
          email: invite.email, // Include email to ensure all required fields are present
        }

        await customerModule.updateCustomers(updateData) // Pass as single object, not array
        customerId = existingCustomers[0].id
      } catch (error) {
        // If update fails, delete and recreate
        console.log(
          'Customer update failed, deleting and recreating:',
          error.message
        )
        await customerModule.deleteCustomers(existingCustomers[0].id)

        // Create new customer with invitee's name
        const customer = await customerModule.createCustomers({
          email: invite.email,
          first_name: invite.first_name,
          last_name: invite.last_name,
          has_account: true,
          metadata: {}, // Explicitly set empty metadata
        })
        customerId = customer.id
        console.log('Created new customer with ID:', customerId)
      }
    } else {
      // Create new customer with invitee's name
      const customer = await customerModule.createCustomers({
        email: invite.email,
        first_name: invite.first_name,
        last_name: invite.last_name,
        has_account: true,
        metadata: {}, // Explicitly set empty metadata
      })
      customerId = customer.id
      console.log('Created new customer with ID:', customerId)
    }

    // Use Medusa's built-in auth system to create the authentication
    const authModule = req.scope.resolve<IAuthModuleService>(Modules.AUTH)

    try {
      // Clean up any existing auth identities for this email to avoid conflicts
      const existingProviderIdentities =
        await authModule.listProviderIdentities({
          entity_id: invite.email,
          provider: 'emailpass',
        })

      if (existingProviderIdentities.length > 0) {
        // Delete existing provider identities
        const identityIds = existingProviderIdentities.map(
          (identity) => identity.id
        )
        await authModule.deleteProviderIdentities(identityIds)

        // Also delete the associated auth identities
        const authIdentityIds = existingProviderIdentities
          .map((identity) => identity.auth_identity_id)
          .filter((id) => id) // Filter out any undefined values
        if (authIdentityIds.length > 0) {
          await authModule.deleteAuthIdentities(authIdentityIds)
        }

        console.log(
          `Cleaned up ${identityIds.length} existing auth identities for email ${invite.email}`
        )
      }

      // Create auth identity using Medusa's proper structure
      const authIdentity = await authModule.createAuthIdentities([
        {
          provider: 'emailpass',
          entity_id: customerId, // Auth identity uses customer ID
          app_metadata: {
            customer_id: customerId,
          },
          user_metadata: {
            role: 'employee', // Set the role for the new employee
          },
        },
      ])

      // Hash the password using Scrypt (same as working test user)
      const hashConfig = { logN: 15, r: 8, p: 1 }
      const passwordHash = await Scrypt.kdf(password, hashConfig)

      // Create provider identity with email and hashed password
      await authModule.createProviderIdentities([
        {
          provider: 'emailpass',
          entity_id: invite.email, // Provider identity uses email for login
          auth_identity_id: authIdentity[0].id,
          provider_metadata: {
            password: passwordHash.toString('base64'),
          },
        },
      ])

      console.log('Created auth identity:', authIdentity[0].id)
      console.log('Customer ID for auth:', customerId)
    } catch (error) {
      // If provider identity already exists, that's fine - the user can still log in
      if (
        error.message?.includes('Provider identity with entity_id') &&
        error.message?.includes('already exists')
      ) {
        console.log(
          'Provider identity already exists for this email, continuing with invite acceptance'
        )
      } else {
        throw error
      }
    }

    // Create employee
    console.log(
      'Creating employee with company_id:',
      invite.company_id,
      'customerId:',
      customerId
    )
    const { result: employee } = await createEmployeesWorkflow.run({
      input: {
        employeeData: {
          company_id: invite.company_id,
          spending_limit: 0, // Default spending limit
          is_admin: false, // Default to non-admin
        },
        customerId: customerId,
      },
      container: req.scope,
    })

    console.log('Employee created successfully:', employee)

    // Update invite status to accepted
    const companyModule =
      req.scope.resolve<ICompanyModuleService>(COMPANY_MODULE)
    await companyModule.updateEmployeeInvites({
      id: invite.id,
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    })

    // Verify the employee-customer link was created
    const { data: employeeCheck } = await query.graph({
      entity: 'employee',
      fields: ['id', 'company_id', 'customer.id', 'customer.email'],
      filters: {
        id: employee.id,
      },
    })

    console.log('Employee verification:', employeeCheck)

    res.json({
      message: 'Invitation accepted successfully',
      employee: employee,
    })
  } catch (error) {
    console.error('Error accepting invite:', error)
    res.status(500).json({
      message: 'Failed to accept invitation',
    })
  }
}
 