import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const { username, password, phone } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "用户名和密码不能为空" }, { status: 400 })
    }

    // Check if username already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE username = ${username}
    `

    if (existingUsers.length > 0) {
      return NextResponse.json({ error: "用户名已存在" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO users (username, password, phone, is_admin, balance, is_banned)
      VALUES (${username}, ${password}, ${phone || null}, FALSE, 0, FALSE)
      RETURNING id, username, phone, is_admin, balance, is_banned
    `

    const user = result[0]

    return NextResponse.json({
      success: true,
      user: {
        userId: user.id,
        username: user.username,
        phone: user.phone,
        is_admin: user.is_admin,
        balance: user.balance,
        is_banned: user.is_banned,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "注册失败，请稍后重试" }, { status: 500 })
  }
}
