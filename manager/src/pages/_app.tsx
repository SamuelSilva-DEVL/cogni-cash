import type { AppProps } from "next/app"
import { useState } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { createQueryClient } from "@/src/lib/query-client"
import "@/src/styles/globals.css"
import { AuthContextProvider } from "../contexts/authContext"

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <Component {...pageProps} />
      </AuthContextProvider>
    </QueryClientProvider>
  )
}
