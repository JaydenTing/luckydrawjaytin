import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "用户名和密码不能为空" }, { status: 400 })
    }

    const users = await sql`
      SELECT id, username, phone, is_admin, balance, is_banned, created_at 
      FROM users 
      WHERE username = ${username} AND password = ${password}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 })
    }

    const user = users[0]

    if (user.is_banned) {
      return NextResponse.json({ error: "您的账号已被封禁，请联系管理员" }, { status: 403 })
    }

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
    console.error("Login error:", error)
    return NextResponse.json({ error: "登录失败，请稍后重试" }, { status: 500 })
  }
}
