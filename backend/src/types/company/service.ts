import {
  BaseFilterable,
  Context,
  FindConfig,
  IModuleService,
  RestoreReturn,
} from '@medusajs/types'
import {
  ModuleCompany,
  ModuleCreateCompany,
  ModuleCreateEmployee,
  ModuleEmployee,
  ModuleUpdateCompany,
  ModuleUpdateEmployee,
  ModuleCreateEmployeeInvite,
  ModuleEmployeeInvite,
  ModuleUpdateEmployeeInvite,
  ModuleCompanyFilters,
  ModuleEmployeeFilters,
  ModuleEmployeeInviteFilters,
} from './module'

export interface ModuleCompanyFilters
  extends BaseFilterable<ModuleCompanyFilters> {
  q?: string
  id?: string | string[]
}

export interface ModuleEmployeeFilters
  extends BaseFilterable<ModuleEmployeeFilters> {
  q?: string
  id?: string | string[]
  company_id?: string | string[]
  customer_id?: string | string[]
}

/**
 * The main service interface for the Company Module.
 */
export interface ICompanyModuleService extends IModuleService {
  /* Entity: Companies */
  createCompanies(
    data: ModuleCreateCompany,
    sharedContext?: Context
  ): Promise<ModuleCompany>

  createCompanies(
    data: ModuleCreateCompany[],
    sharedContext?: Context
  ): Promise<ModuleCompany[]>

  retrieveCompany(
    id: string,
    config?: FindConfig<ModuleCompany>,
    sharedContext?: Context
  ): Promise<ModuleCompany>

  updateCompanies(
    data: ModuleUpdateCompany,
    sharedContext?: Context
  ): Promise<ModuleCompany>

  updateCompanies(
    data: ModuleUpdateCompany[],
    sharedContext?: Context
  ): Promise<ModuleCompany[]>

  listCompanies(
    filters?: ModuleCompanyFilters,
    config?: FindConfig<ModuleCompany>,
    sharedContext?: Context
  ): Promise<ModuleCompany[]>

  deleteCompanies(ids: string[], sharedContext?: Context): Promise<void>

  softDeleteCompanies(ids: string[], sharedContext?: Context): Promise<void>

  restoreCompanies<TReturnableLinkableKeys extends string = string>(
    ids: string[],
    config?: RestoreReturn<TReturnableLinkableKeys>,
    sharedContext?: Context
  ): Promise<Record<TReturnableLinkableKeys, string[]> | void>

  /* Entity: Employees */

  listEmployees(
    filters?: ModuleEmployeeFilters,
    config?: FindConfig<ModuleEmployee>,
    sharedContext?: Context
  ): Promise<ModuleEmployee[]>

  retrieveEmployee(
    id: string,
    config?: FindConfig<ModuleEmployee>,
    sharedContext?: Context
  ): Promise<ModuleEmployee>

  createEmployees(
    data: ModuleCreateEmployee,
    sharedContext?: Context
  ): Promise<ModuleEmployee>

  updateEmployees(
    data: ModuleUpdateEmployee,
    sharedContext?: Context
  ): Promise<ModuleEmployee>

  deleteEmployees(ids: string[], sharedContext?: Context): Promise<void>

  softDeleteEmployees(ids: string[], sharedContext?: Context): Promise<void>

  /* Entity: Employee Invites */

  listEmployeeInvites(
    filters?: ModuleEmployeeInviteFilters,
    config?: FindConfig<ModuleEmployeeInvite>,
    sharedContext?: Context
  ): Promise<ModuleEmployeeInvite[]>

  retrieveEmployeeInvite(
    id: string,
    config?: FindConfig<ModuleEmployeeInvite>,
    sharedContext?: Context
  ): Promise<ModuleEmployeeInvite>

  createEmployeeInvites(
    data: ModuleCreateEmployeeInvite,
    sharedContext?: Context
  ): Promise<ModuleEmployeeInvite>

  createEmployeeInvites(
    data: ModuleCreateEmployeeInvite[],
    sharedContext?: Context
  ): Promise<ModuleEmployeeInvite[]>

  updateEmployeeInvites(
    data: ModuleUpdateEmployeeInvite,
    sharedContext?: Context
  ): Promise<ModuleEmployeeInvite>

  updateEmployeeInvites(
    data: ModuleUpdateEmployeeInvite[],
    sharedContext?: Context
  ): Promise<ModuleEmployeeInvite[]>

  deleteEmployeeInvites(ids: string[], sharedContext?: Context): Promise<void>

  softDeleteEmployeeInvites(
    ids: string[],
    sharedContext?: Context
  ): Promise<void>
}
