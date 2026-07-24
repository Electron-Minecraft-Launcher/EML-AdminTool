import { building } from '$app/environment'

type RateWindow = {
  expiresAt: number
  count: number
}

interface ActionLimitRule {
  windowMs: number
  maxRequests: number
}

interface LimiterConfig {
  handshakeWindowMs: number
  actionLimits: ActionLimitRule[]
}

class FeatureLimiter {
  private readonly handshakeCooldowns = new Map<string, number>()
  private readonly actionWindows = new Map<string, RateWindow[]>()

  constructor(private readonly config: LimiterConfig) {}

  public canCreateHandshakeToken(key: string, now = Date.now()): boolean {
    const expiresAt = this.handshakeCooldowns.get(key)
    return !(expiresAt && expiresAt > now)
  }

  public registerHandshakeToken(key: string, now = Date.now()): void {
    this.handshakeCooldowns.set(key, now + this.config.handshakeWindowMs)
  }

  public canPerformAction(key: string, now = Date.now()): boolean {
    let windows = this.actionWindows.get(key)

    if (!windows || windows.length !== this.config.actionLimits.length) {
      windows = this.config.actionLimits.map((rule) => ({
        count: 0,
        expiresAt: now + rule.windowMs
      }))
      this.actionWindows.set(key, windows)
    }

    for (let i = 0; i < windows.length; i++) {
      if (windows[i].expiresAt <= now) {
        windows[i].count = 0
        windows[i].expiresAt = now + this.config.actionLimits[i].windowMs
      }
    }

    for (let i = 0; i < windows.length; i++) {
      if (windows[i].count >= this.config.actionLimits[i].maxRequests) {
        return false
      }
    }

    for (let i = 0; i < windows.length; i++) {
      windows[i].count += 1
    }

    return true
  }

  public sweep(now = Date.now()): void {
    for (const [key, expiresAt] of this.handshakeCooldowns.entries()) {
      if (expiresAt <= now) this.handshakeCooldowns.delete(key)
    }

    for (const [key, windows] of this.actionWindows.entries()) {
      const maxExpiresAt = Math.max(...windows.map((w) => w.expiresAt))

      if (maxExpiresAt <= now) {
        this.actionWindows.delete(key)
      }
    }
  }
}

export const profileLimiter = new FeatureLimiter({
  handshakeWindowMs: 0,
  actionLimits: [{ windowMs: 60 * 1000, maxRequests: 5 }]
})

export const statsLimiter = new FeatureLimiter({
  handshakeWindowMs: 10 * 60 * 1000,
  actionLimits: [{ windowMs: 10 * 60 * 1000, maxRequests: 10 }]
})

export const crashReportsLimiter = new FeatureLimiter({
  handshakeWindowMs: 30 * 60 * 1000,
  actionLimits: [
    { windowMs: 60 * 60 * 1000, maxRequests: 2 },
    { windowMs: 24 * 60 * 60 * 1000, maxRequests: 4 }
  ]
})

if (!building) {
  setInterval(
    () => {
      const now = Date.now()
      statsLimiter.sweep(now)
      crashReportsLimiter.sweep(now)
    },
    60 * 60 * 1000
  )
}

