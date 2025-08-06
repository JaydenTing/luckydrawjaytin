import { NextResponse } from 'next/server'

export async function GET() {
  // 奖品数据硬编码 (6张卡牌)
  const defaultPrizes = [
    { id: '2', name: "IPHONE 16 PRO MAX", probability: 0.0005, image_url: "/placeholder.svg?height=100&width=100&text=iPhone 16 Pro Max" },
    { id: '3', name: "Apple Watch S10", probability: 0.0005, image_url: "/placeholder.svg?height=100&width=100&text=Apple Watch S10" },
    { id: '5', name: "蓝牙音箱", probability: 0.01, image_url: "/placeholder.svg?height=100&width=100&text=蓝牙音箱" },
    { id: '4', name: "手机支架", probability: 0.02, image_url: "/placeholder.svg?height=100&width=100&text=手机支架" },
    { id: '16', name: "RM0.10 TNG", probability: 0.05, image_url: "/placeholder.svg?height=100&width=100&text=RM0.10 TNG" },
    { id: '18', name: "获取奖品只是次数问题 继续期待！", probability: 0.919, image_url: "/placeholder.svg?height=100&width=100&text=继续期待" }
  ]

  return NextResponse.json(defaultPrizes)
}
