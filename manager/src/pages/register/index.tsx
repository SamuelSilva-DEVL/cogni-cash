import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import { isAxiosError } from "axios"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { AuthShell } from "@/src/components/AuthShell"
import { Mail, Lock, Eye, EyeOff, User, Loader2 } from "lucide-react"
import { cn } from "@/src/lib/utils"
import api from "@/src/api"
import { useAuth } from "@/src/contexts/authContext"
import { toast } from "sonner"

export default function RegisterPage() {
  const router = useRouter()
  const { setWhitelabelId } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem.")
      return
    }

    if (formData.password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.")
      return
    }

    if (!formData.acceptTerms) {
      toast.error("Você precisa aceitar os termos de uso.")
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
      toast.error(message)
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

  const strengthTone =
    strength.strength <= 2
      ? "bg-destructive"
      : strength.strength === 3
        ? "bg-warning"
        : "bg-brand"

  return (
    <AuthShell
      title="Criar conta"
      description="Preencha os dados para começar gratuitamente."
      footer={
        <>
          Já tem uma conta?{" "}
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Faça login
          </Link>
        </>
      }
    >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {formData.password && (
                <div className="space-y-2">
                  <div className="flex gap-1" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          "h-1 flex-1 rounded-full",
                          level <= strength.strength ? strengthTone : "bg-muted",
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Força da senha:{" "}
                    <span className="font-medium">{strength.label}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={
                    showConfirmPassword ? "Ocultar confirmação" : "Mostrar confirmação"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
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
                className="mt-1 h-4 w-4 rounded border-input"
              />
              <span className="text-sm leading-relaxed text-muted-foreground">
                Aceito os termos de uso e política de privacidade
              </span>
            </label>

            <Button type="submit" disabled={isLoading} className="h-11 w-full">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando conta...
                </span>
              ) : (
                "Criar conta gratuita"
              )}
            </Button>
          </form>
    </AuthShell>
  )
}
