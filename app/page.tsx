"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import InfoModal from "./components/InfoModal"
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

interface Prize {
  name: string
  probability: number
  image_url?: string
}

export default function Home() {
  const router = useRouter()
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [showPrizeModal, setShowPrizeModal] = useState(false)
  const [showPrizeSummaryModal, setShowPrizeSummaryModal] = useState(false)
  const [userInfo, setUserInfo] = useState<{ phone: string } | null>(null)
  const [prize, setPrize] = useState<Prize | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [multiDrawPrizes, setMultiDrawPrizes] = useState<string[]>([])
  const [deviceInfo, setDeviceInfo] = useState<any>(null)
  const [currentDrawType, setCurrentDrawType] = useState<"single" | "multi">("single")
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const token = window.localStorage.getItem("authToken")

    if (!token) {
      router.replace("/login")
      return
    }

    const storedPhone = window.localStorage.getItem("userPhone")

    if (storedPhone) {
      setUserInfo({ phone: storedPhone })
      setShowInfoModal(false)
    } else {
      setShowInfoModal(true)
    }

    setIsLoading(false)
    getDeviceInfo().then(setDeviceInfo)

    const initBackgroundMusic = () => {
      // 背景音乐将通过 LuckyCards 组件处理
    }

    initBackgroundMusic()

    return () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause()
        backgroundMusicRef.current.remove()
      }
    }
  }, [router])

  const handleInfoSubmit = async (info: { phone: string }) => {
    setUserInfo(info)
    setShowInfoModal(false)

    if (typeof window !== "undefined") {
      window.localStorage.setItem("userPhone", info.phone)
    }

    try {
      const audio = new Audio()
      audio.volume = 0
      audio.src = "/sounds/draw-sound.mp3"
      await audio.play()
      audio.pause()
      audio.remove()

      if (backgroundMusicRef.current && backgroundMusicRef.current.paused) {
        backgroundMusicRef.current
          .play()
          .catch((e) => console.warn("Background music play after interaction failed:", e))
      }
    } catch (e) {
      console.warn("Failed to play muted audio to unlock context:", e)
    }
  }

  const handlePrizeWon = async (wonPrize: Prize, drawType: "single" | "multi" = "single") => {
    if (!userInfo || !deviceInfo) return

    setPrize(wonPrize)
    setCurrentDrawType(drawType)
    setShowPrizeModal(true)
  }

  const handleMultiDraw = async (prizes: string[]) => {
    setMultiDrawPrizes(prizes)
    setShowPrizeSummaryModal(true)
  }

  const handleConfirm = async (screenshot?: string) => {
    setShowPrizeModal(false)

    if (!userInfo || !deviceInfo || !prize) return

    const date = new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })

    try {
      console.log("Sending telegram message with screenshot:", !!screenshot)

      const response = await fetch("/api/send-telegram-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: userInfo.phone,
          prize: prize.name,
          date,
          deviceInfo,
          screenshot,
          drawType: currentDrawType,
        }),
      })

      const result = await response.json()
      console.log("Telegram API response:", result)

      if (!response.ok) {
        throw new Error(result.error || "Failed to send Telegram message")
      }

      console.log("Message sent successfully!")
    } catch (error) {
      console.error("Error sending Telegram message:", error)
      setError("发送消息时出错: " + (error instanceof Error ? error.message : "未知错误"))
    }
  }

  const handleMultiDrawScreenshot = async (screenshot: string) => {
    if (!userInfo || !deviceInfo) return

    const date = new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })

    try {
      console.log("Sending multi-draw telegram message with screenshot")

      const response = await fetch("/api/send-telegram-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: userInfo.phone,
          prizes: multiDrawPrizes,
          date,
          deviceInfo,
          screenshot,
          drawType: "multi",
        }),
      })

      const result = await response.json()
      console.log("Multi-draw Telegram API response:", result)

      if (!response.ok) {
        throw new Error(result.error || "Failed to send Telegram message")
      }

      console.log("Multi-draw message sent successfully!")
    } catch (error) {
      console.error("Error sending multi-draw Telegram message:", error)
      setError("发送消息时出错: " + (error instanceof Error ? error.message : "未知错误"))
    }
  }

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("authToken")
      window.localStorage.removeItem("userPhone")
    }

    setUserInfo(null)
    setShowInfoModal(false)
    router.replace("/login")
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
      <main className="relative flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-gradient-to-br from-white to-[#E6F3FF] overflow-hidden">
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 rounded-full bg-white/80 px-4 py-2 shadow-lg backdrop-blur">
          {userInfo?.phone && (
            <span className="text-sm font-medium text-[#666666] chinese-text">已登录：{userInfo.phone}</span>
          )}
          <Button
            variant="secondary"
            className="bg-[#999999] text-white hover:bg-[#888888] chinese-text"
            onClick={handleLogout}
          >
            退出登录
          </Button>
        </div>
        <Background3D />
        <ParticleBackground />
        <SnowAnimation />

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
          <LuckyCards canDraw={!!userInfo} onPrizeWon={handlePrizeWon} onMultiDraw={handleMultiDraw} />
        </motion.div>
        <InfoModal isOpen={showInfoModal} onSubmit={handleInfoSubmit} />
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
