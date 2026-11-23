import { useEffect } from "react"

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // O app continua funcionando no navegador se o registro falhar.
    })
  }, [])

  return null
}
