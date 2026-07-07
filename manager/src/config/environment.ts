export type AppEnvironment = "development" | "production"

const API_URLS: Record<AppEnvironment, string> = {
  development: "http://localhost:3333",
  production: "https://cogni-cash-production.up.railway.app",
}

export function getAppEnvironment(): AppEnvironment {
  const env = process.env.NEXT_PUBLIC_APP_ENV

  if (env === "development" || env === "production") {
    return env
  }

  return process.env.NODE_ENV === "production" ? "production" : "development"
}

export function getApiUrl(): string {
  return API_URLS[getAppEnvironment()]
}
