import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface InfoModalProps {
  isOpen: boolean
  onSubmit: (info: { phone: string }) => void
}

export default function InfoModal({ isOpen, onSubmit }: InfoModalProps) {
  const [phone, setPhone] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ phone: `+60${phone}` })

    if (typeof window !== "undefined") {
      window.localStorage.setItem("userPhone", `+60${phone}`)
    }

    setPhone("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px] bg-white text-[#999999] border-2 border-[#999999] rounded-xl shadow-2xl shadow-[#999999]/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#999999] to-[#E6F3FF] chinese-text">请输入您的电话号码以开始抽卡</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="phone" className="text-[#999999] chinese-text">电话号码</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md font-system">
                +60
              </span>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="rounded-none rounded-r-lg bg-[#E6F3FF] text-[#999999] border-[#999999] focus:border-[#999999] focus:ring-[#999999] font-system"
              />
            </div>
          </div>
          <Button type="submit" className="w-full bg-[#999999] text-white hover:bg-[#888888] transition-colors duration-300 chinese-text">开始抽卡</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
