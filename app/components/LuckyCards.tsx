"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import confetti from "canvas-confetti"
import { Sparkles } from "lucide-react"
import Image from "next/image"

interface Prize {
  id: string
  name: string
  probability: number
  cost?: number
}

interface LuckyCardsProps {
  canDraw: boolean
  onPrizeWon: (prize: Prize, drawType?: "single" | "multi") => void
  onMultiDraw: (prizes: string[], totalCost: number) => void
  userBalance: number
}

export default function LuckyCards({ canDraw, onPrizeWon, onMultiDraw, userBalance }: LuckyCardsProps) {
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
  const [singleDrawCount, setSingleDrawCount] = useState(0)
  const [dbPrizes, setDbPrizes] = useState<Prize[]>([])

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState<"single" | "multi" | "card" | null>(null)
  const [confirmCost, setConfirmCost] = useState(0)
  const [pendingCardIndex, setPendingCardIndex] = useState<number | null>(null)

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

  useEffect(() => {
    const fetchPrizes = async () => {
      try {
        const response = await fetch("/api/prizes")
        const data = await response.json()
        if (data && data.length > 0) {
          const formattedPrizes = data.map((p: any) => ({
            id: p.id.toString(),
            name: p.name,
            probability: p.probability / 100,
            cost: p.cost || 1.0,
          }))
          setDbPrizes(formattedPrizes)
        }
      } catch (error) {
        console.error("Failed to fetch prizes:", error)
      }
    }
    fetchPrizes()
  }, [])

  const playDrawSound = useCallback(() => {
    if (!soundEnabled || !audioContextRef.current) return

    try {
      const ctx = audioContextRef.current

      const createSparkleSound = (frequency: number, startTime: number, duration: number, volume: number) => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()
        const filter = ctx.createBiquadFilter()

        oscillator.connect(filter)
        filter.connect(gainNode)
        gainNode.connect(ctx.destination)

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

  const selectPrize = useCallback((): Prize => {
    const prizesToUse = dbPrizes.length > 0 ? dbPrizes : defaultPrizes
    const randomValue = Math.random()
    let cumulativeProbability = 0
    for (const prize of prizesToUse) {
      cumulativeProbability += prize.probability
      if (randomValue < cumulativeProbability) {
        return prize
      }
    }
    return prizesToUse[prizesToUse.length - 1]
  }, [dbPrizes])

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

    const cost = prizes[0]?.cost || 1
    setPendingCardIndex(index)
    setConfirmCost(cost)
    setConfirmAction("card")
    setShowConfirmModal(true)
  }

  const executeCardClick = async () => {
    if (pendingCardIndex === null) return
    const index = pendingCardIndex

    setIsDrawing(true)
    playDrawSound()
    setSelectedCard(index)

    if (!skipAnimation) {
      await new Promise((resolve) => setTimeout(resolve, 2200))
    }

    let selectedPrize: Prize

    if (singleDrawCount < 3) {
      selectedPrize = defaultPrizes.find((p) => p.name === "荣耀奖品已封仓") || defaultPrizes[21]
      setSingleDrawCount(singleDrawCount + 1)
    } else {
      selectedPrize = selectPrize()
      setSingleDrawCount(0)
    }

    setRevealedPrize(selectedPrize.name)
    onPrizeWon(selectedPrize, "single")
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
    setPendingCardIndex(null)
  }

  const handleSingleDraw = async () => {
    if (isDrawing) return

    const cost = prizes[0]?.cost || 1
    setConfirmCost(cost)
    setConfirmAction("single")
    setShowConfirmModal(true)
  }

  const executeSingleDraw = async () => {
    setIsDrawing(true)
    playDrawSound()

    const randomIndex = Math.floor(Math.random() * prizes.length)
    setSelectedCard(randomIndex)

    let selectedPrize: Prize

    if (singleDrawCount < 3) {
      selectedPrize = defaultPrizes.find((p) => p.name === "荣耀奖品已封仓") || defaultPrizes[21]
      setSingleDrawCount(singleDrawCount + 1)
    } else {
      selectedPrize = selectPrize()
      setSingleDrawCount(0)
    }

    if (!skipAnimation) {
      await new Promise((resolve) => setTimeout(resolve, 2200))
    }

    setRevealedPrize(selectedPrize.name)
    onPrizeWon(selectedPrize, "single")
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

    const totalCost = 5.0
    setConfirmCost(totalCost)
    setConfirmAction("multi")
    setShowConfirmModal(true)
  }

  const executeMultiDraw = async () => {
    const totalCost = 5.0
    const balance = Number(userBalance) || 0

    if (balance < totalCost) {
      alert(`您的余额不足，需要 ¥${totalCost} 才能进行5连抽（当前余额：¥${balance.toFixed(2)}）`)
      return
    }

    setIsDrawing(true)
    const drawnPrizes: string[] = []

    const normalPrizes = Array(5)
      .fill(null)
      .map(() => selectPrize())

    const fixedPrize = defaultPrizes.find((p) => p.name === "荣耀奖品已封仓") || defaultPrizes[0]
    const fixedPositions: number[] = []
    while (fixedPositions.length < 2) {
      const randomPos = Math.floor(Math.random() * 5)
      if (!fixedPositions.includes(randomPos)) {
        fixedPositions.push(randomPos)
      }
    }

    fixedPositions.forEach((pos) => {
      normalPrizes[pos] = fixedPrize
    })

    for (let i = 0; i < 5; i++) {
      playDrawSound()
      const randomIndex = Math.floor(Math.random() * prizes.length)

      const prize = normalPrizes[i]
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
    onMultiDraw(drawnPrizes, totalCost)
    playWinSound()

    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 },
    })
  }

  const handleConfirm = () => {
    setShowConfirmModal(false)
    if (confirmAction === "single") {
      executeSingleDraw()
    } else if (confirmAction === "multi") {
      executeMultiDraw()
    } else if (confirmAction === "card") {
      executeCardClick()
    }
  }

  const handleCancel = () => {
    setShowConfirmModal(false)
    setConfirmAction(null)
    setPendingCardIndex(null)
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

  const refreshVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  }

  const defaultPrizes: Prize[] = [{ id: "22", name: "荣耀奖品已封仓", probability: 0.4, cost: 1.0 }]

  return (
    <div className="relative">
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
                          <Sparkles
                            className="w-4 h-4 text-[#999999] animate-pulse"
                            style={{ animationDelay: "0.5s" }}
                          />
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
                              initial={{ scale: 0.8, opacity: 0 }}
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
                    disabled={!canDraw || isDrawing || userBalance < 1}
                    className="w-full sm:w-auto px-8 py-6 text-lg font-bold bg-gradient-to-r from-[#999999] to-[#E6F3FF] hover:from-[#888888] hover:to-[#d6e9ff] text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl font-jua disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    1连抽 (¥1.00)
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleMultiDraw}
                    disabled={!canDraw || isDrawing || userBalance < 5}
                    className="w-full sm:w-auto px-8 py-6 text-lg font-bold bg-gradient-to-r from-[#999999] via-[#E6F3FF] to-[#999999] hover:from-[#888888] hover:via-[#d6e9ff] hover:to-[#888888] text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl font-jua disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    5连抽 (¥5.00)
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

      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCancel}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold font-jua text-gray-900 mb-2">确认抽奖</h3>
                <p className="text-gray-600 font-yuanqi">
                  {confirmAction === "multi" ? "确认进行5连抽吗？" : "确认进行抽奖吗？"}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 font-yuanqi">当前余额</span>
                  <span className="text-lg font-bold font-jua text-gray-900">
                    ¥{(Number(userBalance) || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 font-yuanqi">抽奖费用</span>
                  <span className="text-lg font-bold font-jua text-red-600">-¥{confirmCost.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 font-yuanqi font-medium">剩余余额</span>
                    <span className="text-xl font-bold font-jua text-green-600">
                      ¥{((Number(userBalance) || 0) - confirmCost).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {userBalance < confirmCost && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-600 text-sm font-yuanqi text-center">余额不足，请联系管理员充值</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1 font-yuanqi py-6 text-lg bg-transparent"
                >
                  取消
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={userBalance < confirmCost}
                  className="flex-1 font-yuanqi py-6 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  确认抽奖
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
