'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, LogOut, Gift, TrendingUp, Users, Award, UserPlus, Ban, CheckCircle, XCircle } from 'lucide-react'
import confetti from 'canvas-confetti'
import { db, User, Prize } from '@/lib/database'

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [isAddPrizeModalOpen, setIsAddPrizeModalOpen] = useState(false)
  const [isEditPrizeModalOpen, setIsEditPrizeModalOpen] = useState(false)
  const [isAddChancesModalOpen, setIsAddChancesModalOpen] = useState(false)
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newPrize, setNewPrize] = useState({ name: '', description: '', probability: 0, value: 0, stock: 0 })
  const [chanceForm, setChanceForm] = useState({ chances: 0, reason: '' })
  const [stats, setStats] = useState({ totalPrizes: 0, totalUsers: 0, totalDraws: 0, activeUsers: 0 })
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin')
      return
    }

    // Initialize database and load data
    db.init()
    loadData()
  }, [router])

  const loadData = () => {
    const allUsers = db.getAllUsers()
    const allPrizes = db.getAllPrizes()
    const allDrawRecords = db.getAllDrawRecords()
    
    setUsers(allUsers)
    setPrizes(allPrizes)
    setStats({
      totalPrizes: allPrizes.length,
      totalUsers: allUsers.length,
      totalDraws: allDrawRecords.length,
      activeUsers: allUsers.filter(user => user.status === 'active').length
    })
  }

  const handleAddPrize = () => {
    if (newPrize.name.trim()) {
      db.createPrize({
        name: newPrize.name.trim(),
        description: newPrize.description,
        probability: newPrize.probability / 100,
        value: newPrize.value,
        stock: newPrize.stock,
        status: 'active'
      })
      
      setNewPrize({ name: '', description: '', probability: 0, value: 0, stock: 0 })
      setIsAddPrizeModalOpen(false)
      loadData()
      
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      })
    }
  }

  const handleEditPrize = () => {
    if (editingPrize && editingPrize.name.trim()) {
      db.updatePrize(editingPrize.id, {
        name: editingPrize.name,
        description: editingPrize.description,
        probability: editingPrize.probability,
        value: editingPrize.value,
        stock: editingPrize.stock
      })
      
      setEditingPrize(null)
      setIsEditPrizeModalOpen(false)
      loadData()
    }
  }

  const handleDeletePrize = (id: number) => {
    db.deletePrize(id)
    loadData()
  }

  const handleAddChances = () => {
    if (selectedUser && chanceForm.chances > 0) {
      const updatedUser = db.updateUser(selectedUser.id, {
        draw_chances: selectedUser.draw_chances + chanceForm.chances
      })
      
      if (updatedUser) {
        db.createDrawChanceRecord({
          user_id: selectedUser.id,
          admin_id: 1, // 假设当前管理员ID为1
          chances_added: chanceForm.chances,
          reason: chanceForm.reason
        })
      }
      
      setChanceForm({ chances: 0, reason: '' })
      setSelectedUser(null)
      setIsAddChancesModalOpen(false)
      loadData()
    }
  }

  const handleToggleUserStatus = (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'banned' : 'active'
    db.updateUser(userId, { status: newStatus })
    loadData()
  }

  const handleDeleteUser = (userId: number) => {
    db.deleteUser(userId)
    loadData()
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
            { title: "总用户数", value: stats.totalUsers, icon: Users, color: "from-blue-500 to-cyan-500" },
            { title: "活跃用户", value: stats.activeUsers, icon: UserPlus, color: "from-green-500 to-emerald-500" },
            { title: "总奖品数", value: stats.totalPrizes, icon: Gift, color: "from-purple-500 to-pink-500" },
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

        {/* Management Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <Tabs defaultValue="users" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white/10">
                  <TabsTrigger value="users" className="text-white data-[state=active]:bg-white/20">用户管理</TabsTrigger>
                  <TabsTrigger value="prizes" className="text-white data-[state=active]:bg-white/20">奖品管理</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">用户管理</h3>
                    <Dialog open={isAddChancesModalOpen} onOpenChange={setIsAddChancesModalOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                          <Plus className="w-4 h-4 mr-2" />
                          添加抽奖机会
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-800 border-slate-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">为用户添加抽奖机会</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-white">选择用户</Label>
                            <select
                              className="w-full p-2 bg-slate-700 border-slate-600 text-white rounded"
                              value={selectedUser?.id || ''}
                              onChange={(e) => {
                                const user = users.find(u => u.id === parseInt(e.target.value))
                                setSelectedUser(user || null)
                              }}
                            >
                              <option value="">请选择用户</option>
                              {users.map(user => (
                                <option key={user.id} value={user.id}>
                                  {user.username} ({user.full_name || '未设置姓名'})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label className="text-white">添加机会数</Label>
                            <Input
                              type="number"
                              min="1"
                              value={chanceForm.chances}
                              onChange={(e) => setChanceForm({ ...chanceForm, chances: parseInt(e.target.value) || 0 })}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="输入要添加的抽奖机会数"
                            />
                          </div>
                          <div>
                            <Label className="text-white">备注原因</Label>
                            <Input
                              value={chanceForm.reason}
                              onChange={(e) => setChanceForm({ ...chanceForm, reason: e.target.value })}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="添加抽奖机会的原因"
                            />
                          </div>
                          <Button 
                            onClick={handleAddChances} 
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
                            disabled={!selectedUser || chanceForm.chances <= 0}
                          >
                            添加机会
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/20">
                          <TableHead className="text-white">用户名</TableHead>
                          <TableHead className="text-white">姓名</TableHead>
                          <TableHead className="text-white">电话</TableHead>
                          <TableHead className="text-white">邮箱</TableHead>
                          <TableHead className="text-white">状态</TableHead>
                          <TableHead className="text-white">抽奖机会</TableHead>
                          <TableHead className="text-white">总抽奖次数</TableHead>
                          <TableHead className="text-white">注册时间</TableHead>
                          <TableHead className="text-white">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {users.map((user, index) => (
                            <motion.tr
                              key={user.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ delay: index * 0.05 }}
                              className="border-white/20"
                            >
                              <TableCell className="text-white">{user.username}</TableCell>
                              <TableCell className="text-white">{user.full_name || '未设置'}</TableCell>
                              <TableCell className="text-white">{user.phone || '未设置'}</TableCell>
                              <TableCell className="text-white">{user.email || '未设置'}</TableCell>
                              <TableCell>
                                <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                                  {user.status === 'active' ? '正常' : user.status === 'banned' ? '已禁用' : '未激活'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-white font-bold">{user.draw_chances}</TableCell>
                              <TableCell className="text-white">{user.total_draws}</TableCell>
                              <TableCell className="text-white">
                                {new Date(user.created_at).toLocaleDateString('zh-CN')}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className={`${user.status === 'active' 
                                      ? 'bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30' 
                                      : 'bg-green-500/20 border-green-500/50 text-green-300 hover:bg-green-500/30'
                                    }`}
                                    onClick={() => handleToggleUserStatus(user.id, user.status)}
                                  >
                                    {user.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30"
                                    onClick={() => handleDeleteUser(user.id)}
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
                </TabsContent>

                <TabsContent value="prizes" className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">奖品管理</h3>
                    <Dialog open={isAddPrizeModalOpen} onOpenChange={setIsAddPrizeModalOpen}>
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
                            <Label htmlFor="prizeDescription" className="text-white">奖品描述</Label>
                            <Input
                              id="prizeDescription"
                              value={newPrize.description}
                              onChange={(e) => setNewPrize({ ...newPrize, description: e.target.value })}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="输入奖品描述"
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
                          <div>
                            <Label htmlFor="prizeValue" className="text-white">奖品价值 (RM)</Label>
                            <Input
                              id="prizeValue"
                              type="number"
                              step="0.01"
                              min="0"
                              value={newPrize.value}
                              onChange={(e) => setNewPrize({ ...newPrize, value: parseFloat(e.target.value) || 0 })}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="输入奖品价值"
                            />
                          </div>
                          <div>
                            <Label htmlFor="prizeStock" className="text-white">库存数量 (-1表示无限)</Label>
                            <Input
                              id="prizeStock"
                              type="number"
                              min="-1"
                              value={newPrize.stock}
                              onChange={(e) => setNewPrize({ ...newPrize, stock: parseInt(e.target.value) || 0 })}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="输入库存数量"
                            />
                          </div>
                          <Button onClick={handleAddPrize} className="w-full bg-gradient-to-r from-green-500 to-emerald-500">
                            添加奖品
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/20">
                          <TableHead className="text-white">奖品名称</TableHead>
                          <TableHead className="text-white">描述</TableHead>
                          <TableHead className="text-white">中奖概率</TableHead>
                          <TableHead className="text-white">价值 (RM)</TableHead>
                          <TableHead className="text-white">库存</TableHead>
                          <TableHead className="text-white">状态</TableHead>
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
                              <TableCell className="text-white">{prize.description || '无描述'}</TableCell>
                              <TableCell className="text-white">{(prize.probability * 100).toFixed(4)}%</TableCell>
                              <TableCell className="text-white">{prize.value.toFixed(2)}</TableCell>
                              <TableCell className="text-white">{prize.stock === -1 ? '无限' : prize.stock}</TableCell>
                              <TableCell>
                                <Badge variant={prize.status === 'active' ? 'default' : 'secondary'}>
                                  {prize.status === 'active' ? '启用' : '禁用'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Dialog open={isEditPrizeModalOpen && editingPrize?.id === prize.id} onOpenChange={(open) => {
                                    setIsEditPrizeModalOpen(open)
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
                                            <Label htmlFor="editPrizeDescription" className="text-white">奖品描述</Label>
                                            <Input
                                              id="editPrizeDescription"
                                              value={editingPrize.description || ''}
                                              onChange={(e) => setEditingPrize({ ...editingPrize, description: e.target.value })}
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
                                          <div>
                                            <Label htmlFor="editPrizeValue" className="text-white">奖品价值 (RM)</Label>
                                            <Input
                                              id="editPrizeValue"
                                              type="number"
                                              step="0.01"
                                              min="0"
                                              value={editingPrize.value}
                                              onChange={(e) => setEditingPrize({ ...editingPrize, value: parseFloat(e.target.value) || 0 })}
                                              className="bg-slate-700 border-slate-600 text-white"
                                            />
                                          </div>
                                          <div>
                                            <Label htmlFor="editPrizeStock" className="text-white">库存数量</Label>
                                            <Input
                                              id="editPrizeStock"
                                              type="number"
                                              min="-1"
                                              value={editingPrize.stock}
                                              onChange={(e) => setEditingPrize({ ...editingPrize, stock: parseInt(e.target.value) || 0 })}
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
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
