"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Container, Text, Button, Input, toast } from "@medusajs/ui"

interface AcceptInviteFormProps {
  token: string
}

interface InviteData {
  id: string
  email: string
  first_name: string
  last_name: string
  company: {
    id: string
    name: string
  }
  expires_at: string
  status: string
}

export default function AcceptInviteForm({ token }: AcceptInviteFormProps) {
  const router = useRouter()
  const [invite, setInvite] = useState<InviteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    fetchInvite()
  }, [token])

  const fetchInvite = async () => {
    try {
      const response = await fetch(`/api/invites/${token}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch invite")
      }

      setInvite(result.invite)
    } catch (error) {
      console.error("Error fetching invite:", error)
      toast.error("Invalid or expired invitation link")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }

    setAccepting(true)

    try {
      const response = await fetch(`/api/invites/${token}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: formData.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to accept invitation")
      }

      toast.success("Invitation accepted successfully! You can now log in.")
      router.push("/account")
    } catch (error) {
      console.error("Error accepting invite:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to accept invitation"
      )
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <Container className="p-6">
        <Text>Loading invitation...</Text>
      </Container>
    )
  }

  if (!invite) {
    return (
      <Container className="p-6">
        <Text className="text-red-600">Invalid or expired invitation link</Text>
      </Container>
    )
  }

  if (invite.status !== "pending") {
    return (
      <Container className="p-6">
        <Text className="text-red-600">
          This invitation has already been {invite.status}
        </Text>
      </Container>
    )
  }

  const isExpired = new Date(invite.expires_at) < new Date()

  if (isExpired) {
    return (
      <Container className="p-6">
        <Text className="text-red-600">This invitation has expired</Text>
      </Container>
    )
  }

  return (
    <Container className="p-6">
      <div className="mb-6">
        <Text className="text-lg font-medium">
          You've been invited to join <strong>{invite.company.name}</strong>
        </Text>
        <Text className="text-sm text-gray-600 mt-2">
          Email: {invite.email}
        </Text>
        <Text className="text-sm text-gray-600">
          Name: {invite.first_name} {invite.last_name}
        </Text>
      </div>

      <form onSubmit={handleAccept} className="space-y-4">
        <div>
          <Text className="block text-sm font-medium text-gray-700 mb-2">
            Create Password
          </Text>
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            minLength={8}
          />
        </div>

        <div>
          <Text className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </Text>
          <Input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
            minLength={8}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={accepting}
          disabled={accepting}
        >
          Accept Invitation
        </Button>
      </form>
    </Container>
  )
}
