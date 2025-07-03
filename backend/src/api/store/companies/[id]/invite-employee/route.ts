import { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { sendEmployeeInviteWorkflow } from '../../../../../workflows/employee/workflows/send-employee-invite'

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  console.log('Backend invite-employee route called')
  console.log('Auth context:', req.auth_context)
  console.log('Request body:', req.body)

  const { id: companyId } = req.params
  const { email, first_name, last_name } = req.body

  // Validate required fields
  if (!email || !first_name || !last_name) {
    return res.status(400).json({
      message: 'Email, first_name, and last_name are required',
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
      message: 'Only company admins can invite employees',
    })
  }

  // Check if the email is already an active employee (not soft-deleted)
  const { data: existingEmployees } = await query.graph({
    entity: 'employees',
    fields: ['id', 'customer.email', 'deleted_at'],
    filters: {
      company_id: companyId,
    },
  })

  // Check if any active employee has the same email
  const existingEmployee = existingEmployees.find(
    (emp) => emp.customer?.email === email && !emp.deleted_at
  )
  if (existingEmployee) {
    return res.status(400).json({
      message: 'This email is already an employee of the company',
    })
  }

  // Check if there's already a pending invite for this email
  const { data: existingInvites } = await query.graph({
    entity: 'employee_invite',
    fields: ['id', 'status', 'expires_at'],
    filters: {
      company_id: companyId,
      email: email,
    },
  })

  // Check for existing invites
  const pendingInvite = existingInvites.find(
    (invite) => invite.status === 'pending'
  )
  const expiredInvite = existingInvites.find(
    (invite) => invite.status === 'expired'
  )
  const acceptedInvite = existingInvites.find(
    (invite) => invite.status === 'accepted'
  )

  if (acceptedInvite) {
    // Check if there's an active employee for this accepted invite
    const hasActiveEmployee = existingEmployees.some(
      (emp) => emp.customer?.email === email && !emp.deleted_at
    )

    if (hasActiveEmployee) {
      return res.status(400).json({
        message:
          'This email has already accepted an invitation to join the company',
      })
    } else {
      // The invite was accepted but the employee was deleted, allow a new invite
      console.log(
        'Previous invite was accepted but employee was deleted, allowing new invite'
      )
    }
  }

  if (pendingInvite) {
    // Check if the pending invite is expired
    const expiresAt = new Date(pendingInvite.expires_at)
    const now = new Date()

    if (expiresAt > now) {
      return res.status(400).json({
        message:
          'An invitation has already been sent to this email and is still valid',
        inviteId: pendingInvite.id,
        expiresAt: pendingInvite.expires_at,
      })
    } else {
      // The invite is expired, we can create a new one
      console.log('Previous invite expired, creating new invite')
    }
  }

  try {
    // Send the employee invite
    const { result: employeeInvite } = await sendEmployeeInviteWorkflow.run({
      input: {
        email,
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
      message: 'Employee invitation sent successfully',
      invite: employeeInvite,
    })
  } catch (error) {
    console.error('Failed to send employee invite:', error)
    res.status(500).json({
      message: 'Failed to send employee invitation',
    })
  }
}
