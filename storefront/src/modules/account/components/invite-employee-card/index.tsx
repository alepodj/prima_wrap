"use client"

import Button from "@/modules/common/components/button"
import Input from "@/modules/common/components/input"
import { QueryCompany } from "@/types"
import { Container, Text, toast } from "@medusajs/ui"
import { useState } from "react"

const InviteEmployeeCard = ({ company }: { company: QueryCompany }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  })
  const [loading, setLoading] = useState(false)
  const [pendingInvite, setPendingInvite] = useState<{
    id: string
    expiresAt: string
  } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    // Clear pending invite when email changes
    if (e.target.name === "email") {
      setPendingInvite(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.first_name || !formData.last_name || !formData.email) {
      toast.error("Please fill in all fields")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        `/api/companies/${company.id}/invite-employee`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        // Check if there's a pending invite that can be resent
        if (result.inviteId && result.expiresAt) {
          setPendingInvite({
            id: result.inviteId,
            expiresAt: result.expiresAt,
          })
          throw new Error(result.message)
        }
        throw new Error(result.message || "Failed to send invitation")
      }

      toast.success("Employee invitation sent successfully!")
      setPendingInvite(null)

      // Reset form
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
      })
    } catch (error) {
      console.error("Error sending invite:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to send invitation"
      )
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!pendingInvite) return

    setLoading(true)

    try {
      const response = await fetch(
        `/api/companies/${company.id}/resend-invite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inviteId: pendingInvite.id,
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to create new invitation")
      }

      toast.success("New employee invitation sent successfully!")
      setPendingInvite(null)

      // Reset form
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
      })
    } catch (error) {
      console.error("Error creating new invite:", error)
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create new invitation"
      )
    } finally {
      setLoading(false)
    }
  }

  const formatExpiryDate = (expiresAt: string) => {
    const date = new Date(expiresAt)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  return (
    <Container className="p-0 overflow-hidden">
      <form onSubmit={handleSubmit}>
      <div className="grid small:grid-cols-4 grid-cols-2 gap-4 p-4 border-b border-neutral-200">
        <div className="flex flex-col gap-y-2">
          <Text className="font-medium text-neutral-950">Name</Text>
            <Input
              name="first_name"
              label="First name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
        </div>
        <div className="flex flex-col gap-y-2 justify-end">
            <Input
              name="last_name"
              label="Last name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
        </div>
        <div className="flex flex-col col-span-2 gap-y-2">
          <Text className="font-medium text-neutral-950">Email</Text>
            <Input
              name="email"
              label="Enter an email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {pendingInvite && (
          <div className="bg-amber-50 border border-amber-200 p-4">
            <Text className="text-amber-800 text-sm mb-2">
              An invitation has already been sent to this email and is still
              valid until {formatExpiryDate(pendingInvite.expiresAt)}. Click
              below to send a new invitation (this will invalidate the previous
              one).
            </Text>
            <Button
              variant="secondary"
              size="small"
              onClick={handleResend}
              loading={loading}
              disabled={loading}
            >
              Send New Invitation
            </Button>
      </div>
        )}

      <div className="flex items-center justify-end gap-2 bg-neutral-50 p-4">
          <Button
            variant="primary"
            type="submit"
            loading={loading}
            disabled={loading || !!pendingInvite}
          >
          Send Invite
        </Button>
      </div>
      </form>
    </Container>
  )
}

export default InviteEmployeeCard
