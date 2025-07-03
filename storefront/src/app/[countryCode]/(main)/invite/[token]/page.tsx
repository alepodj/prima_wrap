import { notFound } from "next/navigation"
import { Container, Heading, Text, Button } from "@medusajs/ui"
import AcceptInviteForm from "./accept-invite-form"

interface PageProps {
  params: Promise<{
    token: string
  }>
}

export default async function InvitePage({ params }: PageProps) {
  const { token } = await params

  if (!token) {
    notFound()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Container className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Heading level="h1" className="text-2xl font-bold text-gray-900">
            🎉 You're Invited!
          </Heading>
          <Text className="mt-2 text-gray-600">
            Accept your invitation to join the company
          </Text>
        </div>

        <AcceptInviteForm token={token} />
      </Container>
    </div>
  )
}
