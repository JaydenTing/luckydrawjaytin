import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface PrizeModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  prize: string | null
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
        className="sm:max-w-[425px] bg-white text-[#999999] border-2 border-[#999999] rounded-xl shadow-2xl shadow-[#999999]/20"
        aria-describedby="prize-description"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#999999] to-[#E6F3FF] chinese-text">恭喜您抽中了奖品！</DialogTitle>
          <DialogDescription id="prize-description" className="text-[#999999] opacity-80 chinese-text">
            您获得的奖品如下：
          </DialogDescription>
        </DialogHeader>
        <div className="text-center text-3xl font-bold my-6 text-transparent bg-clip-text bg-gradient-to-r from-[#999999] to-[#E6F3FF] chinese-text">
          {prize}
        </div>
        <Button 
          onClick={() => {
            onConfirm();
          }} 
          className="w-full bg-[#999999] text-white hover:bg-[#888888] transition-colors duration-300 chinese-text"
        >
          确定
        </Button>
      </DialogContent>
    </Dialog>
  )
}
