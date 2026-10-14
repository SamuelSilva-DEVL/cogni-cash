import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { AuthShell } from "@/src/components/AuthShell"
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      if (email) {
        setIsSuccess(true)
      } else {
        toast.error("Por favor, insira um e-mail válido.")
      }
      setIsLoading(false)
    }, 800)
  }

  return (
    <AuthShell
      title={isSuccess ? "E-mail enviado" : "Esqueceu sua senha?"}
      description={
        isSuccess
          ? "Se existir uma conta para esse e-mail, as instruções chegam em breve."
          : "Digite seu e-mail e enviaremos instruções para redefinir sua senha."
      }
      footer={
        isSuccess ? (
          <>
            Lembrou sua senha?{" "}
            <Link href="/login" className="font-semibold text-brand hover:underline">
              Faça login
            </Link>
          </>
        ) : undefined
      }
    >
      {!isSuccess ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 pl-10"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="h-11 w-full">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </span>
            ) : (
              "Enviar instruções"
            )}
          </Button>
        </form>
      ) : (
        <div className="space-y-5 text-center" role="status">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft">
            <CheckCircle className="h-6 w-6 text-brand" />
          </div>
          <p className="text-sm text-muted-foreground">
            Conta associada a <strong className="text-foreground">{email}</strong>.
          </p>
        </div>
      )}

      <div className="mt-4">
        <Button asChild variant="ghost" className="w-full gap-2">
          <Link href="/login">
            <ArrowLeft className="h-4 w-4" />
            Voltar para o login
          </Link>
        </Button>
      </div>
    </AuthShell>
  )
}
