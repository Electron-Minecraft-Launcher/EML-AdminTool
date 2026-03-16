import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { getMaintenance } from '$lib/server/maintenance'

export const GET: RequestHandler = async () => {
  let maintenance

  try {
    maintenance = await getMaintenance()
  } catch (err) {
    return json({ success: false, message: 'Failed to get maintenance' }, { status: 500 })
  }

  let res

  if (!maintenance) {
    res = {
      success: true,
      startTime: null,
      endTime: null,
      message: ''
    }
  } else {
    res = {
      success: true,
      startTime: maintenance.startTime,
      endTime: maintenance.endTime,
      message: maintenance.message
    }
  }

  return json(res)
}

