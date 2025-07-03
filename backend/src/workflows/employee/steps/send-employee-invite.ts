import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk'
import { ICompanyModuleService } from '../../../types'
import { COMPANY_MODULE } from '../../../modules/company'
import EmailService from '../../../modules/email/service'
import { randomBytes } from 'crypto'

export interface SendEmployeeInviteInput {
  email: string
  firstName: string
  lastName: string
  companyId: string
  inviterId: string
  inviterName: string
  companyName: string
}

export const sendEmployeeInviteStep = createStep(
  'send-employee-invite',
  async (input: SendEmployeeInviteInput, { container }) => {
    const companyModule =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE)
    const emailService = new EmailService()

    // Generate a unique token for the invite
    const token = randomBytes(32).toString('hex')

    // Set expiration to 7 days from now
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Create the employee invite record
    const employeeInvite = await companyModule.createEmployeeInvites({
      email: input.email,
      first_name: input.firstName,
      last_name: input.lastName,
      company_id: input.companyId,
      inviter_id: input.inviterId,
      token,
      expires_at: expiresAt,
    })

    // Generate the invite URL
    const baseUrl = process.env.STOREFRONT_URL || 'http://localhost:8000'
    const inviteUrl = `${baseUrl}/invite/${token}`

    // Send the email
    await emailService.sendEmployeeInvite({
      to: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      companyName: input.companyName,
      inviteUrl,
      inviterName: input.inviterName,
    })

    return new StepResponse(employeeInvite, employeeInvite.id)
  },
  async (inviteId: string, { container }) => {
    // If the workflow fails, delete the invite
    const companyModule =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE)
    await companyModule.deleteEmployeeInvites([inviteId])
  }
)
