import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const prizes = await sql`
      SELECT id, name, probability, image_url
      FROM prizes
      ORDER BY probability DESC
    `

    // Return prizes from database
    return NextResponse.json(prizes)
  } catch (error) {
    console.error("Failed to fetch prizes:", error)
    // Return empty array if no prizes in database
    return NextResponse.json([])
  }
}
