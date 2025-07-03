import { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { sendEmployeeInviteWorkflow } from '../../../../../workflows/employee/workflows/send-employee-invite'

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id: companyId } = req.params
  const { email, first_name, last_name } = req.body

  // Validate required fields
  if (!email || !first_name || !last_name) {
    return res.status(400).json({
      message: 'Email, first_name, and last_name are required',
    })
  }

  // Get the current admin user
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const {
    data: [user],
  } = await query.graph(
    {
      entity: 'user',
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
    fields: ['id'],
    filters: {
      company_id: companyId,
      email: email,
      status: 'pending',
    },
  })

  if (existingInvites.length > 0) {
    return res.status(400).json({
      message: 'An invitation has already been sent to this email',
    })
  }

  try {
    // Send the employee invite
    const { result: employeeInvite } = await sendEmployeeInviteWorkflow.run({
      input: {
        email,
        firstName: first_name,
        lastName: last_name,
        companyId,
        inviterId: user.id,
        inviterName: `${user.first_name} ${user.last_name}`,
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
 