import { createContext, useContext } from "react"

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
  const access_token = null // Substituir pela lógica real de obtenção do token
  const login = async (email: string, password: string) => {
    // Implementar lógica de login, como chamada à API para autenticação
    // e armazenamento do token de acesso
  }

  const logout = () => {
    // Implementar lógica de logout, como remoção do token de acesso
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
