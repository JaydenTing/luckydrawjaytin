"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface InfoModalProps {
  isOpen: boolean
  onSubmit: (info: { username: string; phone?: string; userId: number }) => void
}

export default function InfoModal({ isOpen, onSubmit }: InfoModalProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "登录失败")
        setIsLoading(false)
        return
      }

      onSubmit({
        username: data.user.username,
        phone: data.user.phone,
        userId: data.user.id,
      })
    } catch (err) {
      setError("网络错误，请稍后重试")
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, phone: phone ? `+60${phone}` : null }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "注册失败")
        setIsLoading(false)
        return
      }

      onSubmit({
        username: data.user.username,
        phone: data.user.phone,
        userId: data.user.id,
      })
    } catch (err) {
      setError("网络错误，请稍后重试")
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px] bg-white text-[#999999] border-2 border-[#999999] rounded-xl shadow-2xl shadow-[#999999]/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#999999] to-[#E6F3FF] chinese-text">
            登录系统
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="chinese-text">
              登录
            </TabsTrigger>
            <TabsTrigger value="register" className="chinese-text">
              注册
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="login-username" className="text-[#999999] chinese-text">
                  用户名
                </Label>
                <Input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-[#E6F3FF] text-[#999999] border-[#999999] focus:border-[#999999] focus:ring-[#999999] font-system"
                />
              </div>
              <div>
                <Label htmlFor="login-password" className="text-[#999999] chinese-text">
                  密码
                </Label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-[#E6F3FF] text-[#999999] border-[#999999] focus:border-[#999999] focus:ring-[#999999] font-system"
                />
              </div>
              {error && <p className="text-red-500 text-sm chinese-text">{error}</p>}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#999999] text-white hover:bg-[#888888] transition-colors duration-300 chinese-text"
              >
                {isLoading ? "登录中..." : "登录"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="register-username" className="text-[#999999] chinese-text">
                  用户名
                </Label>
                <Input
                  id="register-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-[#E6F3FF] text-[#999999] border-[#999999] focus:border-[#999999] focus:ring-[#999999] font-system"
                />
              </div>
              <div>
                <Label htmlFor="register-password" className="text-[#999999] chinese-text">
                  密码
                </Label>
                <Input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-[#E6F3FF] text-[#999999] border-[#999999] focus:border-[#999999] focus:ring-[#999999] font-system"
                />
              </div>
              <div>
                <Label htmlFor="register-phone" className="text-[#999999] chinese-text">
                  电话号码（可选）
                </Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md font-system">
                    +60
                  </span>
                  <Input
                    id="register-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-none rounded-r-lg bg-[#E6F3FF] text-[#999999] border-[#999999] focus:border-[#999999] focus:ring-[#999999] font-system"
                  />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm chinese-text">{error}</p>}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#999999] text-white hover:bg-[#888888] transition-colors duration-300 chinese-text"
              >
                {isLoading ? "注册中..." : "注册"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
