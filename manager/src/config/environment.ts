export type AppEnvironment = "development" | "production"

const API_URL_ENV_KEYS = {
  development: "NEXT_PUBLIC_API_URL_DEV",
  production: "NEXT_PUBLIC_API_URL_PROD",
} as const satisfies Record<AppEnvironment, string>

export function getAppEnvironment(): AppEnvironment {
  const env = process.env.NEXT_PUBLIC_APP_ENV

  if (env === "development" || env === "production") {
    return env
  }

  return process.env.NODE_ENV === "production" ? "production" : "development"
}

export function getApiUrl(): string {
  const environment = getAppEnvironment()
  const envKey = API_URL_ENV_KEYS[environment]
  const url = process.env[envKey]

  if (!url) {
    throw new Error(`Missing ${envKey} for ${environment} environment`)
  }

  return url
}
