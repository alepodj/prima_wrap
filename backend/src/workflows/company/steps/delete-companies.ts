import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk'
import { ICompanyModuleService } from '../../../types'
import { COMPANY_MODULE } from '../../../modules/company'
import {
  IAuthModuleService,
  ICustomerModuleService,
} from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'

export const deleteCompaniesStep = createStep(
  'delete-companies',
  async (ids: string[], { container }) => {
    const companyModule =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE)

    // Get company data before deletion
    const companies = await companyModule.listCompanies({ id: ids })
    // Get employees for these companies
    const employees = await companyModule.listEmployees({ company_id: ids })

    // Soft delete employees
    if (employees.length > 0) {
      await companyModule.softDeleteEmployees(employees.map((e) => e.id))
    }

    // Soft delete companies
    await companyModule.softDeleteCompanies(ids)

    // Clean up authentication identities and customers for company emails
    try {
      const authModuleService = container.resolve<IAuthModuleService>(
        Modules.AUTH
      )
      const customerModuleService = container.resolve<ICustomerModuleService>(
        Modules.CUSTOMER
      )

      for (const company of companies) {
        if (company.email) {
          try {
            // List all provider identities for this email
            const providerIdentities =
              await authModuleService.listProviderIdentities({
                entity_id: company.email,
                provider: 'emailpass',
              })

            if (providerIdentities.length > 0) {
              // Delete all provider identities for this email
              const identityIds = providerIdentities.map(
                (identity) => identity.id
              )
              await authModuleService.deleteProviderIdentities(identityIds)
              console.log(
                `Cleaned up ${identityIds.length} auth identities for email ${company.email}`
              )
            }

            // Soft delete customer with this email
            const customers = await customerModuleService.listCustomers({
              email: company.email,
            })

            if (customers.length > 0) {
              const customerIds = customers.map((customer) => customer.id)
              await customerModuleService.softDeleteCustomers(customerIds)
              console.log(
                `Soft deleted ${customerIds.length} customers for email ${company.email}`
              )
            }
          } catch (error) {
            // Log error but don't fail the deletion process
            console.warn(
              `Failed to clean up auth identity or customer for email ${company.email}:`,
              error
            )
          }
        }
      }
    } catch (error) {
      console.warn(
        'Could not resolve auth or customer module service in workflow context. Skipping cleanup.',
        error
      )
    }

    return new StepResponse(ids, ids)
  },
  async (companyIds: string[], { container }) => {
    const companyModule =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE)
    // Restore companies and employees on undo
    await companyModule.restoreCompanies(companyIds)
    const employees = await companyModule.listEmployees({
      company_id: companyIds,
    })
    if (employees.length > 0) {
      await companyModule.restoreEmployees(employees.map((e) => e.id))
    }
  }
)
