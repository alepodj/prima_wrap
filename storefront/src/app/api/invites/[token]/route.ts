import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const backendUrl =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

    const response = await fetch(`${backendUrl}/store/invites/${token}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key":
          process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
      },
    })

    const result = await response.json()

    if (!response.ok) {
      return NextResponse.json(result, { status: response.status })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching invite:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
