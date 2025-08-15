"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface PrizeSummaryModalProps {
  isOpen: boolean
  onClose: () => void
  prizes: string[]
  onScreenshotCapture?: (screenshot: string) => void
}

export default function PrizeSummaryModal({ isOpen, onClose, prizes, onScreenshotCapture }: PrizeSummaryModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState("")
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && prizes.length > 0) {
      // 自动开始处理
      handleAutoProcess()
    }
  }, [isOpen, prizes])

  const handleAutoProcess = async () => {
    setIsProcessing(true)
    setProcessingStatus("JayTIN系统记录中...")

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const screenshot = await createMultiDrawScreenshot()

      // 保持同样的状态文本
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (screenshot && onScreenshotCapture) {
        console.log("5连抽截图创建成功，自动发送")
        onScreenshotCapture(screenshot)
      }

      setProcessingStatus("记录完成！")
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error("Error in auto process:", error)
      setProcessingStatus("记录失败，请联系客服")
    } finally {
      setIsProcessing(false)
    }
  }

  const createMultiDrawScreenshot = async (): Promise<string | null> => {
    try {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return null

      // 设置canvas尺寸 - 5连抽需要更高
      canvas.width = 600
      canvas.height = 500

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
      ctx.fillText("🎊 JayTIN 5连抽结果", canvas.width / 2, 50)

      // 绘制时间
      ctx.font = "16px Arial"
      ctx.fillStyle = "#666666"
      const currentTime = new Date().toLocaleString("zh-CN")
      ctx.fillText(`时间: ${currentTime}`, canvas.width / 2, 80)

      // 绘制奖品列表
      let y = 120
      prizes.forEach((prize, index) => {
        // 绘制奖品背景
        ctx.fillStyle = index % 2 === 0 ? "#f0f8ff" : "#E6F3FF"
        ctx.fillRect(30, y - 25, canvas.width - 60, 40)

        // 绘制边框
        ctx.strokeStyle = "#cccccc"
        ctx.lineWidth = 1
        ctx.strokeRect(30, y - 25, canvas.width - 60, 40)

        // 绘制序号
        ctx.fillStyle = "#999999"
        ctx.font = "bold 18px Arial"
        ctx.textAlign = "left"
        ctx.fillText(`${index + 1}.`, 45, y)

        // 绘制奖品名称
        ctx.fillStyle = "#333333"
        ctx.font = "16px Arial"

        // 处理长文本
        const maxWidth = canvas.width - 120
        let prizeName = prize
        if (ctx.measureText(prizeName).width > maxWidth) {
          while (ctx.measureText(prizeName + "...").width > maxWidth && prizeName.length > 0) {
            prizeName = prizeName.slice(0, -1)
          }
          prizeName += "..."
        }

        ctx.fillText(prizeName, 80, y)

        y += 50
      })

      // 绘制网站信息
      ctx.font = "bold 14px Arial"
      ctx.fillStyle = "#999999"
      ctx.textAlign = "center"
      ctx.fillText("JayTIN 官方抽奖系统", canvas.width / 2, canvas.height - 40)
      ctx.fillText("https://jaytin.online/", canvas.width / 2, canvas.height - 20)

      return canvas.toDataURL("image/png", 0.9)
    } catch (error) {
      console.error("Error creating multi-draw screenshot:", error)
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
              5连抽结果
            </DialogTitle>
            <div className="text-sm sm:text-base text-[#999999]/80 chinese-text bg-[#f8fbff] p-2 rounded-lg">
              🕐 抽奖时间：{new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}
            </div>
          </DialogHeader>

          <div className="mt-4 space-y-3 p-4 sm:p-6 bg-gradient-to-br from-[#E6F3FF]/40 to-white/60 rounded-xl border border-[#999999]/20 max-h-[40vh] overflow-y-auto">
            {prizes.map((prize, index) => (
              <div
                key={index}
                className="flex items-center p-3 bg-white/80 rounded-lg shadow-sm border border-[#999999]/10"
              >
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[#999999] to-[#E6F3FF] rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base mr-3">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="chinese-text font-medium text-[#999999] text-sm sm:text-base">
                    第 {index + 1} 次抽奖
                  </span>
                  <div className="font-bold chinese-text text-[#999999] text-base sm:text-lg mt-1 break-words">
                    {prize}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 自动处理状态显示 */}
          {isProcessing && (
            <div className="flex flex-col items-center justify-center mt-6 p-4 bg-gradient-to-r from-[#E6F3FF]/50 to-white/50 rounded-xl border border-[#999999]/20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#999999] mb-3"></div>
              <div className="text-[#999999] chinese-text font-medium text-center">{processingStatus}</div>
            </div>
          )}

          {/* 确认按钮 */}
          <div className="mt-6 flex justify-center">
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-[#999999] to-[#777777] text-white hover:from-[#888888] hover:to-[#666666] transition-all duration-300 chinese-text px-8 py-3 rounded-xl shadow-lg"
            >
              确认
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
