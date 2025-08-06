'use client'

import { useState, useEffect } from 'react'
import InfoModal from './components/InfoModal'
import LuckyCards from './components/LuckyCards'
import PrizeModal from './components/PrizeModal'
import SnowAnimation from './components/SnowAnimation'
import Background3D from './components/Background3D'
import ParticleBackground from './components/ParticleBackground'
import { motion } from 'framer-motion'
import PrizeSummaryModal from './components/PrizeSummaryModal'
import { getDeviceInfo } from './utils/deviceInfo'
import FontLoader from './components/FontLoader'

export default function Home() {
  const [showInfoModal, setShowInfoModal] = useState(true)
  const [showPrizeModal, setShowPrizeModal] = useState(false)
  const [showPrizeSummaryModal, setShowPrizeSummaryModal] = useState(false)
  const [userInfo, setUserInfo] = useState<{ phone: string } | null>(null)
  const [prize, setPrize] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [multiDrawPrizes, setMultiDrawPrizes] = useState<string[]>([])
  const [deviceInfo, setDeviceInfo] = useState<any>(null)

  useEffect(() => {
    setIsLoading(false)
    getDeviceInfo().then(setDeviceInfo)
  }, [])

  const handleInfoSubmit = async (info: { phone: string }) => {
    setUserInfo(info);
    setShowInfoModal(false);
  }

  const handlePrizeWon = async (wonPrize: string) => {
    if (!userInfo || !deviceInfo) return;

    setPrize(wonPrize);
    setShowPrizeModal(true);

    const date = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
    try {
      // Send Telegram message
      const response = await fetch('/api/send-telegram-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: userInfo.phone,
          prize: wonPrize,
          date,
          deviceInfo
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
    setMultiDrawPrizes(prizes);
    setShowPrizeSummaryModal(true);

    if (userInfo && deviceInfo) {
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
              phone: userInfo.phone,
              prize: prize,
              date,
              deviceInfo
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
        <motion.h1 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-[#999999] to-[#E6F3FF]"
        >
          JayTIN
        </motion.h1>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 w-full max-w-2xl"
        >
          <LuckyCards 
            canDraw={!!userInfo} 
            onPrizeWon={handlePrizeWon} 
            onMultiDraw={handleMultiDraw}
          />
        </motion.div>
        <InfoModal isOpen={showInfoModal} onSubmit={handleInfoSubmit} />
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
