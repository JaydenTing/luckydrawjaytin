"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import LuckyCards from "./components/LuckyCards"
import PrizeModal from "./components/PrizeModal"
import SnowAnimation from "./components/SnowAnimation"
import Background3D from "./components/Background3D"
import ParticleBackground from "./components/ParticleBackground"
import { motion } from "framer-motion"
import PrizeSummaryModal from "./components/PrizeSummaryModal"
import { getDeviceInfo } from "./utils/deviceInfo"
import FontLoader from "./components/FontLoader"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { History, Gift, Wallet } from "lucide-react"

interface Prize {
  name: string
  probability: number
  image_url?: string
  cost?: number
}

interface UserInfo {
  username: string
  phone?: string
  userId: number
  balance: number
  is_banned: boolean
}

export default function Home() {
  const router = useRouter()
  const [showPrizeModal, setShowPrizeModal] = useState(false)
  const [showPrizeSummaryModal, setShowPrizeSummaryModal] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [prize, setPrize] = useState<Prize | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [multiDrawPrizes, setMultiDrawPrizes] = useState<string[]>([])
  const [deviceInfo, setDeviceInfo] = useState<any>(null)
  const [currentDrawType, setCurrentDrawType] = useState<"single" | "multi">("single")
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [myHistory, setMyHistory] = useState<any[]>([])
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const userInfoStr = localStorage.getItem("userInfo")
    if (!userInfoStr) {
      router.push("/login")
      return
    }

    const user = JSON.parse(userInfoStr)

    // Check if user is banned
    if (user.is_banned) {
      alert("您的账号已被封禁，请联系管理员")
      localStorage.removeItem("userInfo")
      router.push("/login")
      return
    }

    setUserInfo(user)
    setIsLoading(false)
    getDeviceInfo().then(setDeviceInfo)
  }, [router])

  const handlePrizeWon = async (wonPrize: Prize, drawType: "single" | "multi" = "single") => {
    if (!userInfo || !deviceInfo) return

    const cost = wonPrize.cost || 1
    if (userInfo.balance < cost) {
      alert(`您的余额不足，需要 ${cost} 元才能抽奖（当前余额：${userInfo.balance} 元）`)
      return
    }

    setPrize(wonPrize)
    setCurrentDrawType(drawType)
    setShowPrizeModal(true)

    try {
      await fetch("/api/user/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userInfo.userId,
          prizeName: wonPrize.name,
          drawType,
          cost,
        }),
      })

      const updatedUser = { ...userInfo, balance: userInfo.balance - cost }
      setUserInfo(updatedUser)
      localStorage.setItem("userInfo", JSON.stringify(updatedUser))
    } catch (error) {
      console.error("Failed to record draw:", error)
    }
  }

  const handleMultiDraw = async (prizes: string[], totalCost: number) => {
    if (!userInfo) return

    if (userInfo.balance < totalCost) {
      alert(`您的余额不足，需要 ${totalCost} 元才能进行5连抽（当前余额：${userInfo.balance} 元）`)
      return
    }

    setMultiDrawPrizes(prizes)
    setShowPrizeSummaryModal(true)

    try {
      await fetch("/api/user/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userInfo.userId,
          prizes,
          drawType: "multi",
          cost: totalCost,
        }),
      })

      const updatedUser = { ...userInfo, balance: userInfo.balance - totalCost }
      setUserInfo(updatedUser)
      localStorage.setItem("userInfo", JSON.stringify(updatedUser))
    } catch (error) {
      console.error("Failed to record multi-draw:", error)
    }
  }

  const handleConfirm = async (screenshot?: string) => {
    setShowPrizeModal(false)

    if (!userInfo || !deviceInfo || !prize) return

    const date = new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })

    try {
      const response = await fetch("/api/send-telegram-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: userInfo.username,
          phone: userInfo.phone || "未提供",
          prize: prize.name,
          date,
          deviceInfo,
          screenshot,
          drawType: currentDrawType,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to send Telegram message")
      }
    } catch (error) {
      console.error("Error sending Telegram message:", error)
      setError("发送消息时出错: " + (error instanceof Error ? error.message : "未知错误"))
    }
  }

  const handleMultiDrawScreenshot = async (screenshot: string) => {
    if (!userInfo || !deviceInfo) return

    const date = new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })

    try {
      const response = await fetch("/api/send-telegram-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: userInfo.username,
          phone: userInfo.phone || "未提供",
          prizes: multiDrawPrizes,
          date,
          deviceInfo,
          screenshot,
          drawType: "multi",
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to send Telegram message")
      }
    } catch (error) {
      console.error("Error sending multi-draw Telegram message:", error)
      setError("发送消息时出错: " + (error instanceof Error ? error.message : "未知错误"))
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("userInfo")
    router.push("/login")
  }

  const loadMyHistory = async () => {
    if (!userInfo) return
    try {
      const response = await fetch(`/api/user/history?userId=${userInfo.userId}`)
      const data = await response.json()
      setMyHistory(data.history || [])
      setShowProfile(true)
    } catch (error) {
      console.error("Failed to load history:", error)
    }
  }

  const toggleMusic = () => {
    if (backgroundMusicRef.current) {
      if (isMusicPlaying) {
        backgroundMusicRef.current.pause()
      } else {
        backgroundMusicRef.current.play()
      }
      setIsMusicPlaying(!isMusicPlaying)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen text-[#999999]">加载中...</div>
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-red-500 p-4">
        <div className="text-center mb-4">{error}</div>
        <button onClick={() => setError(null)} className="bg-[#999999] text-white px-4 py-2 rounded">
          重试
        </button>
      </div>
    )
  }

  return (
    <FontLoader>
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-white overflow-hidden">
        <Background3D />
        <ParticleBackground />
        <SnowAnimation />

        <button
          onClick={toggleMusic}
          className="fixed bottom-4 right-4 z-50 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 hover:bg-white transition-all"
          title={isMusicPlaying ? "关闭音乐" : "播放音乐"}
        >
          {isMusicPlaying ? "🔊" : "🔇"}
        </button>

        <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
          <Button
            onClick={loadMyHistory}
            variant="outline"
            size="sm"
            className="font-yuanqi bg-white/90 backdrop-blur-sm shadow-lg border-gray-200"
          >
            <History className="w-4 h-4 mr-2" />
            我的记录
          </Button>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-gray-200">
            <div className="text-right">
              <p className="text-sm text-gray-900 font-yuanqi">欢迎，{userInfo?.username}</p>
              <p className="text-xs text-gray-600 font-yuanqi flex items-center gap-1 justify-end">
                <Wallet className="w-3 h-3" />
                余额: ¥{Number(userInfo?.balance || 0).toFixed(2)}
              </p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="font-yuanqi bg-white/90 backdrop-blur-sm shadow-lg border-gray-200"
          >
            登出
          </Button>
        </div>

        {showProfile && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-jua text-gray-900">我的抽奖记录</h2>
                <Button onClick={() => setShowProfile(false)} variant="ghost" size="sm">
                  关闭
                </Button>
              </div>
              <div className="space-y-3">
                {myHistory.length === 0 ? (
                  <p className="text-center text-gray-500 font-yuanqi py-8">暂无抽奖记录</p>
                ) : (
                  myHistory.map((record, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Gift className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-yuanqi text-gray-900 font-medium">{record.prize_name}</p>
                          <p className="font-yuanqi text-xs text-gray-600">
                            {new Date(record.created_at).toLocaleString("zh-CN")}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-yuanqi">
                        {record.draw_type === "multi" ? "5连抽" : "单抽"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-[#999999]/20 to-[#E6F3FF]/20 rounded-2xl blur-2xl"></div>
            <Image
              src="/images/jaytin-logo.png"
              alt="JayTIN Logo"
              width={200}
              height={80}
              className="relative z-10 drop-shadow-lg"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 w-full max-w-2xl"
        >
          <LuckyCards
            canDraw={!!userInfo && userInfo.balance > 0}
            onPrizeWon={handlePrizeWon}
            onMultiDraw={handleMultiDraw}
            userBalance={userInfo?.balance || 0}
          />
        </motion.div>

        <PrizeModal
          isOpen={showPrizeModal}
          onClose={() => setShowPrizeModal(false)}
          onConfirm={handleConfirm}
          prize={prize}
          drawType={currentDrawType}
        />
        <PrizeSummaryModal
          isOpen={showPrizeSummaryModal}
          onClose={() => setShowPrizeSummaryModal(false)}
          prizes={multiDrawPrizes}
          onScreenshotCapture={handleMultiDrawScreenshot}
        />
      </main>
    </FontLoader>
  )
}
