import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from 'next/image'

interface Prize {
  name: string
  probability: number
  image_url?: string
}

interface PrizeModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  prize: Prize | null // 修改为 Prize 对象
}

export default function PrizeModal({ isOpen, onClose, onConfirm, prize }: PrizeModalProps) {
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          onConfirm();
        }
      }}
    >
      <DialogContent 
        className="sm:max-w-[425px] bg-white text-[#999999] border-2 border-[#999999] rounded-xl shadow-2xl shadow-[#999999]/20 p-6" // 调整内边距
        aria-describedby="prize-description"
      >
        <DialogHeader className="text-center"> {/* 标题居中 */}
          <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#999999] to-[#E6F3FF] chinese-text">恭喜您抽中了奖品！</DialogTitle>
          <DialogDescription id="prize-description" className="text-[#999999] opacity-80 chinese-text mt-2">
            您获得的奖品如下：
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center my-6">
          {prize?.image_url && (
            <Image
              src={prize.image_url || "/placeholder.svg"}
              alt={prize.name}
              width={150}
              height={150}
              className="object-contain mb-4 drop-shadow-md"
            />
          )}
          <div className="text-center text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#999999] to-[#E6F3FF] chinese-text">
            {prize?.name}
          </div>
        </div>
        <div className="flex flex-col gap-3"> {/* 按钮垂直堆叠，增加间距 */}
          <Button 
            onClick={() => {
              onConfirm();
            }} 
            className="w-full bg-[#999999] text-white hover:bg-[#888888] transition-colors duration-300 chinese-text"
          >
            确定
          </Button>
          <a 
            href="https://wa.me/+60105814937" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#999999] text-white hover:bg-[#888888] h-10 px-4 py-2 chinese-text" // 统一按钮颜色
          >
            联系客服领取奖励
          </a>
        </div>
      </DialogContent>
    </Dialog>
  )
}
