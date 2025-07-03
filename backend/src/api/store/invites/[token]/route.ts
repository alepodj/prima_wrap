import { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { COMPANY_MODULE } from '../../../../modules/company'
import { ICompanyModuleService } from '../../../../types'

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { token } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  console.log('Backend invite lookup called with token:', token)

  try {
    // First, get all employee invites and filter by token in JavaScript
    const { data: invites } = await query.graph({
      entity: 'employee_invite',
      fields: [
        'id',
        'email',
        'first_name',
        'last_name',
        'status',
        'expires_at',
        'token',
        'company.id',
        'company.name',
      ],
    })

    console.log('All invites found:', invites.length)

    // Find the invite with matching token
    const invite = invites.find((inv) => inv.token === token)

    if (!invite) {
      console.log('No invite found with token:', token)
      return res.status(404).json({
        message: 'Invitation not found',
      })
    }

    console.log('Found invite:', invite)

    // Check if invite is expired
    if (
      invite.status === 'pending' &&
      new Date(invite.expires_at) < new Date()
    ) {
      // Update status to expired
      const companyModule =
        req.scope.resolve<ICompanyModuleService>(COMPANY_MODULE)
      await companyModule.updateEmployeeInvites({
        id: invite.id,
        status: 'expired',
      })

      return res.status(400).json({
        message: 'This invitation has expired',
      })
    }

    res.json({ invite })
  } catch (error) {
    console.error('Error fetching invite:', error)
    res.status(404).json({
      message: 'Invitation not found',
    })
  }
}
