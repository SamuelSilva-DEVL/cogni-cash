import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { Loader2, Wallet } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/login')
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand text-brand-foreground">
          <Wallet className="h-6 w-6" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-foreground">Cogni Cash</h1>
        <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando
        </p>
      </div>
    </div>
  )
}
