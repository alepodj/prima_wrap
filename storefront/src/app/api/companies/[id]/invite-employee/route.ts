import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const backendUrl =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

    // Get the JWT token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get("_medusa_jwt")?.value
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

    console.log("Frontend API Route Debug:")
    console.log("Company ID:", id)
    console.log("JWT token from cookies:", token ? "Present" : "Missing")
    console.log("Publishable key:", publishableKey ? "Present" : "Missing")
    console.log("Request body:", body)

    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      )
    }

    const response = await fetch(
      `${backendUrl}/store/companies/${id}/invite-employee`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-publishable-api-key": publishableKey,
        },
        body: JSON.stringify(body),
      }
    )

    const result = await response.json()

    if (!response.ok) {
      return NextResponse.json(result, { status: response.status })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error forwarding invite request:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
 