import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { COMPANY_MODULE } from '../modules/company'
import { ICompanyModuleService } from '../types'

export async function expireOldInvites(container: any) {
  console.log('Starting invite expiration cleanup...')

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const companyModule = container.resolve<ICompanyModuleService>(COMPANY_MODULE)

  try {
    // Get all pending invites that have expired
    const { data: expiredInvites } = await query.graph({
      entity: 'employee_invite',
      fields: ['id', 'email', 'expires_at'],
      filters: {
        status: 'pending',
      },
    })

    const now = new Date()
    const toExpire = expiredInvites.filter((invite) => {
      const expiresAt = new Date(invite.expires_at)
      return expiresAt < now
    })

    if (toExpire.length === 0) {
      console.log('No expired invites found')
      return
    }

    console.log(`Found ${toExpire.length} expired invites to update`)

    // Update the status of expired invites
    for (const invite of toExpire) {
      await companyModule.updateEmployeeInvites(invite.id, {
        status: 'expired',
      })
      console.log(`Expired invite for ${invite.email}`)
    }

    console.log(`Successfully expired ${toExpire.length} invites`)
  } catch (error) {
    console.error('Error expiring invites:', error)
  }
}

// If running directly
if (require.main === module) {
  // This would need to be run with proper container setup
  console.log(
    'This script should be run through the Medusa CLI or as a scheduled job'
  )
}
