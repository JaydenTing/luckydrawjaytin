import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { userId, amount } = await request.json()

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 })
    }

    // Update user balance
    await sql`
      UPDATE users
      SET balance = balance + ${amount}
      WHERE id = ${userId}
    `

    // Record transaction
    await sql`
      INSERT INTO balance_transactions (user_id, amount, type, description)
      VALUES (${userId}, ${amount}, 'admin_add', '管理员充值')
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to add balance:", error)
    return NextResponse.json({ error: "Failed to add balance" }, { status: 500 })
  }
}
