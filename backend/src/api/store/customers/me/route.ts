import { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const customerId = req.auth_context.actor_id

  // Get customer with employee relationship
  const { data: customers } = await query.graph({
    entity: 'customer',
    fields: ['*', 'employee.*', 'employee.company_id'],
    filters: {
      id: customerId,
    },
  })

  if (customers.length === 0) {
    return res.status(404).json({
      message: 'Customer not found',
    })
  }

  const customer = customers[0]

  // If customer has an employee relationship, get the employee details
  if (customer.employee) {
    const { data: employees } = await query.graph({
      entity: 'employee',
      fields: ['id', 'spending_limit', 'is_admin', 'company_id'],
      filters: {
        id: customer.employee.id,
      },
    })

    if (employees.length > 0) {
      customer.employee = {
        ...customer.employee,
        ...employees[0],
      }
    }
  }

  res.json({ customer })
}
