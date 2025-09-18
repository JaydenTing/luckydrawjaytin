import { NextResponse } from "next/server"

const USERNAME = process.env.LOGIN_USERNAME ?? "admin"
const PASSWORD = process.env.LOGIN_PASSWORD ?? "password123"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "请提供账号和密码" },
        { status: 400 }
      )
    }

    if (username === USERNAME && password === PASSWORD) {
      const tokenPayload = `${username}:${Date.now()}`
      const token = Buffer.from(tokenPayload).toString("base64")

      const response = NextResponse.json({ success: true, token })

      response.cookies.set({
        name: "session-token",
        value: token,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24,
        path: "/",
      })

      return response
    }

    return NextResponse.json(
      { success: false, message: "账号或密码错误" },
      { status: 401 }
    )
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { success: false, message: "登录服务暂时不可用" },
      { status: 500 }
    )
  }
}
