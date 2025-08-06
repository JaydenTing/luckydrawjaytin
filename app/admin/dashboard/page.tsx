'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, LogOut, Gift, TrendingUp, Users, Award } from 'lucide-react'
import confetti from 'canvas-confetti'

interface Prize {
  id: string
  name: string
  probability: number
}

export default function AdminDashboard() {
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null)
  const [newPrize, setNewPrize] = useState({ name: '', probability: 0 })
  const [stats, setStats] = useState({ totalPrizes: 0, totalUsers: 0, totalDraws: 0 })
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin')
      return
    }

    // Load prizes from localStorage
    const savedPrizes = localStorage.getItem('admin_prizes')
    if (savedPrizes) {
      setPrizes(JSON.parse(savedPrizes))
    } else {
      // Initialize with default prizes
      const defaultPrizes: Prize[] = [
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
      setPrizes(defaultPrizes)
      localStorage.setItem('admin_prizes', JSON.stringify(defaultPrizes))
    }

    // Load stats
    const savedStats = localStorage.getItem('admin_stats')
    if (savedStats) {
      setStats(JSON.parse(savedStats))
    }
  }, [router])

  const savePrizes = (updatedPrizes: Prize[]) => {
    setPrizes(updatedPrizes)
    localStorage.setItem('admin_prizes', JSON.stringify(updatedPrizes))
  }

  const handleAddPrize = () => {
    if (newPrize.name.trim()) {
      const prize: Prize = {
        id: Date.now().toString(),
        name: newPrize.name.trim(),
        probability: newPrize.probability / 100 // Convert percentage to decimal
      }
      const updatedPrizes = [...prizes, prize]
      savePrizes(updatedPrizes)
      setNewPrize({ name: '', probability: 0 })
      setIsAddModalOpen(false)
      
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      })
    }
  }

  const handleEditPrize = () => {
    if (editingPrize && editingPrize.name.trim()) {
      const updatedPrizes = prizes.map(prize =>
        prize.id === editingPrize.id
          ? { ...editingPrize, probability: editingPrize.probability }
          : prize
      )
      savePrizes(updatedPrizes)
      setEditingPrize(null)
      setIsEditModalOpen(false)
    }
  }

  const handleDeletePrize = (id: string) => {
    const updatedPrizes = prizes.filter(prize => prize.id !== id)
    savePrizes(updatedPrizes)
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    router.push('/admin')
  }

  const totalProbability = prizes.reduce((sum, prize) => sum + prize.probability, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white">JayTIN 管理员仪表板</h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            退出登录
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { title: "总奖品数", value: prizes.length, icon: Gift, color: "from-blue-500 to-cyan-500" },
            { title: "总概率", value: `${(totalProbability * 100).toFixed(1)}%`, icon: TrendingUp, color: "from-green-500 to-emerald-500" },
            { title: "用户数", value: stats.totalUsers, icon: Users, color: "from-purple-500 to-pink-500" },
            { title: "抽奖次数", value: stats.totalDraws, icon: Award, color: "from-orange-500 to-red-500" }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">{stat.title}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full bg-gradient-to-r ${stat.color}`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Prize Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">奖品管理</CardTitle>
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                      <Plus className="w-4 h-4 mr-2" />
                      添加奖品
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">添加新奖品</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="prizeName" className="text-white">奖品名称</Label>
                        <Input
                          id="prizeName"
                          value={newPrize.name}
                          onChange={(e) => setNewPrize({ ...newPrize, name: e.target.value })}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="输入奖品名称"
                        />
                      </div>
                      <div>
                        <Label htmlFor="prizeProbability" className="text-white">中奖概率 (%)</Label>
                        <Input
                          id="prizeProbability"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={newPrize.probability}
                          onChange={(e) => setNewPrize({ ...newPrize, probability: parseFloat(e.target.value) || 0 })}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="输入概率"
                        />
                      </div>
                      <Button onClick={handleAddPrize} className="w-full bg-gradient-to-r from-green-500 to-emerald-500">
                        添加奖品
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/20">
                      <TableHead className="text-white">奖品名称</TableHead>
                      <TableHead className="text-white">中奖概率</TableHead>
                      <TableHead className="text-white">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {prizes.map((prize, index) => (
                        <motion.tr
                          key={prize.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-white/20"
                        >
                          <TableCell className="text-white">{prize.name}</TableCell>
                          <TableCell className="text-white">{(prize.probability * 100).toFixed(2)}%</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Dialog open={isEditModalOpen && editingPrize?.id === prize.id} onOpenChange={(open) => {
                                setIsEditModalOpen(open)
                                if (!open) setEditingPrize(null)
                              }}>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-blue-500/20 border-blue-500/50 text-blue-300 hover:bg-blue-500/30"
                                    onClick={() => setEditingPrize({ ...prize })}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-slate-800 border-slate-700">
                                  <DialogHeader>
                                    <DialogTitle className="text-white">编辑奖品</DialogTitle>
                                  </DialogHeader>
                                  {editingPrize && (
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="editPrizeName" className="text-white">奖品名称</Label>
                                        <Input
                                          id="editPrizeName"
                                          value={editingPrize.name}
                                          onChange={(e) => setEditingPrize({ ...editingPrize, name: e.target.value })}
                                          className="bg-slate-700 border-slate-600 text-white"
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="editPrizeProbability" className="text-white">中奖概率 (%)</Label>
                                        <Input
                                          id="editPrizeProbability"
                                          type="number"
                                          step="0.01"
                                          min="0"
                                          max="100"
                                          value={editingPrize.probability * 100}
                                          onChange={(e) => setEditingPrize({ ...editingPrize, probability: (parseFloat(e.target.value) || 0) / 100 })}
                                          className="bg-slate-700 border-slate-600 text-white"
                                        />
                                      </div>
                                      <Button onClick={handleEditPrize} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500">
                                        保存更改
                                      </Button>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30"
                                onClick={() => handleDeletePrize(prize.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
