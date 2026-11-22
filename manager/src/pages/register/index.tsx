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
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import api from "@/src/api"
import { useAuth } from "@/src/contexts/authContext"
import { toast } from "sonner"

const registerSchema = z
  .object({
    name: z.string().min(1, "Campo obrigatório"),
    email: z.email("O email deve ser válido").min(1, "Campo obrigatório"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
    confirmPassword: z.string().min(1, "Campo obrigatório"),
    acceptTerms: z.boolean().refine((v) => v === true, {
      message: "Você precisa aceitar os termos de uso.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  })

type RegisterSchema = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const { setWhitelabelId } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  })

  const password = watch("password")

  const doRegister = async (data: RegisterSchema) => {
    setIsLoading(true)

    try {
      const response = await api.post<{
        whitelabelId: string
      }>("/users", {
        name: data.name,
        email: data.email,
        password: data.password,
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

  const passwordStrength = (value: string) => {
    if (!value) return { strength: 0, label: "" }

    let strength = 0
    if (value.length >= 6) strength++
    if (value.length >= 10) strength++
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) strength++
    if (/\d/.test(value)) strength++
    if (/[^a-zA-Z0-9]/.test(value)) strength++

    const levels = [
      { strength: 1, label: "Muito fraca" },
      { strength: 2, label: "Fraca" },
      { strength: 3, label: "Média" },
      { strength: 4, label: "Forte" },
      { strength: 5, label: "Muito forte" },
    ]

    return levels[strength - 1] || levels[0]
  }

  const strength = passwordStrength(password)

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
      <form onSubmit={handleSubmit(doRegister)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo</Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="João Silva"
              className="h-11 pl-10"
              {...register("name")}
            />
          </div>
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              className="h-11 pl-10"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="h-11 pl-10 pr-10"
              {...register("password")}
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
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}

          {password && (
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
              className="h-11 pl-10 pr-10"
              {...register("confirmPassword")}
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
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="flex cursor-pointer items-start space-x-3">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-input"
              {...register("acceptTerms")}
            />
            <span className="text-sm leading-relaxed text-muted-foreground">
              Aceito os termos de uso e política de privacidade
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
          )}
        </div>

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
