import { model } from '@medusajs/framework/utils'
import { Company } from './company'

export const EmployeeInvite = model.define('employee_invite', {
  id: model
    .id({
      prefix: 'inv',
    })
    .primaryKey(),
  email: model.text(),
  first_name: model.text(),
  last_name: model.text(),
  inviter_id: model.text(), // ID of the customer who sent the invite
  token: model.text(), // Unique token for the invite link
  status: model.enum(['pending', 'accepted', 'expired']).default('pending'),
  expires_at: model.text(),
  accepted_at: model.text().nullable(),
  company: model.belongsTo(() => Company, {
    mappedBy: 'employee_invites',
  }),
})
 