'use client'

import { useState, useEffect, useRef } from 'react'
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
import Image from 'next/image' // 导入 Image 组件

interface Prize {
  name: string
  probability: number
  image_url?: string
}

export default function Home() {
  const [showInfoModal, setShowInfoModal] = useState(true)
  const [showPrizeModal, setShowPrizeModal] = useState(false)
  const [showPrizeSummaryModal, setShowPrizeSummaryModal] = useState(false)
  const [userInfo, setUserInfo] = useState<{ phone: string } | null>(null)
  const [prize, setPrize] = useState<Prize | null>(null) // 修改为 Prize 对象
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [multiDrawPrizes, setMultiDrawPrizes] = useState<string[]>([])
  const [deviceInfo, setDeviceInfo] = useState<any>(null)
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsLoading(false)
    getDeviceInfo().then(setDeviceInfo)

    // 初始化背景音乐
    backgroundMusicRef.current = new Audio('/sounds/background-music.mp3');
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.loop = true;
      backgroundMusicRef.current.volume = 0.2; // 默认音量
      // 尝试自动播放，如果失败则等待用户交互
      backgroundMusicRef.current.play().catch(e => console.warn("Background music autoplay failed:", e));
    }

    return () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current.remove();
      }
    };
  }, [])

  const handleInfoSubmit = async (info: { phone: string }) => {
    setUserInfo(info);
    setShowInfoModal(false);

    // 尝试播放一个静音音频以解锁浏览器音频上下文
    try {
      const audio = new Audio();
      audio.volume = 0; // 静音
      audio.src = '/sounds/draw-sound.mp3'; // 可以是任何短音频文件
      await audio.play();
      audio.pause(); // 立即暂停
      audio.remove(); // 移除音频元素
      
      // 尝试播放背景音乐
      if (backgroundMusicRef.current && backgroundMusicRef.current.paused) {
        backgroundMusicRef.current.play().catch(e => console.warn("Background music play after interaction failed:", e));
      }
    } catch (e) {
      console.warn("Failed to play muted audio to unlock context:", e);
    }
  }

  const handlePrizeWon = async (wonPrize: Prize) => { // 修改为 Prize 对象
    if (!userInfo || !deviceInfo) return;

    setPrize(wonPrize); // 存储整个 Prize 对象
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
          prize: wonPrize.name, // 仅发送奖品名称到 Telegram
          date,
          deviceInfo // 包含设备和IP信息
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
        
        {/* JayTIN Logo */}
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
