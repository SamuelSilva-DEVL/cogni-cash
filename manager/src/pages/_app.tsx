import type { AppProps } from "next/app"
import { useState } from "react"
import { useRouter } from "next/router"
import { QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "next-themes"
import { createQueryClient } from "@/src/lib/query-client"
import { Toaster } from "@/src/components/ui/sonner"
import { Layout } from "@/src/components/Layout"
import { AuthContextProvider } from "../contexts/authContext"
import { TooltipProvider } from "@/src/components/ui/tooltip"
import "@/src/styles/globals.css"

const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password"]

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )
}

function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  if (isPublicPath(router.pathname)) {
    return <>{children}</>
  }

  return <Layout>{children}</Layout>
}

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <AuthContextProvider>
          <TooltipProvider>
            <AppShell>
              <Component {...pageProps} />
            </AppShell>
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </AuthContextProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
