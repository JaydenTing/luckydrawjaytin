"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const token = window.localStorage.getItem("authToken")
    if (token) {
      router.replace("/")
    }
  }, [router])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data?.token) {
        setError(data?.message ?? "登录失败，请稍后再试")
        setIsSubmitting(false)
        return
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem("authToken", data.token as string)
        window.localStorage.removeItem("userPhone")
      }

      router.replace("/")
    } catch (err) {
      console.error("Login request failed", err)
      setError("无法连接到服务器，请检查网络后重试")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-[#E6F3FF] p-4">
      <Card className="w-full max-w-md border-[#999999] bg-white/90 shadow-xl shadow-[#999999]/30">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <Image src="/images/jaytin-logo.png" alt="JayTIN Logo" width={180} height={72} priority />
          </div>
          <CardTitle className="text-3xl font-bold text-[#555555] chinese-text">管理员登录</CardTitle>
          <CardDescription className="text-[#777777] chinese-text">
            请输入后台账号和密码以进入抽卡系统
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[#666666] chinese-text">
                账号
              </Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="bg-[#E6F3FF] text-[#555555] focus-visible:ring-[#999999] chinese-text"
                placeholder="请输入账号"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#666666] chinese-text">
                密码
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="bg-[#E6F3FF] text-[#555555] focus-visible:ring-[#999999] chinese-text"
                placeholder="请输入密码"
              />
            </div>
            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-500 chinese-text">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-[#999999] text-white hover:bg-[#888888] chinese-text"
              disabled={isSubmitting}
            >
              {isSubmitting ? "登录中..." : "登录"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
