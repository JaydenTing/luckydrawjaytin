import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import confetti from 'canvas-confetti'

interface Prize {
  name: string
  probability: number
}

interface LuckyWheelProps {
  canSpin: boolean
  onPrizeWon: (prize: string) => void
}

export default function LuckyWheel({ canSpin, onPrizeWon }: LuckyWheelProps) {
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const prizes: Prize[] = [
    { name: "DJ新款无人机", probability: 0 },
    { name: "IPHONE16 PRO", probability: 0 },
    { name: "小礼物", probability: 0.01 },
    { name: "1%现金回扣卷", probability: 0.05 },
    { name: "免单", probability: 0 },
    { name: "下单送小礼物", probability: 0.05 },
    { name: "RM0.1TNG", probability: 0.04 },
    { name: "继续加油", probability: 0.85 }
  ]

  useEffect(() => {
    drawWheel()
    window.addEventListener('resize', drawWheel)
    return () => window.removeEventListener('resize', drawWheel)
  }, [highlightedIndex])

  const drawWheel = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = Math.min(window.innerWidth - 40, window.innerHeight - 40, 800)
    canvas.width = size
    canvas.height = size

    const centerX = size / 2
    const centerY = size / 2
    const radius = (size / 2) - 20

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    prizes.forEach((prize, index) => {
      const startAngle = (index / prizes.length) * Math.PI * 2
      const endAngle = ((index + 1) / prizes.length) * Math.PI * 2

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()

      const baseColor = '#e6f2ff'
      ctx.fillStyle = index === highlightedIndex ? 
        `rgba(230, 242, 255, 0.8)` : 
        baseColor
      ctx.fill()

      // Draw dividing lines
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(centerX + Math.cos(startAngle) * radius, centerY + Math.sin(startAngle) * radius)
      ctx.strokeStyle = '#999999'
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw prize name
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate((startAngle + endAngle) / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#999999'
      ctx.font = `${size / 40}px YuanQiPaoPao, Jua, sans-serif`
      ctx.fillText(prize.name, radius - 20, 0)
      ctx.restore()
    })

    // Draw center circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius / 5, 0, Math.PI * 2)
    ctx.fillStyle = '#999999'
    ctx.fill()
    ctx.strokeStyle = '#e6f2ff'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw arrow
    ctx.beginPath()
    ctx.moveTo(centerX + radius, centerY)
    ctx.lineTo(centerX + radius + 20, centerY - 10)
    ctx.lineTo(centerX + radius + 20, centerY + 10)
    ctx.closePath()
    ctx.fillStyle = '#e6f2ff'
    ctx.fill()
  }

  const selectPrize = (): Prize => {
    const randomValue = Math.random()
    let cumulativeProbability = 0
    for (const prize of prizes) {
      cumulativeProbability += prize.probability
      if (randomValue < cumulativeProbability) {
        return prize
      }
    }
    return prizes[prizes.length - 1] // Default to last prize if no match (shouldn't happen)
  }

  const spinWheel = () => {
    if (!canSpin || isSpinning) return

    setIsSpinning(true)
    const spinDuration = 10000 // 10 seconds
    const startTime = Date.now()

    const selectedPrize = selectPrize()
    const winningIndex = prizes.findIndex(p => p.name === selectedPrize.name)
    const targetRotation = 360 * 5 + (360 - (winningIndex * (360 / prizes.length))) // 5 full rotations + position of the winning prize

    const spin = () => {
      const elapsedTime = Date.now() - startTime
      const progress = Math.min(elapsedTime / spinDuration, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 3) // Easing function for smooth deceleration

      const currentRotation = easeProgress * targetRotation

      setRotation(currentRotation)

      const currentIndex = Math.floor(((currentRotation % 360) / 360) * prizes.length)
      setHighlightedIndex(prizes.length - 1 - currentIndex)

      if (progress < 1) {
        requestAnimationFrame(spin)
      } else {
        setIsSpinning(false)
        onPrizeWon(selectedPrize.name)
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
      }
    }

    requestAnimationFrame(spin)
  }

  return (
    <div className="relative w-full h-full flex justify-center items-center p-2">
      <canvas ref={canvasRef} className="max-w-full max-h-full" style={{ transform: `rotate(${rotation}deg)` }} />
      <Button
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-[#999999] text-[#e6f2ff] hover:bg-[#7a7a7a]"
        onClick={spinWheel}
        disabled={!canSpin || isSpinning}
      >
        {isSpinning ? '旋转中...' : '开始'}
      </Button>
    </div>
  )
}
