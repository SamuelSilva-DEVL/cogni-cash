import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import { isAxiosError } from "axios"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import {
  Wallet,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  AlertCircle,
} from "lucide-react"
import api from "@/src/api"
import { useAuth } from "@/src/contexts/authContext"

export default function RegisterPage() {
  const router = useRouter()
  const { setWhitelabelId } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem.")
      return
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.")
      return
    }

    if (!formData.acceptTerms) {
      setError("Você precisa aceitar os termos de uso.")
      return
    }

    setIsLoading(true)

    try {
      const response = await api.post<{
        whitelabelId: string
      }>("/users", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })
      setWhitelabelId(response.data.whitelabelId)
      router.push("/login")
    } catch (err) {
      const message = isAxiosError(err)
        ? (err.response?.data?.message as string | undefined) ??
          "Não foi possível criar a conta. Tente novamente."
        : "Não foi possível criar a conta. Tente novamente."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const passwordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "" }

    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 10) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++

    const levels = [
      { strength: 1, label: "Muito fraca" },
      { strength: 2, label: "Fraca" },
      { strength: 3, label: "Média" },
      { strength: 4, label: "Forte" },
      { strength: 5, label: "Muito forte" },
    ]

    return levels[strength - 1] || levels[0]
  }

  const strength = passwordStrength(formData.password)

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
          <p className="text-slate-700 text-sm">
            Comece sua jornada financeira hoje
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Criar conta</h2>
            <p className="text-slate-700 text-sm">
              Preencha os dados para começar gratuitamente
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
              <Label htmlFor="name">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="João Silva"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="pl-10 pr-10 h-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {formData.password && (
                <div className="space-y-2">
                  <div className="flex gap-1" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full ${
                          level <= strength.strength
                            ? "bg-emerald-500"
                            : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-700">
                    Força da senha:{" "}
                    <span className="font-medium">{strength.label}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="pl-10 pr-10 h-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={
                    showConfirmPassword ? "Ocultar confirmação" : "Mostrar confirmação"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) =>
                  setFormData({ ...formData, acceptTerms: e.target.checked })
                }
                className="w-4 h-4 mt-1 rounded border-slate-300"
              />
              <span className="text-sm text-slate-700 leading-relaxed">
                Aceito os termos de uso e política de privacidade
              </span>
            </label>

            <Button type="submit" disabled={isLoading} className="w-full h-11">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Criando conta...
                </span>
              ) : (
                "Criar conta gratuita"
              )}
            </Button>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-700">
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="text-emerald-700 hover:text-emerald-800 font-semibold"
            >
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
