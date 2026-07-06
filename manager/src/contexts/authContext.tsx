import { createContext, useContext, useEffect, useState } from "react"
import api, { TOKEN_KEY, WHITELABEL_KEY, WHITELABEL_HEADER } from "../api"
import { decodeJwtPayload } from "@/src/lib/jwt"

interface IAuthContextProps {
  access_token: string | null
  isAuthenticated: boolean
  isReady: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setWhitelabelId: (id: string) => void
}

const AuthContext = createContext<IAuthContextProps>({} as IAuthContextProps)

function persistWhitelabelId(id: string) {
  localStorage.setItem(WHITELABEL_KEY, id)
}

export function AuthContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [access_token, setAccessToken] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setAccessToken(localStorage.getItem(TOKEN_KEY))
    setIsReady(true)

    const handleUnauthorized = () => {
      setAccessToken(null)
    }

    window.addEventListener("cogni-cash:unauthorized", handleUnauthorized)
    return () => {
      window.removeEventListener("cogni-cash:unauthorized", handleUnauthorized)
    }
  }, [])

  const setWhitelabelId = (id: string) => {
    persistWhitelabelId(id)
  }

  const login = async (email: string, password: string) => {
    const whitelabelId = localStorage.getItem(WHITELABEL_KEY)

    if (!whitelabelId) {
      throw new Error(
        "Central não identificada. Cadastre-se ou acesse pelo mesmo dispositivo em que criou a conta.",
      )
    }

    const response = await api.post<{ access_token: string }>(
      "/sessions",
      { email, password },
      { headers: { [WHITELABEL_HEADER]: whitelabelId } },
    )

    const token = response.data.access_token
    const payload = decodeJwtPayload(token)

    if (payload.whitelabelId) {
      persistWhitelabelId(payload.whitelabelId)
    }

    localStorage.setItem(TOKEN_KEY, token)
    setAccessToken(token)
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setAccessToken(null)
  }

  return (
    <AuthContext.Provider
      value={{
        access_token,
        isAuthenticated: !!access_token,
        isReady,
        login,
        logout,
        setWhitelabelId,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthContextProvider")
  }

  return context
}
