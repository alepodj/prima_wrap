import {
  createWorkflow,
  WorkflowResponse,
} from '@medusajs/framework/workflows-sdk'
import {
  sendEmployeeInviteStep,
  SendEmployeeInviteInput,
} from '../steps/send-employee-invite'

export const sendEmployeeInviteWorkflow = createWorkflow(
  'send-employee-invite',
  function (input: SendEmployeeInviteInput): WorkflowResponse<any> {
    const employeeInvite = sendEmployeeInviteStep(input)

    return new WorkflowResponse(employeeInvite)
  }
)
