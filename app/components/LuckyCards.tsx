import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import confetti from 'canvas-confetti'
import { Sparkles, Zap, Star } from 'lucide-react'
import { db } from '@/lib/database'
import Image from 'next/image'

interface Prize {
  name: string
  probability: number
}

interface LuckyCardsProps {
  canDraw: boolean
  onPrizeWon: (prize: string) => void
  onMultiDraw: (prizes: string[]) => void
  userDrawChances: number
}

export default function LuckyCards({ canDraw, onPrizeWon, onMultiDraw, userDrawChances }: LuckyCardsProps) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [revealedPrize, setRevealedPrize] = useState<string | null>(null)
  const [prizes, setPrizes] = useState<string[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [skipAnimation, setSkipAnimation] = useState(false)

  const getPrizesFromDB = useCallback((): Prize[] => {
    const dbPrizes = db.getAllPrizes()
    return dbPrizes
      .filter(prize => prize.status === 'active')
      .map(prize => ({
        name: prize.name,
        probability: prize.probability
      }))
  }, [])

  // 更新prizePool的定义
  const [prizePool, setPrizePool] = useState<Prize[]>([])

  // 在 useEffect 之前添加这些函数定义
  const selectPrize = useCallback((): Prize => {
    const randomValue = Math.random()
    let cumulativeProbability = 0
    for (const prize of prizePool) {
      cumulativeProbability += prize.probability
      if (randomValue < cumulativeProbability) {
        return prize
      }
    }
    return prizePool[prizePool.length - 1] // Default to last prize if no match (shouldn't happen)
  }, [prizePool])

  const generatePrizes = useCallback(() => {
    const newPrizes = Array(6).fill(null).map(() => selectPrize().name)
    setPrizes(newPrizes)
  }, [selectPrize])

  useEffect(() => {
    setPrizePool(getPrizesFromDB())
  }, [getPrizesFromDB])

  useEffect(() => {
    if (canDraw && prizePool.length > 0) {
      generatePrizes()
    }
  }, [canDraw, prizePool, generatePrizes])

  const shufflePrizes = useCallback(() => {
    const shuffled = [...prizes]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setPrizes(shuffled)
  }, [prizes])

  const handleCardClick = async (index: number) => {
    if (!canDraw || isDrawing || selectedCard !== null || userDrawChances <= 0) return

    setIsDrawing(true)
    setSelectedCard(index)

    if (!skipAnimation) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    const newPrize = prizes[index]
    setRevealedPrize(newPrize)
    setIsDrawing(false)
    onPrizeWon(newPrize)
    
    if (!skipAnimation) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })

      // 添加更多特效
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

      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    
    await resetCards()
  }

  const resetCards = useCallback(() => {
    return new Promise<void>(resolve => {
      setIsRefreshing(true);
      setTimeout(() => {
        setSelectedCard(null);
        setRevealedPrize(null);
        generatePrizes();
        shufflePrizes();
        setIsRefreshing(false);
        resolve();
      }, skipAnimation ? 0 : 500);
    });
  }, [generatePrizes, shufflePrizes, skipAnimation]);

  const handleSingleDraw = async () => {
    if (isDrawing || userDrawChances <= 0) return;
    const randomIndex = Math.floor(Math.random() * prizes.length);
    await handleCardClick(randomIndex);
  };

  const handleMultiDraw = async () => {
    if (isDrawing || userDrawChances < 5) return;
    
    const drawnPrizes: string[] = [];
    for (let i = 0; i < 5; i++) {
      setIsDrawing(true);
      const randomIndex = Math.floor(Math.random() * prizes.length);
      const prize = prizes[randomIndex];
      drawnPrizes.push(prize);
      setRevealedPrize(prize);
      setSelectedCard(randomIndex);
      
      if (!skipAnimation) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 }
        });
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      await resetCards();
    }
    
    setIsDrawing(false);
    onMultiDraw(drawnPrizes);
  };

  const cardVariants = {
    hidden: { rotateY: 0 },
    visible: { rotateY: 180 },
  }

  const refreshVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-white/40 via-[#E6F3FF]/30 to-white/40 backdrop-blur-xl border-2 border-[#999999]/20 rounded-2xl shadow-2xl shadow-[#999999]/10 relative overflow-hidden">
      {/* 添加背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#999999]/30 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#999999]/30 to-transparent"></div>
      
      <CardContent className="p-8 relative z-10">
        <div className="relative w-full h-full" style={{ transformStyle: "preserve-3d" }}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <AnimatePresence>
              {prizes.map((prize, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  animate={selectedCard === index ? "visible" : "hidden"}
                  variants={cardVariants}
                  transition={{ duration: 0.6 }}
                  whileHover={{ 
                    scale: canDraw && selectedCard === null && userDrawChances > 0 ? 1.05 : 1,
                    rotateY: canDraw && selectedCard === null && userDrawChances > 0 ? 5 : 0,
                    boxShadow: canDraw && selectedCard === null && userDrawChances > 0 ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" : "none"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className={`aspect-[3/4] bg-gradient-to-br from-[#f8fbff] via-[#E6F3FF] to-[#e0f0ff] rounded-xl border-2 border-[#999999]/30 shadow-xl shadow-[#999999]/10 flex items-center justify-center text-[#999999] text-xl font-bold cursor-pointer overflow-hidden relative transition-all duration-300 ${
  canDraw && selectedCard === null && userDrawChances > 0 
    ? 'hover:border-[#999999] hover:shadow-2xl hover:shadow-[#999999]/20 hover:scale-[1.02]' 
    : 'opacity-60 cursor-not-allowed'
}`}
                  onClick={() => handleCardClick(index)}
                  style={{ 
                    perspective: "1000px",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* 添加闪烁特效 */}
                  {canDraw && selectedCard === null && userDrawChances > 0 && (
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
                    className="relative w-full h-full transition-transform duration-600"
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
                      <div className="relative mb-3">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#999999]/20 to-[#E6F3FF]/20 rounded-full blur-lg"></div>
                        <Image
                          src="/images/jaytin-logo.png"
                          alt="JayTIN Logo"
                          width={80}
                          height={30}
                          className="relative z-10 drop-shadow-sm"
                        />
                      </div>
                      
                      {/* 装饰元素 */}
                      <div className="flex items-center space-x-2 mb-2">
                        <Sparkles className="w-4 h-4 text-[#999999] animate-pulse" />
                        <div className="w-8 h-0.5 bg-gradient-to-r from-[#999999] to-[#E6F3FF] rounded-full"></div>
                        <Sparkles className="w-4 h-4 text-[#999999] animate-pulse" style={{ animationDelay: '0.5s' }} />
                      </div>
                      
                      {/* 底部文字 */}
                      <span className="text-xs font-medium text-[#999999]/80 chinese-text tracking-wider">幸运抽奖</span>
                      
                      {/* 底部装饰 */}
                      <div className="absolute bottom-2 left-2 right-2 h-1 bg-gradient-to-r from-transparent via-[#999999]/30 to-transparent rounded-full"></div>
                      
                      {/* 角落装饰 */}
                      <div className="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2 border-[#999999]/30 rounded-tl-lg"></div>
                      <div className="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2 border-[#999999]/30 rounded-tr-lg"></div>
                      <div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2 border-[#999999]/30 rounded-bl-lg"></div>
                      <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-[#999999]/30 rounded-br-lg"></div>
                    </div>
                    {/* 卡片背面保持不变 */}
                    <div 
                      className="absolute w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f8fbff] via-[#E6F3FF] to-[#e0f0ff] text-[#999999] p-3 text-center border-2 border-[#999999]/20 rounded-lg"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        boxShadow: "inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(0,0,0,0.1)"
                      }}
                    >
                      {/* 背景装饰 */}
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent rounded-lg"></div>
                      
                      {/* 奖品文字 */}
                      <div className="relative z-10 w-full">
                        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-2 border border-white/30">
                          <span className="text-sm font-bold text-[#999999] max-w-full break-words chinese-text leading-tight drop-shadow-sm">
                            {prize}
                          </span>
                        </div>
                      </div>
                      
                      {/* 装饰星星 */}
                      <Star className="absolute top-2 right-2 w-3 h-3 text-[#999999]/40 animate-spin" style={{ animationDuration: '4s' }} />
                      <Star className="absolute bottom-2 left-2 w-3 h-3 text-[#999999]/40 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
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
                  disabled={isDrawing || userDrawChances <= 0}
                >
                  {!isDrawing && userDrawChances > 0 && (
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
                  disabled={isDrawing || userDrawChances < 5}
                >
                  {!isDrawing && userDrawChances >= 5 && (
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
