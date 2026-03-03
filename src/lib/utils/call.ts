import { applyAction } from '$app/forms'
import { addNotification } from '$lib/stores/notifications'
import type { NotificationCode } from '$lib/utils/notifications'
import type en from '$lib/locales/en'

type CallActionOptions = {
  url: string
  action: string
  formData: FormData
  apply?: boolean
  notify?: boolean
}

export async function callAction({ url, action, formData, apply = true, notify = true }: CallActionOptions, $l: typeof en): Promise<any> {
  let response: Response
  try {
    response = await fetch(`${url}?/${action}`, { method: 'POST', body: formData })
  } catch (err) {
    if (notify) addNotification('ERROR', $l.notifications.INTERNAL_SERVER_ERROR)
    return null
  }

  let result
  try {
    result = await response.json()
  } catch (err) {
    if (notify) addNotification('ERROR', $l.notifications.INTERNAL_SERVER_ERROR)
    return null
  }

  if (result.type === 'failure') {
    if (notify) {
      const code = result.data?.failure as NotificationCode
      const msg = $l.notifications[code] ?? $l.notifications.INTERNAL_SERVER_ERROR
      addNotification('ERROR', msg)
    }
  }

  if (apply) await applyAction(result)

  if (result.type === 'success') {
    return { ...result, data: denormalize(result.data) }
  }

  return result
}

function denormalize(dataString: string) {
  try {
    const flatArray = JSON.parse(dataString)

    const resolve: (index: any) => any = (index: any) => {
      if (typeof index !== 'number') return index

      const value = flatArray[index]

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const newObj: any = {}
        for (const key in value) {
          newObj[key] = resolve(value[key])
        }
        return newObj
      }

      if (Array.isArray(value)) return value.map((item) => resolve(item))

      return value
    }

    return resolve(0)
  } catch (err) {
    console.error('Failed to denormalize data:', err)
    return null
  }
}
