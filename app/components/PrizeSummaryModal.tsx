import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface PrizeSummaryModalProps {
  isOpen: boolean
  onClose: () => void
  prizes: string[]
}

export default function PrizeSummaryModal({ isOpen, onClose, prizes }: PrizeSummaryModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white text-[#999999] border-2 border-[#999999] rounded-xl shadow-2xl shadow-[#999999]/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#999999] to-[#E6F3FF] chinese-text">5连抽结果</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-2">
          {prizes.map((prize, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="chinese-text">第 {index + 1} 次:</span>
              <span className="font-bold chinese-text">{prize}</span>
            </div>
          ))}
        </div>
        <Button 
          onClick={onClose} 
          className="w-full mt-6 bg-[#999999] text-white hover:bg-[#888888] transition-colors duration-300 chinese-text"
        >
          关闭
        </Button>
      </DialogContent>
    </Dialog>
  )
}
