import { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { sendEmployeeInviteWorkflow } from '../../../../../workflows/employee/workflows/send-employee-invite'
import { COMPANY_MODULE } from '../../../../../modules/company'
import { ICompanyModuleService } from '../../../../../types'

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  console.log('Backend resend-invite route called')
  console.log('Auth context:', req.auth_context)
  console.log('Request body:', req.body)

  const { id: companyId } = req.params
  const { inviteId, first_name, last_name, email } = req.body

  // Validate required fields
  if (!inviteId) {
    return res.status(400).json({
      message: 'Invite ID is required',
    })
  }

  if (!first_name || !last_name || !email) {
    return res.status(400).json({
      message: 'First name, last name, and email are required',
    })
  }

  // Get the current customer (inviter)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const {
    data: [customer],
  } = await query.graph(
    {
      entity: 'customer',
      fields: ['id', 'first_name', 'last_name'],
      filters: {
        id: req.auth_context.actor_id,
      },
    },
    { throwIfKeyNotFound: true }
  )

  // Get company details
  const {
    data: [company],
  } = await query.graph(
    {
      entity: 'company',
      fields: ['id', 'name'],
      filters: {
        id: companyId,
      },
    },
    { throwIfKeyNotFound: true }
  )

  // Check if the customer is an admin of the company
  const { data: employees } = await query.graph({
    entity: 'employees',
    fields: ['id', 'is_admin', 'customer.id'],
    filters: {
      company_id: companyId,
    },
  })

  // Find the employee record for the current customer
  const employee = employees.find((emp) => emp.customer?.id === customer.id)

  if (!employee) {
    return res.status(403).json({
      message: 'You are not an employee of this company',
    })
  }

  if (!employee.is_admin) {
    return res.status(403).json({
      message: 'Only company admins can resend invites',
    })
  }

  // Get the existing invite
  const {
    data: [existingInvite],
  } = await query.graph(
    {
      entity: 'employee_invite',
      fields: [
        'id',
        'email',
        'first_name',
        'last_name',
        'status',
        'expires_at',
      ],
      filters: {
        id: inviteId,
        company_id: companyId,
      },
    },
    { throwIfKeyNotFound: true }
  )

  if (existingInvite.status === 'accepted') {
    return res.status(400).json({
      message: 'This invitation has already been accepted',
    })
  }

  try {
    // Mark the old invite as expired
    const companyModule =
      req.scope.resolve<ICompanyModuleService>(COMPANY_MODULE)
    await companyModule.updateEmployeeInvites({
      id: existingInvite.id,
      status: 'expired',
    })

    // Create a completely new employee invite
    const { result: employeeInvite } = await sendEmployeeInviteWorkflow.run({
      input: {
        email: email,
        firstName: first_name,
        lastName: last_name,
        companyId,
        inviterId: customer.id,
        inviterName: `${customer.first_name} ${customer.last_name}`,
        companyName: company.name,
      },
      container: req.scope,
    })

    res.json({
      message: 'New employee invitation sent successfully',
      invite: employeeInvite,
    })
  } catch (error) {
    console.error('Failed to create new employee invite:', error)
    res.status(500).json({
      message: 'Failed to create new employee invitation',
    })
  }
}
 