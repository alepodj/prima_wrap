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

    // Get JWT token from cookies
    const cookieStore = await cookies()
    const jwtToken = cookieStore.get("_medusa_jwt")?.value
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

    console.log("Frontend API Route Debug (Resend):")
    console.log("Company ID:", id)
    console.log("JWT token from cookies:", jwtToken ? "Present" : "Missing")
    console.log("Publishable key:", publishableKey ? "Present" : "Missing")
    console.log("Request body:", body)

    if (!jwtToken) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      )
    }

    const response = await fetch(
      `${backendUrl}/store/companies/${id}/resend-invite`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
          "x-publishable-api-key": publishableKey,
        },
        body: JSON.stringify(body),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in resend invite API route:", error)
    return NextResponse.json(
      { message: "An unknown error occurred." },
      { status: 500 }
    )
  }
}
