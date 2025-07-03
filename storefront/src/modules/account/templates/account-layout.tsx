import { listApprovals } from "@/lib/data/approvals"
import AccountNav from "@/modules/account/components/account-nav"
import { B2BCustomer } from "@/types"
import { ApprovalStatusType, ApprovalType } from "@/types/approval"
import React from "react"

interface AccountLayoutProps {
  customer: B2BCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = async ({
  customer,
  children,
}) => {
  // Only fetch approvals if the user is an admin
  let numPendingApprovals = 0
  if (customer?.employee?.is_admin) {
    try {
      const { carts_with_approvals } = await listApprovals({
        type: ApprovalType.ADMIN,
        status: ApprovalStatusType.PENDING,
      })
      numPendingApprovals = carts_with_approvals?.length || 0
    } catch (error) {
      // If there's an error fetching approvals (e.g., 403), just continue with 0
      console.warn("Could not fetch approvals:", error)
      numPendingApprovals = 0
    }
  }

  return (
    <div
      className="flex-1 small:py-12 bg-neutral-100"
      data-testid="account-page"
    >
      <div className="flex-1 content-container h-full max-w-7xl mx-auto flex flex-col">
        <div className="grid grid-cols-1  small:grid-cols-[240px_1fr] py-12">
          <div>
            {customer && (
              <AccountNav
                customer={customer}
                numPendingApprovals={numPendingApprovals}
              />
            )}
          </div>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
