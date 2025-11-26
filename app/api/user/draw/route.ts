import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { userId, prizeName, prizes, drawType, cost } = await request.json()

    if (drawType === "multi") {
      await sql`
        UPDATE users
        SET balance = balance - ${cost}
        WHERE id = ${userId} AND balance >= ${cost}
      `

      // Record balance transaction
      await sql`
        INSERT INTO balance_transactions (user_id, amount, type, description)
        VALUES (${userId}, ${cost}, 'draw_deduct', '5连抽消费')
      `

      // Record each prize in history
      for (const prize of prizes) {
        await sql`
          INSERT INTO draw_history (user_id, prize_name, draw_type)
          VALUES (${userId}, ${prize}, 'multi')
        `
      }
    } else {
      await sql`
        UPDATE users
        SET balance = balance - ${cost}
        WHERE id = ${userId} AND balance >= ${cost}
      `

      // Record balance transaction
      await sql`
        INSERT INTO balance_transactions (user_id, amount, type, description)
        VALUES (${userId}, ${cost}, 'draw_deduct', ${"单抽消费 - " + prizeName})
      `

      // Record in history
      await sql`
        INSERT INTO draw_history (user_id, prize_name, draw_type)
        VALUES (${userId}, ${prizeName}, 'single')
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to record draw:", error)
    return NextResponse.json({ error: "Failed to record draw" }, { status: 500 })
  }
}
