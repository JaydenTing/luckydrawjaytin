import { UAParser } from 'ua-parser-js';

export async function getDeviceInfo() {
  const parser = new UAParser();
  const result = parser.getResult();

  let publicIP = 'Unknown';
  let isp = 'Unknown';
  let city = 'Unknown';
  let country = 'Unknown';

  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    publicIP = data.ip;
    isp = data.org;
    city = data.city;
    country = data.country_name;
  } catch (error) {
    console.error('Error fetching location:', error);
  }

  return {
    deviceModel: `${result.device.vendor || ''} ${result.device.model || ''}`.trim() || 'Unknown',
    osName: result.os.name || 'Unknown',
    osVersion: result.os.version || 'Unknown',
    browserName: result.browser.name || 'Unknown',
    browserVersion: result.browser.version || 'Unknown',
    publicIP,
    isp,
    city,
    country,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language,
  };
}
