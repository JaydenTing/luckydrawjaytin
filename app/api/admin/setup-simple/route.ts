import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Create users table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        is_admin BOOLEAN DEFAULT false,
        draw_chances INTEGER DEFAULT 0,
        is_banned BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    // Insert or update admin user
    await sql`
      INSERT INTO users (username, password, phone, is_admin, draw_chances, is_banned)
      VALUES ('admin', 'admin', '0000000000', true, 999999, false)
      ON CONFLICT (username) 
      DO UPDATE SET is_admin = true, draw_chances = 999999, is_banned = false
    `

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      username: "admin",
      password: "admin",
    })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
