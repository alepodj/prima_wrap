import { MedusaService } from '@medusajs/framework/utils'
import { Company, Employee, EmployeeInvite } from './models'

class CompanyModuleService extends MedusaService({
  Company,
  Employee,
  EmployeeInvite,
}) {
  async cleanupOrphanedEmployees() {
    // Find employees that have no customer relationship
    const employees = await this.listEmployees({})
    const orphanedEmployees = employees.filter((employee) => !employee.customer)

    if (orphanedEmployees.length > 0) {
      const orphanedIds = orphanedEmployees.map((emp) => emp.id)
      await this.softDeleteEmployees(orphanedIds)
      console.log(`Cleaned up ${orphanedIds.length} orphaned employee records`)
    }

    return orphanedEmployees.length
  }
}

export default CompanyModuleService
