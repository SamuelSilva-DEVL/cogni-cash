import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Wallet, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/src/contexts/authContext"
import { isAxiosError } from "axios"

const loginSchema = z.object({
  email: z.email("O email deve ser válido").min(1, "Campo obrigatório"),
  password: z.string().min(1, "Campo obrigatório"),
})

type LoginSchema = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  })

  const doLogin = async (data: LoginSchema) => {
    try {
      setIsLoading(true)
      setLoginError(null)
      await login(data.email, data.password)
      router.push("/dashboard")
    } catch (error) {
      const message =
        error instanceof Error && !isAxiosError(error)
          ? error.message
          : isAxiosError(error)
            ? (error.response?.data?.message as string | undefined) ??
              "E-mail ou senha inválidos"
            : "E-mail ou senha inválidos"
      setLoginError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center mb-4"
          >
            <div className="h-14 w-14 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Wallet className="h-7 w-7 text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-emerald-700 mb-2">Cogni Cash</h1>
          <p className="text-slate-700 text-sm">
            Gerencie suas finanças com inteligência
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Bem-vindo de volta
            </h2>
            <p className="text-slate-700 text-sm">
              Entre com suas credenciais para continuar
            </p>
          </div>

          {loginError && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p>{loginError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(doLogin)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                E-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10 h-11"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-11"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-11">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-700">
            Não tem uma conta?{" "}
            <Link
              href="/register"
              className="text-emerald-700 hover:text-emerald-800 font-semibold"
            >
              Cadastre-se gratuitamente
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
