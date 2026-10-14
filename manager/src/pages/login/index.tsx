import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { AuthShell } from "@/src/components/AuthShell"
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react"
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/src/contexts/authContext"
import { isAxiosError } from "axios"
import { toast } from "sonner"

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
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell
      title="Bem-vindo de volta"
      description="Entre com suas credenciais para continuar."
      footer={
        <>
          Não tem uma conta?{" "}
          <Link href="/register" className="font-semibold text-brand hover:underline">
            Cadastre-se gratuitamente
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(doLogin)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              className="h-11 pl-10"
              autoComplete="email"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="password">Senha</Label>
            <Link href="/forgot-password" className="text-xs font-medium text-brand hover:underline">
              Esqueceu a senha?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Sua senha"
              className="h-11 pl-10 pr-10"
              autoComplete="current-password"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isLoading} className="h-11 w-full">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Entrando...
            </span>
          ) : (
            "Entrar"
          )}
        </Button>
      </form>
    </AuthShell>
  )
}
