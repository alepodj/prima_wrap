/* Entity: Company */

import { CustomerGroupDTO } from '@medusajs/framework/types'
import { CustomerDTO } from '@medusajs/types/dist/customer/common'
import { ModuleApprovalSettings } from '../approval/module'
import {
  BaseFilterable,
  Context,
  FindConfig,
  IModuleService,
  RestoreReturn,
} from '@medusajs/types'

export enum ModuleCompanySpendingLimitResetFrequency {
  NEVER = 'never',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export type ModuleCompany = {
  id: string
  name: string
  email: string
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zip?: string | null
  country?: string | null
  logo_url?: string | null
  currency_code?: string | null
  spending_limit_reset_frequency:
    | 'never'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
  created_at: Date
  updated_at: Date
  deleted_at?: Date | null
  customer_group: CustomerGroupDTO
  approval_settings: ModuleApprovalSettings
}

export type ModuleCreateCompany = {
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  logo_url?: string
  currency_code?: string
  spending_limit_reset_frequency?:
    | 'never'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
}

export type ModuleUpdateCompany = {
  id: string
  name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  logo_url?: string
  currency_code?: string
  spending_limit_reset_frequency?:
    | 'never'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
}

export type ModuleDeleteCompany = {
  id: string
}

/* Entity: Employee */

export interface ModuleEmployee {
  id: string
  spending_limit: number
  is_admin: boolean
  company_id: string
  created_at: Date
  updated_at: Date
  deleted_at?: Date | null
  customer: CustomerDTO
  company: ModuleCompany
}

export type ModuleCreateEmployee = {
  spending_limit?: number
  is_admin?: boolean
  company_id: string
}

export type ModuleUpdateEmployee = {
  id: string
  spending_limit?: number
  is_admin?: boolean
}

export type ModuleDeleteEmployee = {
  id: string
}

export type ModuleEmployeeInvite = {
  id: string
  email: string
  first_name: string
  last_name: string
  company_id: string
  inviter_id: string
  token: string
  status: 'pending' | 'accepted' | 'expired'
  expires_at: Date
  accepted_at?: Date | null
  created_at: Date
  updated_at: Date
  deleted_at?: Date | null
}

export type ModuleCreateEmployeeInvite = {
  email: string
  first_name: string
  last_name: string
  company_id: string
  inviter_id: string
  token: string
  expires_at: Date
}

export type ModuleUpdateEmployeeInvite = {
  id: string
  status?: 'pending' | 'accepted' | 'expired'
  accepted_at?: Date
}

export interface ModuleCompanyFilters
  extends BaseFilterable<ModuleCompanyFilters> {
  q?: string
  id?: string | string[]
  name?: string | string[]
  email?: string | string[]
}

export interface ModuleEmployeeFilters
  extends BaseFilterable<ModuleEmployeeFilters> {
  q?: string
  id?: string | string[]
  company_id?: string | string[]
  is_admin?: boolean
}

export interface ModuleEmployeeInviteFilters
  extends BaseFilterable<ModuleEmployeeInviteFilters> {
  q?: string
  id?: string | string[]
  company_id?: string | string[]
  email?: string | string[]
  status?: 'pending' | 'accepted' | 'expired'
  token?: string
}
