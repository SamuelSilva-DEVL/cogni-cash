export type AppEnvironment = "development" | "production"

export function getAppEnvironment(): AppEnvironment {
  const env = process.env.NEXT_PUBLIC_APP_ENV

  if (env === "development" || env === "production") {
    return env
  }

  return process.env.NODE_ENV === "production" ? "production" : "development"
}

export function getApiUrl(): string {
  const environment = getAppEnvironment()
  const devUrl = process.env.NEXT_PUBLIC_API_URL_DEV
  const prodUrl = process.env.NEXT_PUBLIC_API_URL_PROD
  const url = environment === "production" ? prodUrl : devUrl

  if (!url) {
    const envKey = environment === "production" ? "NEXT_PUBLIC_API_URL_PROD" : "NEXT_PUBLIC_API_URL_DEV"
    throw new Error(`Missing ${envKey} for ${environment} environment`)
  }

  return url
}
