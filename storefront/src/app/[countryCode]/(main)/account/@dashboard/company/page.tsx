import { retrieveCompany } from "@/lib/data/companies"
import { retrieveCustomer } from "@/lib/data/customer"
import { listRegions } from "@/lib/data/regions"
import ApprovalSettingsCard from "@/modules/account/components/approval-settings-card"
import CompanyCard from "@/modules/account/components/company-card"
import EmployeesCard from "@/modules/account/components/employees-card"
import InviteEmployeeCard from "@/modules/account/components/invite-employee-card"
import { Heading } from "@medusajs/ui"
import { notFound } from "next/navigation"

export default async function Company() {
  const customer = await retrieveCustomer()
  const regions = await listRegions()

  if (!customer || !customer?.employee?.company_id) return notFound()

  const company = await retrieveCompany(customer.employee.company_id)
  const isAdmin = customer?.employee?.is_admin

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col gap-y-4">
        <Heading level="h2" className="text-lg text-neutral-950">
          Company Details
        </Heading>
        <CompanyCard company={company} regions={regions} customer={customer} />
      </div>
      {isAdmin && (
        <div className="mb-8 flex flex-col gap-y-4">
          <Heading level="h2" className="text-lg text-neutral-950">
            Approval Settings
          </Heading>
          <ApprovalSettingsCard company={company} customer={customer} />
        </div>
      )}
      <div className="mb-8 flex flex-col gap-y-4">
        <Heading level="h2" className="text-lg text-neutral-950">
          Employees
        </Heading>
        <EmployeesCard company={company} />
      </div>
      {isAdmin && (
        <div className="mb-8 flex flex-col gap-y-4">
          <Heading level="h2" className="text-lg text-neutral-950">
            Invite Employees
          </Heading>
          <InviteEmployeeCard company={company} />
        </div>
      )}
    </div>
  )
}
