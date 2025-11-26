"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import Image from "next/image"
import {
  Users,
  Gift,
  History,
  Upload,
  X,
  Search,
  LogOut,
  Plus,
  Trash2,
  Ban,
  CheckCircle,
  Download,
  Wallet,
} from "lucide-react"

// Placeholder for FontLoader if it's a custom component not provided
// If FontLoader is not necessary for this specific component, it can be removed.
const FontLoader = ({ children }: { children: React.ReactNode }) => <>{children}</>

interface User {
  id: number
  username: string
  phone: string
  balance: number
  is_banned: boolean
  is_admin: boolean
  created_at: string
}

interface Prize {
  id: number
  name: string
  probability: number
  image_url: string
  cost: number
}

interface DrawHistory {
  id: number
  user_id: number
  username: string
  prize_name: string
  draw_type: string
  created_at: string
}

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [drawHistory, setDrawHistory] = useState<DrawHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [prizeName, setPrizeName] = useState("")
  const [prizeProbability, setPrizeProbability] = useState("")
  const [prizeCost, setPrizeCost] = useState("1.00")
  const [prizeImageFile, setPrizeImageFile] = useState<File | null>(null)
  const [prizeImagePreview, setPrizeImagePreview] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")

  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [batchBalance, setBatchBalance] = useState("")
  const [showStats, setShowStats] = useState(false)
  const [addBalanceUserId, setAddBalanceUserId] = useState<number | null>(null)
  const [addBalanceAmount, setAddBalanceAmount] = useState("")
  const [balanceTransactions, setBalanceTransactions] = useState<any[]>([])

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo")
    if (!userInfo) {
      router.push("/login")
      return
    }

    const user = JSON.parse(userInfo)
    if (!user.is_admin) {
      router.push("/")
      return
    }

    loadData()
  }, [router])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [usersRes, prizesRes, historyRes, transactionsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/prizes"),
        fetch("/api/admin/draw-history"),
        fetch("/api/admin/balance-transactions"),
      ])

      const usersData = await usersRes.json()
      const prizesData = await prizesRes.json()
      const historyData = await historyRes.json()
      const transactionsData = await transactionsRes.json()

      setUsers(usersData.users || [])
      setPrizes(prizesData.prizes || [])
      setDrawHistory(historyData.history || [])
      setBalanceTransactions(transactionsData.transactions || [])
    } catch (error) {
      console.error("Failed to load data:", error)
    }
    setIsLoading(false)
  }

  const handleAddBalance = async (userId: number, amount: number) => {
    try {
      await fetch("/api/admin/users/add-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount }),
      })
      setAddBalanceUserId(null)
      setAddBalanceAmount("")
      loadData()
    } catch (error) {
      console.error("Failed to add balance:", error)
    }
  }

  const handleUpdateBalance = async (userId: number, balance: number) => {
    try {
      await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, balance }),
      })
      loadData()
    } catch (error) {
      console.error("Failed to update balance:", error)
    }
  }

  const handleBanUser = async (userId: number, banned: boolean) => {
    try {
      await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, is_banned: banned }),
      })
      loadData()
    } catch (error) {
      console.error("Failed to ban/unban user:", error)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("确定要删除此用户吗？")) return

    try {
      await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      loadData()
    } catch (error) {
      console.error("Failed to delete user:", error)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("图片大小不能超过5MB")
        return
      }
      setPrizeImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPrizeImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddPrize = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!prizeImageFile) {
      alert("请上传奖品图片")
      return
    }

    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const imageData = reader.result as string

        await fetch("/api/admin/prizes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: prizeName,
            probability: Number.parseFloat(prizeProbability),
            cost: Number.parseFloat(prizeCost),
            image_url: imageData,
          }),
        })

        setPrizeName("")
        setPrizeProbability("")
        setPrizeCost("1.00")
        setPrizeImageFile(null)
        setPrizeImagePreview("")
        loadData()
      }
      reader.readAsDataURL(prizeImageFile)
    } catch (error) {
      console.error("Failed to add prize:", error)
      alert("添加奖品失败")
    }
  }

  const handleDeletePrize = async (prizeId: number) => {
    if (!confirm("确定要删除此奖品吗？")) return

    try {
      await fetch("/api/admin/prizes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prizeId }),
      })
      loadData()
    } catch (error) {
      console.error("Failed to delete prize:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("userInfo")
    router.push("/login")
  }

  const handleBatchUpdateBalance = async () => {
    if (selectedUsers.length === 0) {
      alert("请先选择用户")
      return
    }

    const balance = Number.parseFloat(batchBalance)
    if (isNaN(balance)) {
      alert("请输入有效的金额")
      return
    }

    try {
      await Promise.all(
        selectedUsers.map((userId) =>
          fetch("/api/admin/users", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, balance }),
          }),
        ),
      )
      setSelectedUsers([])
      setBatchBalance("")
      loadData()
    } catch (error) {
      console.error("Failed to batch update:", error)
    }
  }

  const handleExportData = () => {
    const data = {
      users: users.filter((u) => !u.is_admin),
      prizes,
      drawHistory,
      exportDate: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `jaytin-data-${new Date().toISOString().split("T")[0]}.json`
    a.click()
  }

  const stats = {
    totalUsers: users.filter((u) => !u.is_admin).length,
    bannedUsers: users.filter((u) => u.is_banned).length,
    totalBalance: users.reduce((sum, u) => sum + (Number(u.balance) || 0), 0),
    totalPrizes: prizes.length,
    totalDraws: drawHistory.length,
    todayDraws: drawHistory.filter((h) => {
      const today = new Date().toDateString()
      return new Date(h.created_at).toDateString() === today
    }).length,
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-700 font-yuanqi text-lg">加载中...</p>
        </div>
      </div>
    )
  }

  const filteredUsers = users.filter(
    (user) =>
      !user.is_admin &&
      (user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <FontLoader>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm"
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Image src="/images/jaytin-logo.png" alt="JayTIN Logo" width={120} height={48} />
              <div className="h-8 w-px bg-gray-300" />
              <h1 className="text-2xl font-bold font-jua text-gray-900">管理控制台</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleExportData}
                variant="outline"
                className="font-yuanqi text-gray-700 hover:text-gray-900 bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                导出数据
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="font-yuanqi text-gray-700 hover:text-gray-900 bg-transparent"
              >
                <LogOut className="w-4 h-4 mr-2" />
                登出
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-yuanqi text-gray-600 mb-1">总用户数</p>
                  <p className="text-3xl font-bold font-jua text-gray-900">{stats.totalUsers}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-yuanqi text-gray-600 mb-1">总余额</p>
                  <p className="text-3xl font-bold font-jua text-gray-900">¥{Number(stats.totalBalance).toFixed(2)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Wallet className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Gift className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-yuanqi">奖品数量</p>
                  <p className="text-2xl font-bold text-gray-900 font-jua">{stats.totalPrizes}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <History className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-yuanqi">今日抽奖</p>
                  <p className="text-2xl font-bold text-gray-900 font-jua">{stats.todayDraws}</p>
                </div>
              </div>
            </motion.div>
          </div>

          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 bg-white/80 backdrop-blur-sm p-1.5 rounded-xl border border-gray-200 h-auto shadow-sm">
              <TabsTrigger
                value="users"
                className="font-yuanqi data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 rounded-lg py-3 flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                用户管理
              </TabsTrigger>
              <TabsTrigger
                value="prizes"
                className="font-yuanqi data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-700 rounded-lg py-3 flex items-center justify-center gap-2"
              >
                <Gift className="w-4 h-4" />
                奖品管理
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="font-yuanqi data-[state=active]:bg-amber-600 data-[state=active]:text-white text-gray-700 rounded-lg py-3 flex items-center justify-center gap-2"
              >
                <History className="w-4 h-4" />
                抽奖记录
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="font-yuanqi data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-700 rounded-lg py-3 flex items-center justify-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                流水记录
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                      <div>
                        <h2 className="font-jua text-2xl text-gray-900 mb-1">用户列表</h2>
                        <p className="font-yuanqi text-sm text-gray-600">管理所有用户账号和余额</p>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="搜索用户名或电话..."
                          className="pl-10 bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 font-yuanqi"
                        />
                      </div>
                    </div>

                    {selectedUsers.length > 0 && (
                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <span className="font-yuanqi text-sm text-blue-900">已选择 {selectedUsers.length} 个用户</span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="余额金额"
                          value={batchBalance}
                          onChange={(e) => setBatchBalance(e.target.value)}
                          className="w-32 h-9 font-yuanqi"
                        />
                        <Button
                          onClick={handleBatchUpdateBalance}
                          size="sm"
                          className="font-yuanqi bg-blue-600 hover:bg-blue-700"
                        >
                          批量修改
                        </Button>
                        <Button
                          onClick={() => setSelectedUsers([])}
                          size="sm"
                          variant="outline"
                          className="font-yuanqi"
                        >
                          取消选择
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-4 px-4">
                              <input
                                type="checkbox"
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedUsers(filteredUsers.map((u) => u.id))
                                  } else {
                                    setSelectedUsers([])
                                  }
                                }}
                                checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                className="rounded border-gray-300"
                              />
                            </th>
                            <th className="text-left py-4 px-4 font-yuanqi font-semibold text-gray-700 text-sm">
                              用户名
                            </th>
                            <th className="text-left py-4 px-4 font-yuanqi font-semibold text-gray-700 text-sm">
                              电话
                            </th>
                            <th className="text-left py-4 px-4 font-yuanqi font-semibold text-gray-700 text-sm">
                              状态
                            </th>
                            <th className="text-left py-4 px-4 font-yuanqi font-semibold text-gray-700 text-sm">
                              余额 (¥)
                            </th>
                            <th className="text-left py-4 px-4 font-yuanqi font-semibold text-gray-700 text-sm">
                              余额操作
                            </th>
                            <th className="text-left py-4 px-4 font-yuanqi font-semibold text-gray-700 text-sm">
                              其他操作
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-center py-12 text-gray-500 font-yuanqi">
                                暂无用户数据
                              </td>
                            </tr>
                          ) : (
                            filteredUsers.map((user) => (
                              <tr
                                key={user.id}
                                className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
                              >
                                <td className="py-4 px-4">
                                  <input
                                    type="checkbox"
                                    checked={selectedUsers.includes(user.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedUsers([...selectedUsers, user.id])
                                      } else {
                                        setSelectedUsers(selectedUsers.filter((id) => id !== user.id))
                                      }
                                    }}
                                    className="rounded border-gray-300"
                                  />
                                </td>
                                <td className="py-4 px-4 font-yuanqi text-gray-900">{user.username}</td>
                                <td className="py-4 px-4 font-yuanqi text-gray-600">{user.phone || "未提供"}</td>
                                <td className="py-4 px-4">
                                  {user.is_banned ? (
                                    <span className="px-3 py-1.5 rounded-full text-xs font-yuanqi bg-red-100 text-red-700 border border-red-200 inline-flex items-center gap-1">
                                      <Ban className="w-3 h-3" />
                                      已封禁
                                    </span>
                                  ) : (
                                    <span className="px-3 py-1.5 rounded-full text-xs font-yuanqi bg-green-100 text-green-700 border border-green-200 inline-flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" />
                                      正常
                                    </span>
                                  )}
                                </td>
                                <td className="py-4 px-4 font-jua text-lg text-gray-900">
                                  ¥{Number(user.balance || 0).toFixed(2)}
                                </td>
                                <td className="py-4 px-4">
                                  {addBalanceUserId === user.id ? (
                                    <div className="flex items-center gap-2">
                                      <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="添加金额"
                                        value={addBalanceAmount}
                                        onChange={(e) => setAddBalanceAmount(e.target.value)}
                                        className="w-28 h-9 font-yuanqi"
                                        autoFocus
                                      />
                                      <Button
                                        onClick={() => {
                                          const amount = Number.parseFloat(addBalanceAmount)
                                          if (!isNaN(amount) && amount > 0) {
                                            handleAddBalance(user.id, amount)
                                          }
                                        }}
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 text-white font-yuanqi h-9 px-3"
                                      >
                                        确认
                                      </Button>
                                      <Button
                                        onClick={() => {
                                          setAddBalanceUserId(null)
                                          setAddBalanceAmount("")
                                        }}
                                        size="sm"
                                        variant="ghost"
                                        className="font-yuanqi h-9 px-3"
                                      >
                                        取消
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      onClick={() => setAddBalanceUserId(user.id)}
                                      size="sm"
                                      className="bg-blue-600 hover:bg-blue-700 text-white font-yuanqi"
                                    >
                                      <Plus className="w-4 h-4 mr-1" />
                                      添加余额
                                    </Button>
                                  )}
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-2">
                                    <Button
                                      onClick={() => handleBanUser(user.id, !user.is_banned)}
                                      size="sm"
                                      variant={user.is_banned ? "default" : "outline"}
                                      className={`font-yuanqi ${
                                        user.is_banned
                                          ? "bg-green-600 hover:bg-green-700 text-white"
                                          : "border-amber-600 text-amber-600 hover:bg-amber-50"
                                      }`}
                                    >
                                      {user.is_banned ? (
                                        <>
                                          <CheckCircle className="w-4 h-4 mr-1" />
                                          解封
                                        </>
                                      ) : (
                                        <>
                                          <Ban className="w-4 h-4 mr-1" />
                                          封禁
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      onClick={() => handleDeleteUser(user.id)}
                                      size="sm"
                                      variant="outline"
                                      className="border-red-600 text-red-600 hover:bg-red-50 font-yuanqi"
                                    >
                                      <Trash2 className="w-4 h-4 mr-1" />
                                      删除
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="prizes">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="font-jua text-2xl text-gray-900 mb-1">添加新奖品</h2>
                    <p className="font-yuanqi text-sm text-gray-600">创建新的抽奖奖品</p>
                  </div>
                  <div className="p-6">
                    <form onSubmit={handleAddPrize} className="space-y-6">
                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <Label htmlFor="prize-name" className="font-yuanqi text-gray-700 mb-2 block">
                            奖品名称
                          </Label>
                          <Input
                            id="prize-name"
                            value={prizeName}
                            onChange={(e) => setPrizeName(e.target.value)}
                            required
                            className="font-yuanqi bg-gray-50 border-gray-300 text-gray-900 h-11 focus:border-purple-500"
                            placeholder="例如：iPhone 15 Pro"
                          />
                        </div>
                        <div>
                          <Label htmlFor="prize-probability" className="font-yuanqi text-gray-700 mb-2 block">
                            中奖概率 (%)
                          </Label>
                          <Input
                            id="prize-probability"
                            type="number"
                            step="0.01"
                            value={prizeProbability}
                            onChange={(e) => setPrizeProbability(e.target.value)}
                            required
                            className="font-yuanqi bg-gray-50 border-gray-300 text-gray-900 h-11 focus:border-purple-500"
                            placeholder="例如：5.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="prize-cost" className="font-yuanqi text-gray-700 mb-2 block">
                            抽奖成本 (¥)
                          </Label>
                          <Input
                            id="prize-cost"
                            type="number"
                            step="0.01"
                            value={prizeCost}
                            onChange={(e) => setPrizeCost(e.target.value)}
                            required
                            className="font-yuanqi bg-gray-50 border-gray-300 text-gray-900 h-11 focus:border-purple-500"
                            placeholder="例如：1.00"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="prize-image" className="font-yuanqi text-gray-700 mb-2 block">
                          奖品图片 (上传文件)
                        </Label>
                        <div className="flex items-start gap-4">
                          <label
                            htmlFor="prize-image"
                            className="flex-1 flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-200 rounded-xl hover:border-purple-500/50 transition-all cursor-pointer bg-white/5 hover:bg-white/10 group"
                          >
                            {prizeImagePreview ? (
                              <div className="relative w-full h-full p-4">
                                <img
                                  src={prizeImagePreview || "/placeholder.svg"}
                                  alt="Preview"
                                  className="w-full h-full object-contain rounded-lg"
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setPrizeImageFile(null)
                                    setPrizeImagePreview("")
                                  }}
                                  className="absolute top-2 right-2 p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                >
                                  <X className="w-4 h-4 text-white" />
                                </button>
                              </div>
                            ) : (
                              <div className="text-center">
                                <Upload className="w-10 h-10 text-gray-400 group-hover:text-purple-400 mb-3 mx-auto transition-colors" />
                                <span className="text-sm text-gray-400 font-yuanqi block mb-1">点击上传图片</span>
                                <span className="text-xs text-gray-500 font-yuanqi">PNG, JPG (最大 5MB)</span>
                              </div>
                            )}
                            <input
                              id="prize-image"
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-11 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 font-yuanqi text-base shadow-lg hover:shadow-xl transition-all"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        添加奖品
                      </Button>
                    </form>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="font-jua text-2xl text-gray-900 mb-1">奖品列表</h2>
                    <p className="font-yuanqi text-sm text-gray-600">所有可抽取的奖品</p>
                  </div>
                  <div className="p-6">
                    {prizes.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 font-yuanqi">暂无奖品数据</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {prizes.map((prize) => (
                          <div
                            key={prize.id}
                            className="group relative bg-white hover:bg-white/10 rounded-xl p-4 border border-gray-200 hover:border-purple-500/30 transition-all"
                          >
                            <div className="aspect-square relative mb-3 rounded-lg overflow-hidden bg-white/5">
                              <img
                                src={prize.image_url || "/placeholder.svg"}
                                alt={prize.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <h3 className="font-yuanqi text-gray-900 mb-2 truncate">{prize.name}</h3>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-yuanqi text-gray-600">
                                概率: <span className="text-purple-600 font-semibold">{prize.probability}%</span>
                              </span>
                              <span className="text-xs font-yuanqi text-gray-600">
                                成本:{" "}
                                <span className="text-green-600 font-semibold">
                                  ¥{Number(prize.cost || 0).toFixed(2)}
                                </span>
                              </span>
                            </div>
                            <Button
                              onClick={() => handleDeletePrize(prize.id)}
                              size="sm"
                              className="w-full bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 font-yuanqi"
                              variant="ghost"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              删除
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="history">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="font-jua text-2xl text-gray-900 mb-1">抽奖记录</h2>
                    <p className="font-yuanqi text-sm text-gray-600">所有用户的抽奖历史</p>
                  </div>
                  <div className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-4 px-4 font-yuanqi font-semibold text-gray-700 text-sm">
                              用户名
                            </th>
                            <th className="text-left py-4 px-4 font-yuanqi font-semibold text-gray-700 text-sm">
                              抽中奖品
                            </th>
                            <th className="text-left py-4 px-4 font-yuanqi font-semibold text-gray-700 text-sm">
                              抽奖方式
                            </th>
                            <th className="text-left py-4 px-4 font-yuanqi font-semibold text-gray-700 text-sm">
                              抽奖时间
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {drawHistory.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="text-center py-12 text-gray-500 font-yuanqi">
                                暂无抽奖记录
                              </td>
                            </tr>
                          ) : (
                            drawHistory.map((record) => (
                              <tr
                                key={record.id}
                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                              >
                                <td className="py-4 px-4 font-yuanqi text-gray-900">{record.username}</td>
                                <td className="py-4 px-4 font-yuanqi text-purple-600">{record.prize_name}</td>
                                <td className="py-4 px-4">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-yuanqi ${
                                      record.draw_type === "multi"
                                        ? "bg-blue-100 text-blue-600 border border-blue-200"
                                        : "bg-green-100 text-green-600 border border-green-200"
                                    }`}
                                  >
                                    {record.draw_type === "multi" ? "5连抽" : "单抽"}
                                  </span>
                                </td>
                                <td className="py-4 px-4 font-yuanqi text-gray-600">
                                  {new Date(record.created_at).toLocaleString("zh-CN")}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="transactions">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="font-jua text-2xl text-gray-900 mb-1">余额流水记录</h2>
                    <p className="font-yuanqi text-sm text-gray-600">查看所有用户的余额变动记录</p>
                  </div>
                  <div className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-4 px-4 font-yuanqi font-semibold text-gray-700 text-sm">
                              用户ID
                            </th>
                            <th className="text-left py-4 px-4 font-yuanqi font-semibold text-gray-700 text-sm">
                              金额 (¥)
                            </th>
                            <th className="text-left py-4 px-4 font-yuanqi font-semibold text-gray-700 text-sm">
                              类型
                            </th>
                            <th className="text-left py-4 px-4 font-yuanqi font-semibold text-gray-700 text-sm">
                              说明
                            </th>
                            <th className="text-left py-4 px-4 font-yuanqi font-semibold text-gray-700 text-sm">
                              时间
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {balanceTransactions.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="text-center py-12 text-gray-500 font-yuanqi">
                                暂无流水记录
                              </td>
                            </tr>
                          ) : (
                            balanceTransactions.map((transaction) => (
                              <tr
                                key={transaction.id}
                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                              >
                                <td className="py-4 px-4 font-yuanqi text-gray-900">{transaction.user_id}</td>
                                <td className="py-4 px-4">
                                  <span
                                    className={`font-jua text-base ${
                                      transaction.type === "admin_add" ? "text-green-600" : "text-red-600"
                                    }`}
                                  >
                                    {transaction.type === "admin_add" ? "+" : "-"}¥
                                    {Number(transaction.amount || 0).toFixed(2)}
                                  </span>
                                </td>
                                <td className="py-4 px-4">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-yuanqi ${
                                      transaction.type === "admin_add"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {transaction.type === "admin_add" ? "管理员充值" : "抽奖扣除"}
                                  </span>
                                </td>
                                <td className="py-4 px-4 font-yuanqi text-gray-600 text-sm">
                                  {transaction.description || "-"}
                                </td>
                                <td className="py-4 px-4 font-yuanqi text-gray-600 text-sm">
                                  {new Date(transaction.created_at).toLocaleString("zh-CN")}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </FontLoader>
  )
}
