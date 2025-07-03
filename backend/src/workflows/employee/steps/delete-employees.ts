import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk'
import { COMPANY_MODULE } from '../../../modules/company'
import { ICompanyModuleService } from '../../../types'

export const deleteEmployeesStep = createStep(
  'delete-employees',
  async (
    id: string | string[],
    { container }
  ): Promise<StepResponse<string[], string[]>> => {
    const ids = Array.isArray(id) ? id : [id]
    const { ContainerRegistrationKeys } = await import(
      '@medusajs/framework/utils'
    )
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    // Check if any of the employees to be deleted are admins
    const { data: employees } = await query.graph({
      entity: 'employee',
      fields: ['id', 'is_admin', 'company_id'],
      filters: {
        id: ids,
      },
    })

    const adminEmployees = employees.filter((emp: any) => emp.is_admin)
    if (adminEmployees.length > 0) {
      throw new Error(
        `Cannot delete admin employees: ${adminEmployees.map((emp: any) => emp.id).join(', ')}`
      )
    }

    // Get the company ID from the first employee to check total admin count
    if (employees.length > 0) {
      const { data: companyEmployees } = await query.graph({
        entity: 'employee',
        fields: ['id', 'is_admin'],
        filters: {
          company_id: employees[0].company_id,
        },
      })

      const totalAdmins = companyEmployees.filter(
        (emp: any) => emp.is_admin
      ).length
      const adminsToDelete = employees.filter((emp: any) => emp.is_admin).length

      if (totalAdmins - adminsToDelete <= 0) {
        throw new Error('Cannot delete the last admin employee')
      }
    }

    const companyModuleService =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE)
    await companyModuleService.softDeleteEmployees(ids)

    return new StepResponse(ids)
  },
  async (ids: string[], { container }) => {
    const companyModuleService =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE)
    await companyModuleService.restoreEmployees(ids)
  }
)
