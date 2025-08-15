import { UAParser } from "ua-parser-js"

export async function getDeviceInfo() {
  const parser = new UAParser()
  const result = parser.getResult()

  let publicIP = "Unknown"
  let isp = "Unknown"
  let city = "Unknown"
  let country = "Unknown"
  let region = "Unknown"
  let timezone = "Unknown"
  let latitude = "Unknown"
  let longitude = "Unknown"
  let postalCode = "Unknown"
  let asn = "Unknown"
  let org = "Unknown"

  try {
    // 使用多个IP信息服务获取详细信息
    const responses = await Promise.allSettled([
      fetch("https://ipapi.co/json/"),
      fetch("https://ip-api.com/json/"),
      fetch("https://ipinfo.io/json"),
    ])

    // 处理第一个成功的响应
    for (const response of responses) {
      if (response.status === "fulfilled" && response.value.ok) {
        const data = await response.value.json()

        if (data.ip || data.query) {
          publicIP = data.ip || data.query || publicIP
          isp = data.isp || data.as || data.org || isp
          city = data.city || city
          country = data.country_name || data.country || country
          region = data.region || data.regionName || region
          timezone = data.timezone || timezone
          latitude = data.latitude || data.lat || latitude
          longitude = data.longitude || data.lon || longitude
          postalCode = data.postal || data.zip || postalCode
          asn = data.asn || data.as || asn
          org = data.org || data.isp || org
          break
        }
      }
    }
  } catch (error) {
    console.error("Error fetching location:", error)
  }

  // 获取更详细的浏览器信息
  const connection =
    (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

  // 获取电池信息（如果可用）
  let batteryInfo = "Not available"
  try {
    if ("getBattery" in navigator) {
      const battery = await (navigator as any).getBattery()
      batteryInfo = `${Math.round(battery.level * 100)}% (${battery.charging ? "Charging" : "Not charging"})`
    }
  } catch (e) {
    // Battery API not available
  }

  // 获取内存信息（如果可用）
  const memory = (navigator as any).deviceMemory || "Unknown"
  const hardwareConcurrency = navigator.hardwareConcurrency || "Unknown"

  // 获取更多屏幕信息
  const screen = window.screen
  const screenDetails = {
    resolution: `${screen.width}x${screen.height}`,
    availableResolution: `${screen.availWidth}x${screen.availHeight}`,
    colorDepth: screen.colorDepth,
    pixelDepth: screen.pixelDepth,
    orientation: screen.orientation?.type || "Unknown",
  }

  // 获取视口信息
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
  }

  // 获取时区信息
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const locale = navigator.language
  const languages = navigator.languages.join(", ")

  return {
    // 基本设备信息
    deviceModel: `${result.device.vendor || ""} ${result.device.model || ""}`.trim() || "Unknown",
    deviceType: result.device.type || "Unknown",
    osName: result.os.name || "Unknown",
    osVersion: result.os.version || "Unknown",
    browserName: result.browser.name || "Unknown",
    browserVersion: result.browser.version || "Unknown",
    browserEngine: result.engine.name || "Unknown",
    browserEngineVersion: result.engine.version || "Unknown",

    // 网络信息
    publicIP,
    isp,
    city,
    country,
    region,
    timezone,
    latitude,
    longitude,
    postalCode,
    asn,
    org,

    // 连接信息
    connectionType: connection?.effectiveType || "Unknown",
    connectionSpeed: connection?.downlink ? `${connection.downlink} Mbps` : "Unknown",
    connectionRTT: connection?.rtt ? `${connection.rtt} ms` : "Unknown",

    // 屏幕和显示信息
    screenResolution: screenDetails.resolution,
    availableScreenResolution: screenDetails.availableResolution,
    colorDepth: screenDetails.colorDepth,
    pixelDepth: screenDetails.pixelDepth,
    screenOrientation: screenDetails.orientation,
    viewportSize: `${viewport.width}x${viewport.height}`,
    devicePixelRatio: viewport.devicePixelRatio,

    // 系统信息
    language: locale,
    languages: languages,
    timeZone: timeZone,
    platform: navigator.platform,
    userAgent: navigator.userAgent,

    // 硬件信息
    cpuCores: hardwareConcurrency,
    deviceMemory: memory !== "Unknown" ? `${memory} GB` : "Unknown",
    batteryStatus: batteryInfo,

    // 其他信息
    cookieEnabled: navigator.cookieEnabled,
    onlineStatus: navigator.onLine,
    javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false,

    // 时间信息
    localTime: new Date().toLocaleString(),
    utcTime: new Date().toUTCString(),
    timestamp: Date.now(),
  }
}
