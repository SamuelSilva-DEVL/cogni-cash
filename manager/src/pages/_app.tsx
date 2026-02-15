import type { AppProps } from 'next/app'
import { FinanceProvider } from '@/src/contexts/FinanceContext'
import '@/src/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <FinanceProvider>
      <Component {...pageProps} />
    </FinanceProvider>
  )
}
