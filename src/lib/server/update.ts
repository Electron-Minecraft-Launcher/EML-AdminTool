import { ServerError } from '$lib/utils/errors';
import { NotificationCode } from '$lib/utils/notifications';
import pkg from '../../../package.json'

export async function getUpdate() {
  let data

  try {
    const response = await fetch('https://api.github.com/repos/Electron-Minecraft-Launcher/EML-AdminTool/releases/latest')
    if (response.ok) {
      data = (await response.json()) as { tag_name: string; published_at: string; body: string }
    } else {
      console.error('Failed to fetch latest release:', response.statusText)
      data = { tag_name: pkg.version, published_at: Date.now().toString().split('T')[0], body: '' }
    }
  } catch (err) {
    console.error('Failed to fetch latest release:', err)
    data = { tag_name: pkg.version, published_at: Date.now().toString().split('T')[0], body: '' }
  }

  const currentVersion = pkg.version
  const latestVersion = data.tag_name.replace('v', '') ?? currentVersion
  const releaseDate = data.published_at.split('T')[0] ?? Date.now().toString().split('T')[0]
  const shortLastVersion = latestVersion.split('.').slice(0, 2).join('.')
  const logoUrl = `https://raw.githubusercontent.com/Electron-Minecraft-Launcher/EML-AdminTool/refs/heads/main/.github/changelogs/v${shortLastVersion}.png`
  const changelogs = data.body

  return { currentVersion, latestVersion, releaseDate, logoUrl, changelogs }
}

export async function update() {
  const updaterHost = `http://upd:4000`
  const apiToken = process.env.UPDATER_HTTP_API_TOKEN

  if (!apiToken) {
    console.error('Updater API token is not configured.')
    throw new ServerError('Update service not configured.', null, NotificationCode.UPDATER_ERROR)
  }

  try {
    const response = await fetch(`${updaterHost}/update`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiToken}` }
    })

    if (!response.ok) {
      console.error('Update service returned an error:', response.statusText)
      throw new ServerError('Update service returned an error', null, NotificationCode.UPDATER_ERROR)
    }
  } catch (err) {
    console.error('Failed to reach the update service:', err)
    throw new ServerError('Could not reach the update service', err, NotificationCode.UPDATER_ERROR)
  }
}




