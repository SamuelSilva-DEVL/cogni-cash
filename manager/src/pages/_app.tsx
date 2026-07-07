import type { AppProps } from "next/app"
import { useState } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "next-themes"
import { createQueryClient } from "@/src/lib/query-client"
import { Toaster } from "@/src/components/ui/sonner"
import "@/src/styles/globals.css"
import { AuthContextProvider } from "../contexts/authContext"

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
        <AuthContextProvider>
          <Component {...pageProps} />
          <Toaster richColors position="top-right" />
        </AuthContextProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
