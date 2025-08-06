import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, User, Mail, Phone } from 'lucide-react'
import { db } from '@/lib/database'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (user: any) => void
}

export default function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [activeTab, setActiveTab] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // 登录表单
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  })

  // 注册表单
  const [registerForm, setRegisterForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    email: '',
    full_name: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // 初始化数据库
      db.init()
      
      const user = db.getUserByUsername(loginForm.username)
      if (!user || user.password !== loginForm.password) {
        setError('用户名或密码错误')
        return
      }

      if (user.status !== 'active') {
        setError('账户已被禁用，请联系管理员')
        return
      }

      onLogin(user)
      onClose()
    } catch (error) {
      setError('登录失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (registerForm.password !== registerForm.confirmPassword) {
        setError('两次输入的密码不一致')
        return
      }

      if (registerForm.password.length < 6) {
        setError('密码长度至少6位')
        return
      }

      // 检查用户名是否已存在
      const existingUser = db.getUserByUsername(registerForm.username)
      if (existingUser) {
        setError('用户名已存在')
        return
      }

      // 创建新用户
      const newUser = db.createUser({
        username: registerForm.username,
        password: registerForm.password,
        phone: registerForm.phone,
        email: registerForm.email,
        full_name: registerForm.full_name,
        status: 'active',
        draw_chances: 0,
        total_draws: 0
      })

      onLogin(newUser)
      onClose()
    } catch (error) {
      setError('注册失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px] bg-white text-[#999999] border-2 border-[#999999] rounded-xl shadow-2xl shadow-[#999999]/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#999999] to-[#E6F3FF] chinese-text text-center">
            欢迎来到 JayTIN
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">登录</TabsTrigger>
            <TabsTrigger value="register">注册</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-[#999999] chinese-text">用户名</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    className="pl-10 bg-[#E6F3FF] text-[#999999] border-[#999999] focus:border-[#999999] focus:ring-[#999999]"
                    placeholder="请输入用户名"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#999999] chinese-text">密码</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="pr-10 bg-[#E6F3FF] text-[#999999] border-[#999999] focus:border-[#999999] focus:ring-[#999999]"
                    placeholder="请输入密码"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-[#999999]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm chinese-text">{error}</div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-[#999999] text-white hover:bg-[#888888] transition-colors duration-300 chinese-text"
                disabled={isLoading}
              >
                {isLoading ? '登录中...' : '登录'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-username" className="text-[#999999] chinese-text">用户名</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="reg-username"
                    type="text"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                    className="pl-10 bg-[#E6F3FF] text-[#999999] border-[#999999] focus:border-[#999999] focus:ring-[#999999]"
                    placeholder="请输入用户名"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-fullname" className="text-[#999999] chinese-text">姓名</Label>
                <Input
                  id="reg-fullname"
                  type="text"
                  value={registerForm.full_name}
                  onChange={(e) => setRegisterForm({ ...registerForm, full_name: e.target.value })}
                  className="bg-[#E6F3FF] text-[#999999] border-[#999999] focus:border-[#999999] focus:ring-[#999999]"
                  placeholder="请输入真实姓名"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-phone" className="text-[#999999] chinese-text">电话号码</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                    +60
                  </span>
                  <Input
                    id="reg-phone"
                    type="tel"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: `+60${e.target.value}` })}
                    className="rounded-none rounded-r-lg bg-[#E6F3FF] text-[#999999] border-[#999999] focus:border-[#999999] focus:ring-[#999999]"
                    placeholder="请输入电话号码"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-email" className="text-[#999999] chinese-text">邮箱</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="reg-email"
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="pl-10 bg-[#E6F3FF] text-[#999999] border-[#999999] focus:border-[#999999] focus:ring-[#999999]"
                    placeholder="请输入邮箱地址"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password" className="text-[#999999] chinese-text">密码</Label>
                <Input
                  id="reg-password"
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  className="bg-[#E6F3FF] text-[#999999] border-[#999999] focus:border-[#999999] focus:ring-[#999999]"
                  placeholder="请输入密码（至少6位）"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-confirm-password" className="text-[#999999] chinese-text">确认密码</Label>
                <Input
                  id="reg-confirm-password"
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                  className="bg-[#E6F3FF] text-[#999999] border-[#999999] focus:border-[#999999] focus:ring-[#999999]"
                  placeholder="请再次输入密码"
                  required
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm chinese-text">{error}</div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-[#999999] text-white hover:bg-[#888888] transition-colors duration-300 chinese-text"
                disabled={isLoading}
              >
                {isLoading ? '注册中...' : '注册账户'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
