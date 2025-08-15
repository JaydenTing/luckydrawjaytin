"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import confetti from "canvas-confetti"
import { Sparkles, Zap, Star } from "lucide-react"
import Image from "next/image"

interface Prize {
  id: string
  name: string
  probability: number
}

interface LuckyCardsProps {
  canDraw: boolean
  onPrizeWon: (prize: Prize, drawType?: "single" | "multi") => void
  onMultiDraw: (prizes: string[]) => void
}

export default function LuckyCards({ canDraw, onPrizeWon, onMultiDraw }: LuckyCardsProps) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [revealedPrize, setRevealedPrize] = useState<string | null>(null)
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [skipAnimation, setSkipAnimation] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [soundVolume, setSoundVolume] = useState(0.5) // 50%
  const [musicEnabled, setMusicEnabled] = useState(true)
  const [musicVolume, setMusicVolume] = useState(0.3) // 30%

  const audioContextRef = useRef<AudioContext | null>(null)
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const initializeAudio = () => {
      try {
        // 初始化背景音乐
        backgroundMusicRef.current = new Audio("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E6%98%9F%E6%98%9F%E4%B8%AD%E7%9A%84wa-ueR3hUCAzNHBRfaP6be47zwvNLtLiu.mp3")
        if (backgroundMusicRef.current) {
          backgroundMusicRef.current.loop = true
          backgroundMusicRef.current.volume = musicVolume

          // 添加错误处理
          backgroundMusicRef.current.addEventListener("error", (e) => {
            console.error("Background music loading error:", e)
          })

          backgroundMusicRef.current.addEventListener("canplaythrough", () => {
            console.log("Background music loaded successfully")
          })
        }

        // 初始化 Web Audio Context
        const createAudioContext = () => {
          if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
            console.log("Audio context created successfully")
          }
        }

        const handleFirstClick = () => {
          createAudioContext()
          // 尝试播放背景音乐
          if (musicEnabled && backgroundMusicRef.current) {
            backgroundMusicRef.current.play().catch((e) => {
              console.warn("Background music autoplay failed:", e)
            })
          }
          document.removeEventListener("click", handleFirstClick)
        }

        document.addEventListener("click", handleFirstClick)

        return () => {
          document.removeEventListener("click", handleFirstClick)
          if (backgroundMusicRef.current) {
            backgroundMusicRef.current.pause()
            backgroundMusicRef.current.remove()
          }
        }
      } catch (error) {
        console.error("Audio initialization failed:", error)
      }
    }

    initializeAudio()
  }, [])

  // 控制背景音乐播放/暂停
  useEffect(() => {
    if (backgroundMusicRef.current) {
      if (musicEnabled) {
        backgroundMusicRef.current.play().catch((e) => {
          console.warn("Background music play failed:", e)
        })
      } else {
        backgroundMusicRef.current.pause()
      }
    }
  }, [musicEnabled])

  // 控制背景音乐音量
  useEffect(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = musicVolume
    }
  }, [musicVolume])

  const playDrawSound = useCallback(() => {
    if (!soundEnabled || !audioContextRef.current) return

    try {
      const ctx = audioContextRef.current

      // 创建一个更好听的抽卡音效 - 类似星星闪烁的声音
      const createSparkleSound = (frequency: number, startTime: number, duration: number, volume: number) => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()
        const filter = ctx.createBiquadFilter()

        oscillator.connect(filter)
        filter.connect(gainNode)
        gainNode.connect(ctx.destination)

        // 设置滤波器让声音更清脆
        filter.type = "highpass"
        filter.frequency.setValueAtTime(200, startTime)

        oscillator.frequency.setValueAtTime(frequency, startTime)
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 2, startTime + duration * 0.3)
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.5, startTime + duration)

        gainNode.gain.setValueAtTime(0, startTime)
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

        oscillator.type = "sine"
        oscillator.start(startTime)
        oscillator.stop(startTime + duration)
      }

      const now = ctx.currentTime
      // 创建多层次的星星音效
      createSparkleSound(800, now, 0.3, soundVolume * 0.3)
      createSparkleSound(1200, now + 0.1, 0.25, soundVolume * 0.25)
      createSparkleSound(1600, now + 0.15, 0.2, soundVolume * 0.2)

      console.log("Draw sound played successfully")
    } catch (error) {
      console.error("Error playing draw sound:", error)
    }
  }, [soundEnabled, soundVolume])

  const playWinSound = useCallback(() => {
    if (!soundEnabled || !audioContextRef.current) return

    try {
      const ctx = audioContextRef.current

      // 创建更华丽的获奖音效
      const playMagicalTone = (frequency: number, startTime: number, duration: number, volume: number) => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()
        const filter = ctx.createBiquadFilter()

        oscillator.connect(filter)
        filter.connect(gainNode)
        gainNode.connect(ctx.destination)

        filter.type = "lowpass"
        filter.frequency.setValueAtTime(2000, startTime)
        filter.frequency.exponentialRampToValueAtTime(4000, startTime + duration)

        oscillator.frequency.setValueAtTime(frequency, startTime)
        oscillator.type = "triangle"

        gainNode.gain.setValueAtTime(0, startTime)
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.02)
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

        oscillator.start(startTime)
        oscillator.stop(startTime + duration)
      }

      // 播放魔法般的获奖音效序列
      const now = ctx.currentTime
      playMagicalTone(523, now, 0.4, soundVolume * 0.3) // C5
      playMagicalTone(659, now + 0.1, 0.4, soundVolume * 0.25) // E5
      playMagicalTone(784, now + 0.2, 0.5, soundVolume * 0.3) // G5
      playMagicalTone(1047, now + 0.3, 0.6, soundVolume * 0.35) // C6
      playMagicalTone(1319, now + 0.4, 0.4, soundVolume * 0.25) // E6

      console.log("Win sound played successfully")
    } catch (error) {
      console.error("Error playing win sound:", error)
    }
  }, [soundEnabled, soundVolume])

  // 硬编码奖品数据 (25张卡牌)
  const defaultPrizes: Prize[] = [
    { id: "1", name: "小礼物（RM1–10）", probability: 0.003 },
    { id: "2", name: "小礼包（RM10–20）", probability: 0.002 },
    { id: "3", name: "大礼物（RM20–30）", probability: 0.0002 },
    { id: "4", name: "大礼包（RM30–40）", probability: 0.0003 },
    { id: "5", name: "香氛系列沐浴露", probability: 0.0002 },
    { id: "6", name: "JAYTIN V1 会员（1天）", probability: 0.04 },
    { id: "7", name: "JAYTIN V2 会员（1天）", probability: 0.007 },
    { id: "8", name: "JAYTIN V1 会员（30天）", probability: 0.002 },
    { id: "9", name: "JAYTIN V2 会员（30天）", probability: 0.002 },
    { id: "10", name: "下单享 1% 现金返还", probability: 0.2 },
    { id: "11", name: "RM0.01 现金返还", probability: 0.2 },
    { id: "12", name: "RM1 现金返还", probability: 0.05 },
    { id: "13", name: "免邮券（满 RM50 可用）", probability: 0.0507 },
    { id: "14", name: "JAYTIN 产品优惠券 RM50（满 RM100 可用）", probability: 0.007 },
    { id: "15", name: "JAYTIN 产品优惠券 RM100（满 RM200 可用）", probability: 0.007 },
    { id: "16", name: "JAYTIN 产品优惠券 RM200（满 RM300 可用）", probability: 0.007 },
    { id: "17", name: "JAYTIN 产品优惠券 RM300（满 RM400 可用）", probability: 0.007 },
    { id: "18", name: "免单（RM10–RM15）", probability: 0.0002 },
    { id: "19", name: "无门槛优惠券 RM5", probability: 0.002 },
    { id: "20", name: "圣诞节特别活动群（限量）", probability: 0.007 },
    { id: "21", name: "重新抽奖机会", probability: 0.005 },
    { id: "22", name: "荣耀奖品已封仓", probability: 0.4 },
    { id: "23", name: "免费衣服（好质量）", probability: 0.0002 },
    { id: "24", name: "免费裤子（好质量）", probability: 0.0002 },
    { id: "25", name: "免费电竞椅（RM1k）", probability: 0 },
  ]

  const selectPrize = useCallback((): Prize => {
    const randomValue = Math.random()
    let cumulativeProbability = 0
    for (const prize of defaultPrizes) {
      cumulativeProbability += prize.probability
      if (randomValue < cumulativeProbability) {
        return prize
      }
    }
    return defaultPrizes[defaultPrizes.length - 1]
  }, [])

  const generatePrizes = useCallback(() => {
    const newPrizes = Array(6)
      .fill(null)
      .map(() => selectPrize())
    setPrizes(newPrizes)
  }, [selectPrize])

  useEffect(() => {
    if (canDraw) {
      generatePrizes()
    }
  }, [canDraw, generatePrizes])

  const shufflePrizes = useCallback(() => {
    const shuffled = [...prizes]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setPrizes(shuffled)
  }, [prizes])

  const cardVariants = {
    hidden: {
      rotateY: 0,
      scale: 1,
      rotateZ: 0,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    visible: {
      rotateY: 180,
      scale: [1, 1.1, 1.05],
      rotateZ: [0, 10, 5],
      y: [0, -20, -10],
      transition: {
        duration: 2.0,
        ease: "easeInOut",
        times: [0, 0.5, 1],
      },
    },
    dimmed: {
      opacity: 0.6,
      scale: 0.95,
      filter: "blur(2px)",
      transition: { duration: 0.3 },
    },
    normal: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 0.3 },
    },
  }

  const handleCardClick = async (index: number) => {
    if (!canDraw || isDrawing || selectedCard !== null) return

    setIsDrawing(true)
    playDrawSound()
    setSelectedCard(index)

    if (!skipAnimation) {
      await new Promise((resolve) => setTimeout(resolve, 2200))
    }

    // 无论点击哪张卡牌，都显示和发送"荣耀奖品已封仓"
    const fixedPrize = defaultPrizes.find((p) => p.name === "荣耀奖品已封仓") || defaultPrizes[21]
    setRevealedPrize(fixedPrize.name)
    onPrizeWon(fixedPrize, "single") // 标记为单次抽奖
    playWinSound()

    if (!skipAnimation) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        })
      }, 250)

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        })
      }, 400)

      await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    await resetCards()
    setIsDrawing(false)
  }

  const resetCards = useCallback(() => {
    return new Promise<void>((resolve) => {
      setIsRefreshing(true)
      setTimeout(
        () => {
          setSelectedCard(null)
          setRevealedPrize(null)
          generatePrizes()
          shufflePrizes()
          setIsRefreshing(false)
          resolve()
        },
        skipAnimation ? 0 : 500,
      )
    })
  }, [generatePrizes, shufflePrizes, skipAnimation])

  const handleSingleDraw = async () => {
    if (isDrawing) return

    // 1连抽直接给"荣耀奖品已封仓"
    const fixedPrize = defaultPrizes.find((p) => p.name === "荣耀奖品已封仓") || defaultPrizes[21]

    setIsDrawing(true)
    playDrawSound()

    // 随机选择一张卡牌来显示动画
    const randomIndex = Math.floor(Math.random() * prizes.length)
    setSelectedCard(randomIndex)

    if (!skipAnimation) {
      await new Promise((resolve) => setTimeout(resolve, 2200))
    }

    // 显示"荣耀奖品已封仓"
    setRevealedPrize(fixedPrize.name)
    // 发送给后端的也是"荣耀奖品已封仓"
    onPrizeWon(fixedPrize, "single") // 标记为单次抽奖
    playWinSound()

    if (!skipAnimation) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        })
      }, 250)

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        })
      }, 400)

      await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    await resetCards()
    setIsDrawing(false)
  }

  const handleMultiDraw = async () => {
    if (isDrawing) return
    setIsDrawing(true)
    const drawnPrizes: string[] = []

    // 5连抽：前3个必定是"荣耀奖品已封仓"，后2个按概率抽取
    for (let i = 0; i < 5; i++) {
      playDrawSound()
      const randomIndex = Math.floor(Math.random() * prizes.length)

      let prize: Prize
      if (i < 3) {
        // 前3个必定是"荣耀奖品已封仓"
        prize = defaultPrizes.find((p) => p.name === "荣耀奖品已封仓") || defaultPrizes[21]
      } else {
        // 后2个按正常概率抽取
        prize = prizes[randomIndex]
      }

      drawnPrizes.push(prize.name)

      setSelectedCard(randomIndex)
      setRevealedPrize(null)

      if (!skipAnimation) {
        await new Promise((resolve) => setTimeout(resolve, 2200))
        setRevealedPrize(prize.name)

        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        })

        await new Promise((resolve) => setTimeout(resolve, 2000))
      } else {
        setRevealedPrize(prize.name)
      }

      await resetCards()
    }

    setIsDrawing(false)
    onMultiDraw(drawnPrizes)
    playWinSound()
  }

  const refreshVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  }

  return (
    <Card
      className="w-full max-w-4xl mx-auto bg-gradient-to-br from-white/40 via-[#E6F3FF]/30 to-white/40 backdrop-blur-xl border-2 border-[#999999]/20 rounded-2xl shadow-2xl shadow-[#999999]/10 relative overflow-hidden"
      style={{ animation: "float 6s ease-in-out infinite" }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#999999]/30 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#999999]/30 to-transparent"></div>

      <CardContent className="p-8 relative z-10">
        <div className="relative w-full h-full" style={{ transformStyle: "preserve-3d" }}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6 mb-6">
            <AnimatePresence>
              {prizes.map((prize, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  animate={
                    selectedCard === index ? "visible" : isDrawing && selectedCard !== null ? "dimmed" : "normal"
                  }
                  variants={cardVariants}
                  whileHover={
                    canDraw && selectedCard === null
                      ? {
                          scale: 1.08,
                          rotateY: 8,
                          boxShadow: "0 25px 35px -8px rgba(0, 0, 0, 0.15), 0 15px 15px -8px rgba(0, 0, 0, 0.08)",
                          y: -8,
                        }
                      : {}
                  }
                  whileTap={canDraw && selectedCard === null ? { scale: 0.92 } : {}}
                  className={`aspect-[3/4] bg-gradient-to-br from-[#f8fbff] via-[#E6F3FF] to-[#e0f0ff] rounded-xl border-2 border-[#999999]/30 shadow-xl shadow-[#999999]/10 flex items-center justify-center text-[#999999] text-xl font-bold overflow-hidden relative transition-all duration-300 ${
                    canDraw && selectedCard === null
                      ? "hover:border-[#999999] hover:shadow-2xl hover:shadow-[#999999]/20 hover:scale-[1.02] cursor-pointer"
                      : "opacity-60 cursor-not-allowed"
                  }`}
                  onClick={() => handleCardClick(index)}
                  style={{
                    perspective: "1000px",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {canDraw && selectedCard === null && (
                    <motion.div
                      className="absolute inset-0 rounded-xl border-2 border-transparent"
                      whileHover={{ borderColor: "#999999", transition: { duration: 0.2 } }}
                    />
                  )}

                  {canDraw && selectedCard === null && (
                    <>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{
                          x: ["-100%", "100%"],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatDelay: 4,
                        }}
                      />
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-45 from-transparent via-[#E6F3FF]/20 to-transparent"
                        animate={{
                          rotate: [0, 360],
                        }}
                        transition={{
                          duration: 8,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "linear",
                        }}
                      />
                    </>
                  )}

                  <div
                    className="relative w-full h-full"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: selectedCard === index ? "rotateY(180deg)" : "rotateY(0deg)",
                    }}
                  >
                    <div
                      className="absolute w-full h-full flex flex-col items-center justify-center backface-hidden bg-gradient-to-br from-[#E6F3FF] via-white to-[#f0f8ff] border-2 border-[#999999]/20 rounded-lg"
                      style={{
                        backfaceVisibility: "hidden",
                        boxShadow: "inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div className="absolute top-2 left-2 right-2 h-1 bg-gradient-to-r from-transparent via-[#999999]/30 to-transparent rounded-full"></div>

                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 150 }}
                        className="relative mb-3"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#999999]/20 to-[#E6F3FF]/20 rounded-full blur-lg"></div>
                        <Image
                          src="/images/jaytin-logo.png"
                          alt="JayTIN Logo"
                          width={80}
                          height={30}
                          className="relative z-10 drop-shadow-sm animate-pulse-subtle"
                        />
                      </motion.div>

                      <div className="flex items-center space-x-2 mb-2">
                        <Sparkles className="w-4 h-4 text-[#999999] animate-pulse" />
                        <div className="w-8 h-0.5 bg-gradient-to-r from-[#999999] to-[#E6F3FF] rounded-full"></div>
                        <Sparkles className="w-4 h-4 text-[#999999] animate-pulse" style={{ animationDelay: "0.5s" }} />
                      </div>

                      <div className="absolute bottom-2 left-2 right-2 h-1 bg-gradient-to-r from-transparent via-[#999999]/30 to-transparent rounded-full"></div>

                      <div className="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2 border-[#999999]/30 rounded-tl-lg"></div>
                      <div className="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2 border-[#999999]/30 rounded-tr-lg"></div>
                      <div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2 border-[#999999]/30 rounded-bl-lg"></div>
                      <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-[#999999]/30 rounded-br-lg"></div>
                    </div>

                    <div
                      className="absolute w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#f8fbff] via-[#E6F3FF] to-[#e0f0ff] text-[#999999] p-3 text-center border-2 border-[#999999]/20 rounded-lg"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        boxShadow: "inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent rounded-lg"></div>

                      <AnimatePresence>
                        {selectedCard === index && revealedPrize !== null ? (
                          <motion.div
                            key="prize-content"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 150 }}
                            className="relative z-10 flex flex-col items-center"
                          >
                            <div
                              className="bg-white/50 backdrop-blur-sm rounded-lg p-2 border border-white/30"
                              style={{ transform: "scaleX(-1)" }}
                            >
                              <span className="text-sm font-bold text-[#999999] max-w-full break-words chinese-text leading-tight drop-shadow-sm">
                                {revealedPrize}
                              </span>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="logo-back"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 150 }}
                            className="relative z-10 flex flex-col items-center"
                          >
                            <Image
                              src="/images/jaytin-logo.png"
                              alt="JayTIN Logo"
                              width={100}
                              height={40}
                              className="relative z-10 drop-shadow-sm animate-pulse-subtle"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <Star
                        className="absolute top-2 right-2 w-3 h-3 text-[#999999]/40 animate-spin"
                        style={{ animationDuration: "4s" }}
                      />
                      <Star
                        className="absolute bottom-2 left-2 w-3 h-3 text-[#999999]/40 animate-spin"
                        style={{ animationDuration: "6s", animationDirection: "reverse" }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex space-x-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleSingleDraw}
                  className="bg-gradient-to-r from-[#999999] to-[#777777] text-white hover:from-[#888888] hover:to-[#666666] transition-all duration-300 chinese-text w-32 h-12 relative overflow-hidden shadow-lg border-2 border-white/20 rounded-xl"
                  disabled={isDrawing || !canDraw}
                >
                  {!isDrawing && canDraw && (
                    <>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{
                          x: ["-100%", "100%"],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatDelay: 3,
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl"></div>
                    </>
                  )}
                  <div className="relative z-10 flex items-center">
                    <Zap className="w-5 h-5 mr-2 drop-shadow-sm" />
                    <span className="font-bold">1连抽</span>
                  </div>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleMultiDraw}
                  className="bg-gradient-to-r from-[#999999] to-[#777777] text-white hover:from-[#888888] hover:to-[#666666] transition-all duration-300 chinese-text w-32 h-12 relative overflow-hidden shadow-lg border-2 border-white/20 rounded-xl"
                  disabled={isDrawing || !canDraw}
                >
                  {!isDrawing && canDraw && (
                    <>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{
                          x: ["-100%", "100%"],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatDelay: 3,
                          delay: 0.7,
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-xl"></div>
                    </>
                  )}
                  <div className="relative z-10 flex items-center">
                    <Star className="w-5 h-5 mr-2 drop-shadow-sm" />
                    <span className="font-bold">5连抽</span>
                  </div>
                </Button>
              </motion.div>
            </div>
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <span className="text-[#999999] chinese-text text-sm">跳过动画</span>
              <Switch checked={skipAnimation} onCheckedChange={setSkipAnimation} className="scale-75" />
            </div>
          </div>
          {isRefreshing && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={refreshVariants}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-xl"
            >
              <div className="text-4xl text-[#999999] font-bold animate-pulse chinese-text">刷新中...</div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
