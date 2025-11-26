import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST(request: Request) {
  try {
    const { secretKey } = await request.json()

    // 安全密钥验证
    if (secretKey !== "JayTIN-Admin-Setup-2024") {
      return NextResponse.json({ error: "密钥错误" }, { status: 403 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    // 创建管理员账户
    await sql`
      INSERT INTO users (username, password, phone, is_admin, draw_chances, is_banned, created_at)
      VALUES ('jaytinclubjaydenting', 'JaydenTing@0307', '0000000000', true, 999999, false, NOW())
      ON CONFLICT (username) DO UPDATE 
      SET is_admin = true, draw_chances = 999999, is_banned = false
    `

    return NextResponse.json({
      success: true,
      message: "管理员账户创建成功",
      username: "jaytinclubjaydenting",
    })
  } catch (error) {
    console.error("创建管理员失败:", error)
    return NextResponse.json({ error: "创建失败" }, { status: 500 })
  }
}
