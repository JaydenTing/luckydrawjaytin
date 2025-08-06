import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import confetti from 'canvas-confetti'
import { Sparkles, Zap, Star } from 'lucide-react'

interface Prize {
  name: string
  probability: number
}

interface LuckyCardsProps {
  canDraw: boolean
  onPrizeWon: (prize: string) => void
  onMultiDraw: (prizes: string[]) => void
}

export default function LuckyCards({ canDraw, onPrizeWon, onMultiDraw }: LuckyCardsProps) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [revealedPrize, setRevealedPrize] = useState<string | null>(null)
  const [prizes, setPrizes] = useState<string[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [skipAnimation, setSkipAnimation] = useState(false)

  const getPrizesFromAdmin = useCallback((): Prize[] => {
    const adminPrizes = localStorage.getItem('admin_prizes')
    if (adminPrizes) {
      const parsedPrizes = JSON.parse(adminPrizes)
      return parsedPrizes.map((prize: any) => ({
        name: prize.name,
        probability: prize.probability
      }))
    }
    
    // 如果没有管理员设置，返回默认奖品
    return [
      { name: "AirPods Pro 2", probability: 0 },
      { name: "IPHONE 16 PRO MAX", probability: 0 },
      { name: "Apple Watch S10", probability: 0 },
      { name: "手机支架", probability: 0.02 },
      { name: "蓝牙音箱", probability: 0 },
      { name: "氛围灯", probability: 0 },
      { name: "投影仪", probability: 0 },  
      { name: "钥匙扣(自选 限5令吉）", probability: 0.01 },
      { name: "零食", probability: 0.02 },
      { name: "创意收纳盒", probability: 0.01 },
      { name: "RM1000 TNG", probability: 0 },    
      { name: "限量版高端礼盒（价值RM599)", probability: 0 },
      { name: "下单送小礼物", probability: 0.02 },
      { name: "RM0.01 TNG", probability: 0.05 },
      { name: "DJI Goggles N3", probability: 0 },
      { name: "RM0.10 TNG", probability: 0.03 },
      { name: "POP MART 盲盒（可选）", probability: 0 },
      { name: "获取奖品只是次数问题 继续期待！", probability: 0.80 }
    ]
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
    setPrizePool(getPrizesFromAdmin())
  }, [getPrizesFromAdmin])

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
    if (!canDraw || isDrawing || selectedCard !== null) return

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
    if (isDrawing) return;
    const randomIndex = Math.floor(Math.random() * prizes.length);
    await handleCardClick(randomIndex);
  };

  const handleMultiDraw = async () => {
    if (isDrawing) return;
    
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
    <Card className="w-full max-w-4xl mx-auto bg-white/30 backdrop-blur-md border-[#999999] border-2 rounded-xl shadow-2xl shadow-[#999999]/20">
      <CardContent className="p-6">
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
                    scale: canDraw && selectedCard === null ? 1.05 : 1,
                    rotateY: canDraw && selectedCard === null ? 5 : 0,
                    boxShadow: canDraw && selectedCard === null ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" : "none"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className={`aspect-[3/4] bg-gradient-to-br from-[#E6F3FF] to-white rounded-lg border border-[#999999] shadow-lg shadow-[#999999]/20 flex items-center justify-center text-[#999999] text-xl font-bold cursor-pointer overflow-hidden relative ${
                    canDraw && selectedCard === null ? 'hover:border-[#999999] transition-all duration-300' : ''
                  }`}
                  onClick={() => handleCardClick(index)}
                  style={{ 
                    perspective: "1000px",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* 添加闪烁特效 */}
                  {canDraw && selectedCard === null && (
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
                      className="absolute w-full h-full flex flex-col items-center justify-center backface-hidden"
                      style={{
                        backfaceVisibility: "hidden",
                      }}
                    >
                      <Sparkles className="w-8 h-8 text-[#999999] mb-2 animate-pulse" />
                      <span className="text-2xl font-bold text-[#999999] chinese-text" style={{ transform: "translateZ(20px)" }}>JayTIN</span>
                      <Star className="w-6 h-6 text-[#999999] mt-2 animate-spin" style={{ animationDuration: '3s' }} />
                    </div>
                    {/* 卡片背面保持不变 */}
                    <div 
                      className="absolute w-full h-full flex items-center justify-center bg-gradient-to-br from-[#E6F3FF] to-white text-[#999999] p-2 text-center"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      <span className="text-lg font-bold text-[#999999] max-w-full break-words chinese-text">{prize}</span>
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
                  className="bg-[#999999] text-white hover:bg-[#888888] transition-colors duration-300 chinese-text w-32 relative overflow-hidden"
                  disabled={isDrawing}
                >
                  {!isDrawing && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 2,
                      }}
                    />
                  )}
                  <Zap className="w-4 h-4 mr-2" />
                  1连抽
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={handleMultiDraw} 
                  className="bg-[#999999] text-white hover:bg-[#888888] transition-colors duration-300 chinese-text w-32 relative overflow-hidden"
                  disabled={isDrawing}
                >
                  {!isDrawing && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 2,
                        delay: 0.5,
                      }}
                    />
                  )}
                  <Star className="w-4 h-4 mr-2" />
                  5连抽
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
