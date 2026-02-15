import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/login')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-emerald-100">
      <div className="text-center">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-3xl font-bold text-white">C</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Cogni Cash</h1>
        <p className="text-slate-600">Carregando...</p>
      </div>
    </div>
  )
}
