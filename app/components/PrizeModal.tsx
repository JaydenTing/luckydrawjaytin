"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import Image from "next/image"

interface Prize {
  name: string
  probability: number
  image_url?: string
}

interface PrizeModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (screenshot?: string) => void
  prize: Prize | null
  drawType?: "single" | "multi"
}

export default function PrizeModal({ isOpen, onClose, onConfirm, prize, drawType = "single" }: PrizeModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState("")
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && prize) {
      // 自动开始处理
      handleAutoProcess()
    }
  }, [isOpen, prize])

  const handleAutoProcess = async () => {
    setIsProcessing(true)
    setProcessingStatus("JayTIN系统记录中...")

    try {
      // 等待一下确保UI稳定
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 创建截图
      const screenshot = await createScreenshotCanvas()

      // 保持同样的状态文本
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (screenshot) {
        console.log("截图创建成功，自动发送")
        onConfirm(screenshot)
      } else {
        console.log("截图创建失败，发送无截图版本")
        onConfirm()
      }

      setProcessingStatus("记录完成！")
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error("Error in auto process:", error)
      setProcessingStatus("记录失败，请联系客服")
      onConfirm()
    } finally {
      setIsProcessing(false)
    }
  }

  const createScreenshotCanvas = async (): Promise<string | null> => {
    try {
      // 创建一个新的canvas来绘制截图
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return null

      // 设置canvas尺寸
      canvas.width = 600
      canvas.height = 400

      // 设置背景
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 绘制边框
      ctx.strokeStyle = "#999999"
      ctx.lineWidth = 3
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)

      // 设置字体
      ctx.fillStyle = "#999999"
      ctx.textAlign = "center"

      // 绘制标题
      ctx.font = "bold 28px Arial"
      ctx.fillText("🎉 JayTIN 抽奖结果", canvas.width / 2, 60)

      // 绘制抽奖类型
      ctx.font = "bold 20px Arial"
      ctx.fillStyle = "#666666"
      ctx.fillText(`抽奖类型: ${drawType === "single" ? "1连抽" : "5连抽"}`, canvas.width / 2, 100)

      // 绘制奖品背景框
      ctx.fillStyle = "#E6F3FF"
      ctx.fillRect(50, 130, canvas.width - 100, 120)
      ctx.strokeStyle = "#999999"
      ctx.lineWidth = 2
      ctx.strokeRect(50, 130, canvas.width - 100, 120)

      // 绘制奖品名称
      ctx.fillStyle = "#333333"
      ctx.font = "bold 24px Arial"

      // 处理长文本换行
      const prizeName = prize?.name || "未知奖品"
      const maxWidth = canvas.width - 120
      const words = prizeName.split("")
      let line = ""
      let y = 180

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i]
        const metrics = ctx.measureText(testLine)

        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(line, canvas.width / 2, y)
          line = words[i]
          y += 30
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, canvas.width / 2, y)

      // 绘制时间
      ctx.font = "16px Arial"
      ctx.fillStyle = "#666666"
      const currentTime = new Date().toLocaleString("zh-CN")
      ctx.fillText(`时间: ${currentTime}`, canvas.width / 2, 300)

      // 绘制网站信息
      ctx.font = "bold 14px Arial"
      ctx.fillStyle = "#999999"
      ctx.fillText("JayTIN 官方抽奖系统", canvas.width / 2, 340)
      ctx.fillText("https://jaytin.online/", canvas.width / 2, 360)

      // 转换为base64
      return canvas.toDataURL("image/png", 0.9)
    } catch (error) {
      console.error("Error creating screenshot canvas:", error)
      return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        ref={modalRef}
        className="sm:max-w-[90vw] max-w-[95vw] w-full max-h-[90vh] bg-white text-[#999999] border-2 border-[#999999] rounded-xl shadow-2xl p-4 sm:p-6 overflow-y-auto"
        style={{
          fontFamily: "YuanQiPaoPao, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif",
        }}
      >
        <div className="relative">
          <DialogHeader className="text-center mb-4">
            <div className="flex items-center justify-center mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#999999]/20 to-[#E6F3FF]/20 rounded-2xl blur-xl"></div>
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/JayTINLogo-fXGIDQS7iZowCQPvATnWsTGvVanHCZ.png"
                  alt="JayTIN Logo"
                  width={120}
                  height={48}
                  className="relative z-10 drop-shadow-lg"
                />
              </div>
            </div>
            <DialogTitle className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#999999] to-[#E6F3FF] chinese-text mb-3">
              恭喜您抽中了奖品！
            </DialogTitle>
            <div className="text-lg sm:text-xl text-[#999999] chinese-text mb-2 p-2 bg-[#E6F3FF]/30 rounded-lg">
              抽奖类型：{drawType === "single" ? "🎯 1连抽" : "🎊 5连抽"}
            </div>
            <DialogDescription className="text-[#999999] opacity-80 chinese-text text-base">
              您获得的奖品如下：
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center my-6 p-4 sm:p-6 bg-gradient-to-br from-[#E6F3FF]/40 to-white/60 rounded-xl border border-[#999999]/20">
            {prize?.image_url && (
              <div className="mb-4 p-3 bg-white rounded-xl shadow-md border border-[#999999]/10">
                <Image
                  src={prize.image_url || "/placeholder.svg"}
                  alt={prize.name}
                  width={150}
                  height={150}
                  className="object-contain"
                  style={{ maxWidth: "150px", maxHeight: "150px" }}
                  priority
                />
              </div>
            )}
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#999999] to-[#E6F3FF] chinese-text mb-4 p-4 bg-white/80 rounded-xl shadow-sm border border-[#999999]/10">
                {prize?.name}
              </div>
              <div className="text-sm sm:text-base text-[#999999]/80 chinese-text bg-[#f8fbff] p-2 rounded-lg">
                🕐 抽奖时间：{new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}
              </div>
            </div>
          </div>

          {/* 自动处理状态显示 */}
          {isProcessing && (
            <div className="flex flex-col items-center justify-center mt-6 p-4 bg-gradient-to-r from-[#E6F3FF]/50 to-white/50 rounded-xl border border-[#999999]/20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#999999] mb-3"></div>
              <div className="text-[#999999] chinese-text font-medium text-center">{processingStatus}</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
