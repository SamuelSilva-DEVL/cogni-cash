import type { AppProps } from "next/app"
import { FinanceProvider } from "@/src/contexts/FinanceContext"
import "@/src/styles/globals.css"
import { AuthContextProvider } from "../contexts/authContext"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthContextProvider>
      <FinanceProvider>
        <Component {...pageProps} />
      </FinanceProvider>
    </AuthContextProvider>
  )
}
