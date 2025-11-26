import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const prizes = await sql`
      SELECT id, name, probability, image_url, cost, created_at
      FROM prizes
      ORDER BY probability DESC
    `

    return NextResponse.json({ prizes })
  } catch (error) {
    console.error("Failed to fetch prizes:", error)
    return NextResponse.json({ error: "Failed to fetch prizes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, probability, image_url, cost } = await request.json()

    await sql`
      INSERT INTO prizes (name, probability, image_url, cost)
      VALUES (${name}, ${probability}, ${image_url}, ${cost || 1.0})
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to add prize:", error)
    return NextResponse.json({ error: "Failed to add prize" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { prizeId } = await request.json()

    await sql`DELETE FROM prizes WHERE id = ${prizeId}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete prize:", error)
    return NextResponse.json({ error: "Failed to delete prize" }, { status: 500 })
  }
}
