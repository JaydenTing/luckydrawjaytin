import { NextResponse } from 'next/server'

const BOT_TOKEN = '7546999577:AAFPtXzB91hlz_dLy_sF2KNMuNCGiTbD6Go'
const HISTORY_GROUP_ID = '-1002267449607'
const WINNER_GROUP_ID = '-1002456373939'

export async function POST(request: Request) {
  const { phone, prize, date, deviceInfo, username, fullName } = await request.json()

  const deviceInfoString = `
Device Info:
- Model: ${deviceInfo.deviceModel}
- OS: ${deviceInfo.osName} ${deviceInfo.osVersion}
- Browser: ${deviceInfo.browserName} ${deviceInfo.browserVersion}
- Screen Size: ${deviceInfo.screenSize}
- Language: ${deviceInfo.language}

Network Info:
- Public IP: ${deviceInfo.publicIP}
- ISP: ${deviceInfo.isp}
- City: ${deviceInfo.city}
- Country: ${deviceInfo.country}
  `.trim()

  const userInfo = `
User Info:
- Username: ${username}
- Full Name: ${fullName || 'Not provided'}
- Phone: ${phone || 'Not provided'}
  `.trim()

  const historyMessage = `Hey, I'm the JayTIN Team Management Center bot! User has successfully used https://jaytin.online/ to participate in a JayTIN lucky draw at ${date}.

${userInfo}

${deviceInfoString}`

  const winnerMessage = `Hey, I'm the JayTIN Team Management Center bot! User has successfully used https://jaytin.online/ to participate in a lucky draw at ${date}. The user won: ${prize}! Good Luck!!!!

${userInfo}

${deviceInfoString}`

  try {
    // Send message to history group
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: HISTORY_GROUP_ID,
        text: historyMessage,
      }),
    })

    // Send message to winner group
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: WINNER_GROUP_ID,
        text: winnerMessage,
      }),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending Telegram message:', error)
    return NextResponse.json({ success: false, error: 'Failed to send Telegram message' }, { status: 500 })
  }
}
