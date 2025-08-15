export async function captureScreenshot(): Promise<string | null> {
  try {
    // 使用 html2canvas 库来截图
    const html2canvas = (await import("html2canvas")).default

    // 截取整个页面
    const canvas = await html2canvas(document.body, {
      useCORS: true,
      allowTaint: true,
      scale: 1,
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: 0,
      scrollY: 0,
      logging: true,
    })

    // 转换为 base64
    return canvas.toDataURL("image/png", 0.9)
  } catch (error) {
    console.error("Error capturing screenshot:", error)
    return null
  }
}

export async function captureModalScreenshot(modalElement: HTMLElement): Promise<string | null> {
  try {
    const html2canvas = (await import("html2canvas")).default

    // 等待一段时间确保渲染完成
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 截取特定的模态框元素
    const canvas = await html2canvas(modalElement, {
      useCORS: true,
      allowTaint: true,
      scale: 2,
      backgroundColor: "#ffffff",
      logging: true,
      removeContainer: true,
      foreignObjectRendering: true,
      onclone: (clonedDoc) => {
        // 确保克隆文档中的样式正确
        const styles = `
          * {
            visibility: visible !important;
            opacity: 1 !important;
            color: #999999 !important;
          }
          .chinese-text {
            font-family: "YuanQiPaoPao", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif !important;
          }
        `
        const styleSheet = clonedDoc.createElement("style")
        styleSheet.textContent = styles
        clonedDoc.head.appendChild(styleSheet)
      },
    })

    return canvas.toDataURL("image/png", 0.9)
  } catch (error) {
    console.error("Error capturing modal screenshot:", error)
    return null
  }
}

// 新增：简单的截图测试函数
export async function testScreenshot(element: HTMLElement): Promise<void> {
  try {
    const html2canvas = (await import("html2canvas")).default

    console.log("开始测试截图...")
    console.log("元素尺寸:", element.offsetWidth, "x", element.offsetHeight)

    const canvas = await html2canvas(element, {
      logging: true,
      useCORS: true,
      allowTaint: true,
      scale: 1,
      backgroundColor: "#ffffff",
    })

    console.log("截图成功，画布尺寸:", canvas.width, "x", canvas.height)

    // 创建一个临时链接下载截图用于调试
    const link = document.createElement("a")
    link.download = "test-screenshot.png"
    link.href = canvas.toDataURL()
    link.click()
  } catch (error) {
    console.error("测试截图失败:", error)
  }
}
