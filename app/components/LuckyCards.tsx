import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import confetti from 'canvas-confetti'
import { Sparkles, Zap, Star, Gem } from 'lucide-react' // 导入 Gem 图标
import Image from 'next/image'

interface Prize {
  name: string
  probability: number
  image_url?: string
}

interface LuckyCardsProps {
  canDraw: boolean
  onPrizeWon: (prize: Prize) => void // 修改为传递整个 Prize 对象
  onMultiDraw: (prizes: string[]) => void
}

export default function LuckyCards({ canDraw, onPrizeWon, onMultiDraw }: LuckyCardsProps) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [revealedPrize, setRevealedPrize] = useState<string | null>(null)
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [skipAnimation, setSkipAnimation] = useState(false)

  const drawSoundRef = useRef<HTMLAudioElement | null>(null)
  const winSoundRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    drawSoundRef.current = new Audio('/sounds/draw-sound.mp3')
    winSoundRef.current = new Audio('/sounds/win-sound.mp3')
    drawSoundRef.current.load()
    winSoundRef.current.load()
  }, [])

  const playDrawSound = useCallback(() => {
    if (drawSoundRef.current) {
      drawSoundRef.current.currentTime = 0
      drawSoundRef.current.volume = 0.5
      drawSoundRef.current.play().catch(e => console.error("Error playing draw sound:", e))
    }
  }, [])

  const playWinSound = useCallback(() => {
    if (winSoundRef.current) {
      winSoundRef.current.currentTime = 0
      winSoundRef.current.volume = 0.7
      winSoundRef.current.play().catch(e => console.error("Error playing win sound:", e))
    }
  }, [])

  // 硬编码奖品数据 (6张卡牌)
  const defaultPrizes: Prize[] = [
    { id: '2', name: "Christopher PM M46331", probability: 100, image_url: "https://my.louisvuitton.com/images/is/image/lv/1/PP_VP_L/louis-vuitton-christopher-pm--M46331_PM2_Front%20view.png?wid=1300&hei=1300" },
    { id: '3', name: "Apple Watch S10", probability: 0.0005, image_url: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/watch-compare-series10-202409?wid=396&hei=468&fmt=jpeg&qlt=90&.v=eEpjZGlsbzI4YmtuR2pKQXNDTzZ5OHdLenFEVzBFbmc5cWdOTTluM2hZWGV1cmxobUVZdDkrTXpHWE9ISzNacnVUb3VPa2FUZVhQMFhDQnVBMWhwQTY0aVFxVnBhZFRPOTBCN1FmZExyV28" },
    { id: '5', name: "蓝牙音箱", probability: 0.01, image_url: "/placeholder.svg?height=100&width=100&text=蓝牙音箱" },
    { id: '4', name: "手机支架", probability: 0.02, image_url: "/placeholder.svg?height=100&width=100&text=手机支架" },
    { id: '16', name: "DIMOO Shapes in Nature Series Figures", probability: 100, image_url: "https://prod-eurasian-res.popmart.com/default/20250708_165021_358829____10_____1200x1200.jpg" },
    { id: '18', name: "获取奖品只是次数问题 继续期待！", probability: 0.919, image_url: "/placeholder.svg?height=100&width=100&text=继续期待" }
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
    const newPrizes = Array(6).fill(null).map(() => selectPrize()) // 6张卡牌
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
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setPrizes(shuffled)
  }, [prizes])

  const cardVariants = {
    hidden: {
      rotateY: 0,
      scale: 1,
      rotateZ: 0,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    visible: {
      rotateY: 180,
      scale: [1, 1.1, 1.05],
      rotateZ: [0, 10, 5],
      y: [0, -20, -10],
      transition: {
        duration: 2.0, // Increased duration for a slower flip
        ease: "easeInOut",
        times: [0, 0.5, 1]
      }
    },
    dimmed: {
      opacity: 0.6,
      scale: 0.95,
      filter: "blur(2px)",
      transition: { duration: 0.3 }
    },
    normal: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 0.3 }
    }
  }

  const handleCardClick = async (index: number) => {
    if (!canDraw || isDrawing || selectedCard !== null) return

    setIsDrawing(true)
    playDrawSound()
    setSelectedCard(index)

    if (!skipAnimation) {
      await new Promise(resolve => setTimeout(resolve, 2200)) // Increased wait time for the card to flip and settle
    }

    const newPrize = prizes[index]
    setRevealedPrize(newPrize.name) // This triggers the prize content to appear
    onPrizeWon(newPrize)
    playWinSound()
    
    if (!skipAnimation) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        })
      }, 250)

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        })
      }, 400)

      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait for confetti
    }
    
    await resetCards()
    setIsDrawing(false)
  }

  const resetCards = useCallback(() => {
    return new Promise<void>(resolve => {
      setIsRefreshing(true);
      setTimeout(() => {
        setSelectedCard(null);
        setRevealedPrize(null); // Reset revealed prize state
        generatePrizes();
        shufflePrizes();
        setIsRefreshing(false);
        resolve();
      }, skipAnimation ? 0 : 500);
    });
  }, [generatePrizes, shufflePrizes, skipAnimation]);

  const handleSingleDraw = async () => {
    if (isDrawing) return;
    const randomIndex = Math.floor(Math.random() * prizes.length);
    await handleCardClick(randomIndex);
  };

  const handleMultiDraw = async () => {
    if (isDrawing) return;
    setIsDrawing(true); // Set drawing state once for the whole multi-draw process
    const drawnPrizes: string[] = [];

    for (let i = 0; i < 5; i++) {
      playDrawSound(); // Play draw sound for each draw
      const randomIndex = Math.floor(Math.random() * prizes.length);
      const prize = prizes[randomIndex];
      drawnPrizes.push(prize.name);

      setSelectedCard(randomIndex); // Select the card to flip
      setRevealedPrize(null); // Ensure prize is hidden initially for this card

      if (!skipAnimation) {
        await new Promise(resolve => setTimeout(resolve, 2200)); // Wait for card flip (2.2s)
        setRevealedPrize(prize.name); // Reveal prize after flip
        
        confetti({
          particleCount: 50, // Less confetti for individual draws in multi-draw
          spread: 70,
          origin: { y: 0.6 }
        });
        
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for confetti (2s)
      } else {
        setRevealedPrize(prize.name); // Reveal prize immediately if skipping animation
      }
      
      await resetCards(); // Reset the card for the next draw in the sequence
    }
    
    // After all 5 draws are complete
    setIsDrawing(false); // Allow new draws
    onMultiDraw(drawnPrizes); // Show the summary modal
    playWinSound(); // Play win sound once after all draws are done and summary is shown
  };

  const refreshVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-white/40 via-[#E6F3FF]/30 to-white/40 backdrop-blur-xl border-2 border-[#999999]/20 rounded-2xl shadow-2xl shadow-[#999999]/10 relative overflow-hidden"
      style={{ animation: 'float 6s ease-in-out infinite' }}
    >
      {/* 添加背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#999999]/30 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#999999]/30 to-transparent"></div>
      
      <CardContent className="p-8 relative z-10">
        <div className="relative w-full h-full" style={{ transformStyle: "preserve-3d" }}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6"> {/* 调整网格布局以适应6张卡牌 */}
            <AnimatePresence>
              {prizes.map((prize, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  // Animate based on selection state
                  animate={
                    selectedCard === index
                      ? "visible"
                      : isDrawing && selectedCard !== null // If drawing and not the selected card
                        ? "dimmed"
                        : "normal" // Otherwise, normal state
                  }
                  variants={cardVariants}
                  whileHover={canDraw && selectedCard === null ? { 
                    scale: 1.08, // More pronounced hover scale
                    rotateY: 8, // More tilt on hover
                    boxShadow: "0 25px 35px -8px rgba(0, 0, 0, 0.15), 0 15px 15px -8px rgba(0, 0, 0, 0.08)", // Stronger shadow
                    y: -8 // More lift on hover
                  } : {}}
                  whileTap={canDraw && selectedCard === null ? { scale: 0.92 } : {}} // More pronounced tap
                  className={`aspect-[3/4] bg-gradient-to-br from-[#f8fbff] via-[#E6F3FF] to-[#e0f0ff] rounded-xl border-2 border-[#999999]/30 shadow-xl shadow-[#999999]/10 flex items-center justify-center text-[#999999] text-xl font-bold overflow-hidden relative transition-all duration-300 ${
                    canDraw && selectedCard === null 
                      ? 'hover:border-[#999999] hover:shadow-2xl hover:shadow-[#999999]/20 hover:scale-[1.02] cursor-pointer' 
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                  onClick={() => handleCardClick(index)}
                  style={{ 
                    perspective: "1000px",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Add a subtle glow/border animation on hover for unselected cards */}
                  {canDraw && selectedCard === null && (
                    <motion.div
                      className="absolute inset-0 rounded-xl border-2 border-transparent"
                      whileHover={{ borderColor: "#999999", transition: { duration: 0.2 } }}
                    />
                  )}
                  
                  {/* Existing shimmer and rotation effects */}
                  {canDraw && selectedCard === null && (
                    <>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{
                          x: ['-100%', '100%'],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
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
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    </>
                  )}
                  
                  {/* 原有的卡片内容 */}
                  <div 
                    className="relative w-full h-full"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: selectedCard === index ? "rotateY(180deg)" : "rotateY(0deg)",
                    }}
                  >
                    {/* 卡片正面 */}
                    <div 
                      className="absolute w-full h-full flex flex-col items-center justify-center backface-hidden bg-gradient-to-br from-[#E6F3FF] via-white to-[#f0f8ff] border-2 border-[#999999]/20 rounded-lg"
                      style={{
                        backfaceVisibility: "hidden",
                        boxShadow: "inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(0,0,0,0.1)"
                      }}
                    >
                      {/* 顶部装饰 */}
                      <div className="absolute top-2 left-2 right-2 h-1 bg-gradient-to-r from-transparent via-[#999999]/30 to-transparent rounded-full"></div>
                      
                      {/* Logo区域 */}
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
                      
                      {/* 装饰元素 */}
                      <div className="flex items-center space-x-2 mb-2">
                        <Sparkles className="w-4 h-4 text-[#999999] animate-pulse" />
                        <div className="w-8 h-0.5 bg-gradient-to-r from-[#999999] to-[#E6F3FF] rounded-full"></div>
                        <Sparkles className="w-4 h-4 text-[#999999] animate-pulse" style={{ animationDelay: '0.5s' }} />
                      </div>
                      
                      {/* 底部装饰 */}
                      <div className="absolute bottom-2 left-2 right-2 h-1 bg-gradient-to-r from-transparent via-[#999999]/30 to-transparent rounded-full"></div>
                      
                      {/* 角落装饰 */}
                      <div className="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2 border-[#999999]/30 rounded-tl-lg"></div>
                      <div className="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2 border-[#999999]/30 rounded-tr-lg"></div>
                      <div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2 border-[#999999]/30 rounded-bl-lg"></div>
                      <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-[#999999]/30 rounded-br-lg"></div>
                    </div>
                    {/* 卡片背面 */}
                    <div 
                      className="absolute w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#f8fbff] via-[#E6F3FF] to-[#e0f0ff] text-[#999999] p-3 text-center border-2 border-[#999999]/20 rounded-lg"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        boxShadow: "inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(0,0,0,0.1)"
                      }}
                    >
                      {/* 背景装饰 */}
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
                            {prize.image_url ? (
                              <Image
                                src={prize.image_url || "/placeholder.svg"}
                                alt={prize.name}
                                width={100}
                                height={100}
                                className="object-contain mb-2 drop-shadow-sm"
                              />
                            ) : (
                              <div className="bg-white/50 backdrop-blur-sm rounded-lg p-2 border border-white/30">
                                <span className="text-sm font-bold text-[#999999] max-w-full break-words chinese-text leading-tight drop-shadow-sm">
                                  {prize.name}
                                </span>
                              </div>
                            )}
                          </motion.div>
                        ) : ( // Show JayTIN logo on the back before prize is revealed
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
                              width={100} // 调整大小以适应卡牌
                              height={40} // 调整大小以适应卡牌
                              className="relative z-10 drop-shadow-sm animate-pulse-subtle"
                            />
                            {/* 移除 "JayTIN 抽奖" 文字 */}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      {/* 装饰星星 */}
                      <Star className="absolute top-2 right-2 w-3 h-3 text-[#999999]/40 animate-spin" style={{ animationDuration: '4s' }} />
                      <Star className="absolute bottom-2 left-2 w-3 h-3 text-[#999999]/40 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
                      {/* 移除钻石图标 */}
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
                          x: ['-100%', '100%'],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
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
                          x: ['-100%', '100%'],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
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
            <div className="flex items-center space-x-2">
              <span className="text-[#999999] chinese-text text-sm">跳过动画</span>
              <Switch
                checked={skipAnimation}
                onCheckedChange={setSkipAnimation}
                className="scale-75"
              />
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
