import { writable, type Writable } from 'svelte/store'

export type NotificationType = 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO'

export interface Notification {
  id: number
  message: string
  type: NotificationType
  duration: number
}

let counter = 0

export const notifications: Writable<Notification[]> = writable<Notification[]>([])

export function addNotification(type: NotificationType, message: string, duration?: number): void {
  const id = counter++
  duration = duration ?? 3000 + message.length * 100

  notifications.update((currentNotifications) => [...currentNotifications, { id, message, type, duration }])

  setTimeout(() => {
    removeNotification(id)
  }, duration)
}

export function removeNotification(id: number): void {
  notifications.update((currentNotifications) => currentNotifications.filter((notification) => notification.id !== id))
}

export function clearNotifications(): void {
  notifications.set([])
}


