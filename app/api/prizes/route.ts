import { NextResponse } from 'next/server'

export async function GET() {
  // In a real application, this would fetch from a database
  // For now, we'll return a default prize structure
  const defaultPrizes = [
    { id: '1', name: "AirPods Pro 2", probability: 0 },
    { id: '2', name: "IPHONE 16 PRO MAX", probability: 0 },
    { id: '3', name: "Apple Watch S10", probability: 0 },
    { id: '4', name: "手机支架", probability: 0.02 },
    { id: '5', name: "蓝牙音箱", probability: 0 },
    { id: '6', name: "氛围灯", probability: 0 },
    { id: '7', name: "投影仪", probability: 0 },
    { id: '8', name: "钥匙扣(自选 限5令吉）", probability: 0.01 },
    { id: '9', name: "零食", probability: 0.02 },
    { id: '10', name: "创意收纳盒", probability: 0.01 },
    { id: '11', name: "RM1000 TNG", probability: 0 },
    { id: '12', name: "限量版高端礼盒（价值RM599)", probability: 0 },
    { id: '13', name: "下单送小礼物", probability: 0.02 },
    { id: '14', name: "RM0.01 TNG", probability: 0.05 },
    { id: '15', name: "DJI Goggles N3", probability: 0 },
    { id: '16', name: "RM0.10 TNG", probability: 0.03 },
    { id: '17', name: "POP MART 盲盒（可选）", probability: 0 },
    { id: '18', name: "获取奖品只是次数问题 继续期待！", probability: 0.80 }
  ]

  return NextResponse.json(defaultPrizes)
}
