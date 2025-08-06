// 简化的数据库操作类（使用localStorage模拟）
export interface User {
  id: number
  username: string
  password: string
  phone?: string
  email?: string
  full_name?: string
  avatar_url?: string
  status: 'active' | 'inactive' | 'banned'
  draw_chances: number
  total_draws: number
  created_at: string
  updated_at: string
}

export interface Admin {
  id: number
  username: string
  password: string
  email?: string
  role: 'super_admin' | 'admin'
  created_at: string
}

export interface Prize {
  id: number
  name: string
  description?: string
  probability: number
  image_url?: string
  value: number
  stock: number
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface DrawRecord {
  id: number
  user_id: number
  prize_id: number
  prize_name: string
  draw_type: 'single' | 'multi'
  device_info?: string
  ip_address?: string
  created_at: string
}

export interface DrawChanceRecord {
  id: number
  user_id: number
  admin_id: number
  chances_added: number
  reason?: string
  created_at: string
}

class Database {
  private getNextId(table: string): number {
    const data = this.getTable(table)
    return data.length > 0 ? Math.max(...data.map((item: any) => item.id)) + 1 : 1
  }

  private getTable(table: string): any[] {
    const data = localStorage.getItem(`db_${table}`)
    return data ? JSON.parse(data) : []
  }

  private setTable(table: string, data: any[]): void {
    localStorage.setItem(`db_${table}`, JSON.stringify(data))
  }

