import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { Wallet } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/login')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="h-14 w-14 rounded-lg bg-emerald-600 flex items-center justify-center mx-auto mb-4">
          <Wallet className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Cogni Cash</h1>
        <p className="text-slate-700">Carregando...</p>
      </div>
    </div>
  )
}
