import { createContext, useContext, useEffect, useState } from "react"
import api from "../api"

const TOKEN_KEY = "COGNI_CASH_TOKEN"

interface IAuthContextProps {
  access_token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<IAuthContextProps>({} as IAuthContextProps)

export function AuthContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [access_token, setAccessToken] = useState<string | null>(null)

  useEffect(() => {
    setAccessToken(localStorage.getItem(TOKEN_KEY))
  }, [])

  const login = async (email: string, password: string) => {
    const response = await api.post<{ access_token: string }>("/sessions", {
      email,
      password,
    })

    const token = response.data.access_token
    localStorage.setItem(TOKEN_KEY, token)
    setAccessToken(token)
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setAccessToken(null)
  }

  return (
    <AuthContext.Provider value={{ access_token, login, logout }}>
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
