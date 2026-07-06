import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Wallet, Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    setTimeout(() => {
      if (email) {
        setIsSuccess(true)
      } else {
        setError("Por favor, insira um e-mail válido.")
      }
      setIsLoading(false)
    }, 800)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-4">
            <div className="h-14 w-14 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Wallet className="h-7 w-7 text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-emerald-700 mb-2">Cogni Cash</h1>
          <p className="text-slate-700 text-sm">Recupere o acesso à sua conta</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-8">
          {!isSuccess ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Esqueceu sua senha?
                </h2>
                <p className="text-slate-700 text-sm">
                  Digite seu e-mail e enviaremos instruções para redefinir sua
                  senha.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
                >
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full h-11">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enviando...
                    </span>
                  ) : (
                    "Enviar instruções"
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-2" role="status">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                E-mail enviado
              </h3>
              <p className="text-slate-700 text-sm mb-6">
                Se existir uma conta para <strong>{email}</strong>, você receberá
                as instruções em breve.
              </p>
            </div>
          )}

          <div className="mt-6">
            <Link href="/login">
              <Button variant="ghost" className="w-full gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar para o login
              </Button>
            </Link>
          </div>
        </div>

        {!isSuccess && (
          <div className="text-center mt-6">
            <p className="text-sm text-slate-700">
              Lembrou sua senha?{" "}
              <Link
                href="/login"
                className="text-emerald-700 hover:text-emerald-800 font-semibold"
              >
                Faça login
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
