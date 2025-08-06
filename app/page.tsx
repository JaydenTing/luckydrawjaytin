'use client'

import { useState, useEffect } from 'react'
import LoginModal from './components/LoginModal'
import LuckyCards from './components/LuckyCards'
import PrizeModal from './components/PrizeModal'
import SnowAnimation from './components/SnowAnimation'
import Background3D from './components/Background3D'
import ParticleBackground from './components/ParticleBackground'
import { motion } from 'framer-motion'
import PrizeSummaryModal from './components/PrizeSummaryModal'
import { getDeviceInfo } from './utils/deviceInfo'
import FontLoader from './components/FontLoader'
import { Button } from "@/components/ui/button"
import { User, LogOut } from 'lucide-react'
import { db, User as UserType } from '@/lib/database'
import Image from 'next/image'

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(true)
  const [showPrizeModal, setShowPrizeModal] = useState(false)
  const [showPrizeSummaryModal, setShowPrizeSummaryModal] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [prize, setPrize] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [multiDrawPrizes, setMultiDrawPrizes] = useState<string[]>([])
  const [deviceInfo, setDeviceInfo] = useState<any>(null)

  useEffect(() => {
    setIsLoading(false)
    getDeviceInfo().then(setDeviceInfo)
    
    // 初始化数据库
    db.init()
    
    // 检查是否有已登录的用户
    const savedUserId = localStorage.getItem('current_user_id')
    if (savedUserId) {
      const user = db.getUserById(parseInt(savedUserId))
      if (user && user.status === 'active') {
        setCurrentUser(user)
        setShowLoginModal(false)
      } else {
        localStorage.removeItem('current_user_id')
      }
    }
  }, [])

  const handleLogin = (user: UserType) => {
    setCurrentUser(user)
    localStorage.setItem('current_user_id', user.id.toString())
    setShowLoginModal(false)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem('current_user_id')
    setShowLoginModal(true)
  }

  const handlePrizeWon = async (wonPrize: string) => {
    if (!currentUser || !deviceInfo) return;

    setPrize(wonPrize);
    setShowPrizeModal(true);

    // 更新用户抽奖次数和机会
    const updatedUser = db.updateUser(currentUser.id, {
      draw_chances: Math.max(0, currentUser.draw_chances - 1),
      total_draws: currentUser.total_draws + 1
    })

    if (updatedUser) {
      setCurrentUser(updatedUser)
    }

    // 记录抽奖记录
    const prizes = db.getAllPrizes()
    const prizeData = prizes.find(p => p.name === wonPrize)
    if (prizeData) {
      db.createDrawRecord({
        user_id: currentUser.id,
        prize_id: prizeData.id,
        prize_name: wonPrize,
        draw_type: 'single',
        device_info: JSON.stringify(deviceInfo),
        ip_address: deviceInfo.publicIP
      })
    }

    const date = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
    try {
      // Send Telegram message
      const response = await fetch('/api/send-telegram-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: currentUser.phone || currentUser.username,
          prize: wonPrize,
          date,
          deviceInfo,
          username: currentUser.username,
          fullName: currentUser.full_name
        }),
      })
      if (!response.ok) {
        throw new Error('Failed to send Telegram message')
      }
    } catch (error) {
      console.error('Error sending Telegram message:', error)
      setError('发送消息时出错')
    }
  }

  const handleMultiDraw = async (prizes: string[]) => {
    if (!currentUser) return;

    setMultiDrawPrizes(prizes);
    setShowPrizeSummaryModal(true);

    // 更新用户抽奖次数和机会
    const updatedUser = db.updateUser(currentUser.id, {
      draw_chances: Math.max(0, currentUser.draw_chances - 5),
      total_draws: currentUser.total_draws + 5
    })

    if (updatedUser) {
      setCurrentUser(updatedUser)
    }

    // 记录每次抽奖
    const allPrizes = db.getAllPrizes()
    prizes.forEach(prizeName => {
      const prizeData = allPrizes.find(p => p.name === prizeName)
      if (prizeData) {
        db.createDrawRecord({
          user_id: currentUser.id,
          prize_id: prizeData.id,
          prize_name: prizeName,
          draw_type: 'multi',
          device_info: JSON.stringify(deviceInfo),
          ip_address: deviceInfo?.publicIP
        })
      }
    })

    if (deviceInfo) {
      const date = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
      try {
        // Send Telegram message for each prize
        for (const prize of prizes) {
          await fetch('/api/send-telegram-message', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              phone: currentUser.phone || currentUser.username,
              prize: prize,
              date,
              deviceInfo,
              username: currentUser.username,
              fullName: currentUser.full_name
            }),
          })
        }
      } catch (error) {
        console.error('Error sending Telegram messages:', error)
        setError('发送消息时出错')
      }
    }
  }

  const handleConfirm = () => {
    setShowPrizeModal(false)
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen text-[#999999]">加载中...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
  }

  return (
    <FontLoader>
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-gradient-to-br from-white to-[#E6F3FF] overflow-hidden">
        <Background3D />
        <ParticleBackground />
        <SnowAnimation />
        
        {/* User Info Bar */}
        {currentUser && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-4 right-4 z-50 bg-white/80 backdrop-blur-md rounded-lg p-4 shadow-lg border border-[#999999]/20"
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-[#999999]" />
                <div>
                  <p className="text-sm font-bold text-[#999999]">{currentUser.full_name || currentUser.username}</p>
                  <p className="text-xs text-[#999999]/70">抽奖机会: {currentUser.draw_chances}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleLogout}
                className="text-[#999999] border-[#999999]/30 hover:bg-[#999999]/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
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
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#999999] to-[#E6F3FF] chinese-text"
          >
            幸运抽奖系统
          </motion.div>
        </motion.div>

        {currentUser && currentUser.draw_chances <= 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-6 bg-yellow-100 border border-yellow-300 rounded-lg text-center"
          >
            <p className="text-yellow-800 font-bold chinese-text">您的抽奖机会已用完</p>
            <p className="text-yellow-700 chinese-text">请联系管理员获取更多抽奖机会</p>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 w-full max-w-2xl"
        >
          <LuckyCards 
            canDraw={!!currentUser && currentUser.draw_chances > 0} 
            onPrizeWon={handlePrizeWon} 
            onMultiDraw={handleMultiDraw}
            userDrawChances={currentUser?.draw_chances || 0}
          />
        </motion.div>

        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin} 
        />
        
        <PrizeModal 
          isOpen={showPrizeModal} 
          onClose={() => setShowPrizeModal(false)} 
          onConfirm={handleConfirm}
          prize={prize} 
        />
        
        <PrizeSummaryModal 
          isOpen={showPrizeSummaryModal}
          onClose={() => setShowPrizeSummaryModal(false)}
          prizes={multiDrawPrizes}
        />
      </main>
    </FontLoader>
  )
}
