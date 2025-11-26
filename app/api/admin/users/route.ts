import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const users = await sql`
      SELECT id, username, phone, balance, is_banned, created_at
      FROM users
      WHERE is_admin = FALSE
      ORDER BY created_at DESC
    `

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, balance, is_banned } = await request.json()

    if (balance !== undefined) {
      await sql`
        UPDATE users
        SET balance = ${balance}
        WHERE id = ${userId}
      `
    }

    if (is_banned !== undefined) {
      await sql`
        UPDATE users
        SET is_banned = ${is_banned}
        WHERE id = ${userId}
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json()

    await sql`DELETE FROM users WHERE id = ${userId}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