  // 初始化数据库
  init(): void {
    // 初始化管理员
    const admins = this.getTable('admins')
    if (admins.length === 0) {
      this.setTable('admins', [{
        id: 1,
        username: 'admin',
        password: 'admin123', // 实际应用中应该加密
        email: 'admin@jaytin.com',
        role: 'super_admin',
        created_at: new Date().toISOString()
      }])
    }

    // 初始化奖品
    const prizes = this.getTable('prizes')
    if (prizes.length === 0) {
      const defaultPrizes = [
        { name: "AirPods Pro 2", description: "苹果无线耳机", probability: 0.0001, value: 1299.00, stock: 5 },
        { name: "IPHONE 16 PRO MAX", description: "苹果最新手机", probability: 0.0001, value: 9999.00, stock: 2 },
        { name: "Apple Watch S10", description: "苹果智能手表", probability: 0.0002, value: 2999.00, stock: 3 },
        { name: "手机支架", description: "便携手机支架", probability: 0.02, value: 29.90, stock: 100 },
        { name: "蓝牙音箱", description: "便携蓝牙音箱", probability: 0.005, value: 199.00, stock: 50 },
        { name: "氛围灯", description: "RGB氛围灯", probability: 0.01, value: 89.00, stock: 80 },
        { name: "投影仪", description: "便携投影仪", probability: 0.001, value: 1999.00, stock: 10 },
        { name: "钥匙扣(自选 限5令吉)", description: "定制钥匙扣", probability: 0.01, value: 5.00, stock: 200 },
        { name: "零食", description: "精选零食包", probability: 0.02, value: 25.00, stock: 300 },
        { name: "创意收纳盒", description: "多功能收纳盒", probability: 0.01, value: 39.90, stock: 150 },
        { name: "RM1000 TNG", description: "电子钱包充值", probability: 0.0001, value: 1000.00, stock: 5 },
        { name: "限量版高端礼盒（价值RM599)", description: "精美礼品盒", probability: 0.0002, value: 599.00, stock: 10 },
        { name: "下单送小礼物", description: "购物优惠", probability: 0.02, value: 0.00, stock: -1 },
        { name: "RM0.01 TNG", description: "电子钱包充值", probability: 0.05, value: 0.01, stock: -1 },
        { name: "DJI Goggles N3", description: "DJI飞行眼镜", probability: 0.0001, value: 2999.00, stock: 3 },
        { name: "RM0.10 TNG", description: "电子钱包充值", probability: 0.03, value: 0.10, stock: -1 },
        { name: "POP MART 盲盒（可选）", description: "潮流盲盒", probability: 0.005, value: 59.00, stock: 100 },
        { name: "获取奖品只是次数问题 继续期待！", description: "鼓励奖", probability: 0.80, value: 0.00, stock: -1 }
      ].map((prize, index) => ({
        id: index + 1,
        ...prize,
        status: 'active' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
      
      this.setTable('prizes', defaultPrizes)
    }
  }

  // 用户操作
  createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): User {
    const users = this.getTable('users')
    const newUser: User = {
      id: this.getNextId('users'),
      ...userData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    users.push(newUser)
    this.setTable('users', users)
    return newUser
  }

  getUserByUsername(username: string): User | null {
    const users = this.getTable('users')
    return users.find(user => user.username === username) || null
  }

  getUserById(id: number): User | null {
    const users = this.getTable('users')
    return users.find(user => user.id === id) || null
  }

  updateUser(id: number, updates: Partial<User>): User | null {
    const users = this.getTable('users')
    const index = users.findIndex(user => user.id === id)
    if (index === -1) return null
    
    users[index] = { ...users[index], ...updates, updated_at: new Date().toISOString() }
    this.setTable('users', users)
    return users[index]
  }

  getAllUsers(): User[] {
    return this.getTable('users')
  }

  deleteUser(id: number): boolean {
    const users = this.getTable('users')
    const filteredUsers = users.filter(user => user.id !== id)
    if (filteredUsers.length === users.length) return false
    this.setTable('users', filteredUsers)
    return true
  }

  // 管理员操作
  getAdminByUsername(username: string): Admin | null {
    const admins = this.getTable('admins')
    return admins.find(admin => admin.username === username) || null
  }

  // 奖品操作
  getAllPrizes(): Prize[] {
    return this.getTable('prizes')
  }

  createPrize(prizeData: Omit<Prize, 'id' | 'created_at' | 'updated_at'>): Prize {
    const prizes = this.getTable('prizes')
    const newPrize: Prize = {
      id: this.getNextId('prizes'),
      ...prizeData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    prizes.push(newPrize)
    this.setTable('prizes', prizes)
    return newPrize
  }

  updatePrize(id: number, updates: Partial<Prize>): Prize | null {
    const prizes = this.getTable('prizes')
    const index = prizes.findIndex(prize => prize.id === id)
    if (index === -1) return null
    
    prizes[index] = { ...prizes[index], ...updates, updated_at: new Date().toISOString() }
    this.setTable('prizes', prizes)
    return prizes[index]
  }

  deletePrize(id: number): boolean {
    const prizes = this.getTable('prizes')
    const filteredPrizes = prizes.filter(prize => prize.id !== id)
    if (filteredPrizes.length === prizes.length) return false
    this.setTable('prizes', filteredPrizes)
    return true
  }

  // 抽奖记录操作
  createDrawRecord(recordData: Omit<DrawRecord, 'id' | 'created_at'>): DrawRecord {
    const records = this.getTable('draw_records')
    const newRecord: DrawRecord = {
      id: this.getNextId('draw_records'),
      ...recordData,
      created_at: new Date().toISOString()
    }
    records.push(newRecord)
    this.setTable('draw_records', records)
    return newRecord
  }

  getDrawRecordsByUserId(userId: number): DrawRecord[] {
    const records = this.getTable('draw_records')
    return records.filter(record => record.user_id === userId)
  }

  getAllDrawRecords(): DrawRecord[] {
    return this.getTable('draw_records')
  }

  // 抽奖机会记录操作
  createDrawChanceRecord(recordData: Omit<DrawChanceRecord, 'id' | 'created_at'>): DrawChanceRecord {
    const records = this.getTable('draw_chance_records')
    const newRecord: DrawChanceRecord = {
      id: this.getNextId('draw_chance_records'),
      ...recordData,
      created_at: new Date().toISOString()
    }
    records.push(newRecord)
    this.setTable('draw_chance_records', records)
    return newRecord
  }

  getDrawChanceRecordsByUserId(userId: number): DrawChanceRecord[] {
    const records = this.getTable('draw_chance_records')
    return records.filter(record => record.user_id === userId)
  }
}

export const db = new Database()
