import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { secretKey } = await request.json()

    // Security check - only allow with secret key
    if (secretKey !== "JayTIN-Admin-Setup-2024") {
      return NextResponse.json({ error: "无权限" }, { status: 403 })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash("JaydenTing@0307", 10)

    // Create admin user
    await sql`
      INSERT INTO users (username, password, phone, draw_chances, is_admin, is_banned, created_at)
      VALUES (
        'jaytinclubjaydenting',
        ${hashedPassword},
        '0000000000',
        999999,
        true,
        false,
        NOW()
      )
      ON CONFLICT (username) DO UPDATE
      SET 
        is_admin = true,
        password = ${hashedPassword},
        draw_chances = 999999
    `

    return NextResponse.json({
      success: true,
      message: "管理员账户创建成功",
      username: "jaytinclubjaydenting",
    })
  } catch (error) {
    console.error("Create admin error:", error)
    return NextResponse.json({ error: "创建管理员失败" }, { status: 500 })
  }
}
