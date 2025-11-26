"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import Image from "next/image"
import Background3D from "../components/Background3D"
import ParticleBackground from "../components/ParticleBackground"
import SnowAnimation from "../components/SnowAnimation"

export default function LoginPage() {
  const router = useRouter()
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

      localStorage.setItem("userInfo", JSON.stringify(data.user))

      if (data.user.is_admin) {
        router.push("/admin")
      } else {
        router.push("/")
      }
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

      localStorage.setItem("userInfo", JSON.stringify(data.user))
      router.push("/")
    } catch (err) {
      setError("网络错误，请稍后重试")
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-white overflow-hidden relative">
      <Background3D />
      <ParticleBackground />
      <SnowAnimation />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-5xl"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="flex flex-col md:flex-row min-h-[600px]">
            {/* Left side - Logo */}
            <div className="md:w-1/2 bg-gradient-to-br from-gray-50 to-blue-50 p-12 flex flex-col items-center justify-center">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Image
                  src="/images/jaytin-logo.png"
                  alt="JayTIN Logo"
                  width={300}
                  height={120}
                  className="drop-shadow-lg"
                />
              </motion.div>
            </div>

            {/* Right side - Login Form */}
            <div className="md:w-1/2 p-12 flex flex-col justify-center bg-white">
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="max-w-sm mx-auto w-full"
              >
                <h1 className="text-3xl font-bold text-gray-900 mb-2 font-jua">登录系统</h1>
                <p className="text-gray-600 mb-8 font-yuanqi">请输入您的账号信息</p>

                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100">
                    <TabsTrigger value="login" className="font-yuanqi data-[state=active]:bg-white">
                      登录
                    </TabsTrigger>
                    <TabsTrigger value="register" className="font-yuanqi data-[state=active]:bg-white">
                      注册
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-5">
                      <div>
                        <Label htmlFor="login-username" className="text-gray-700 font-yuanqi text-sm">
                          用户名
                        </Label>
                        <Input
                          id="login-username"
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          className="mt-1.5 h-11 bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500 font-yuanqi"
                          placeholder="请输入用户名"
                        />
                      </div>
                      <div>
                        <Label htmlFor="login-password" className="text-gray-700 font-yuanqi text-sm">
                          密码
                        </Label>
                        <Input
                          id="login-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="mt-1.5 h-11 bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500 font-yuanqi"
                          placeholder="请输入密码"
                        />
                      </div>
                      {error && <p className="text-red-600 text-sm font-yuanqi bg-red-50 p-3 rounded-lg">{error}</p>}
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 bg-blue-600 text-white hover:bg-blue-700 transition-colors font-yuanqi text-base"
                      >
                        {isLoading ? "登录中..." : "登录"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-5">
                      <div>
                        <Label htmlFor="register-username" className="text-gray-700 font-yuanqi text-sm">
                          用户名
                        </Label>
                        <Input
                          id="register-username"
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          className="mt-1.5 h-11 bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500 font-yuanqi"
                          placeholder="请输入用户名"
                        />
                      </div>
                      <div>
                        <Label htmlFor="register-password" className="text-gray-700 font-yuanqi text-sm">
                          密码
                        </Label>
                        <Input
                          id="register-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="mt-1.5 h-11 bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500 font-yuanqi"
                          placeholder="请输入密码"
                        />
                      </div>
                      <div>
                        <Label htmlFor="register-phone" className="text-gray-700 font-yuanqi text-sm">
                          电话号码（可选）
                        </Label>
                        <div className="flex mt-1.5">
                          <span className="inline-flex items-center px-4 text-sm text-gray-700 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg font-yuanqi">
                            +60
                          </span>
                          <Input
                            id="register-phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="rounded-l-none h-11 bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500 font-yuanqi"
                            placeholder="1234567890"
                          />
                        </div>
                      </div>
                      {error && <p className="text-red-600 text-sm font-yuanqi bg-red-50 p-3 rounded-lg">{error}</p>}
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 bg-blue-600 text-white hover:bg-blue-700 transition-colors font-yuanqi text-base"
                      >
                        {isLoading ? "注册中..." : "注册"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  )
}
