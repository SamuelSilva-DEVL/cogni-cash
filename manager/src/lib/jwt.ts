interface JwtPayload {
  userId?: string
  whitelabelId?: string
  accountId?: string
}

export function decodeJwtPayload(token: string): JwtPayload {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return {}

    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    const decoded = atob(payload)
    return JSON.parse(decoded) as JwtPayload
  } catch {
    return {}
  }
}
