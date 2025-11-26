"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function SetupAdminPage() {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSetup = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/setup-simple", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`✅ ${data.message}\n用户名: ${data.username}\n密码: ${data.password}`)
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (error) {
      setMessage("❌ 设置失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">创建管理员账户</h1>

        <div className="space-y-4">
          <Button
            onClick={handleSetup}
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-6 text-lg"
          >
            {loading ? "创建中..." : "创建管理员账户 (admin/admin)"}
          </Button>

          {message && (
            <div className="mt-4 p-4 bg-white/20 rounded-lg">
              <pre className="text-white text-sm whitespace-pre-wrap">{message}</pre>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-500/20 rounded-lg border border-blue-400/30">
            <p className="text-white/90 text-sm">
              <strong>管理员账户信息：</strong>
              <br />
              用户名: admin
              <br />
              密码: admin
              <br />
              抽奖次数: 999999
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
