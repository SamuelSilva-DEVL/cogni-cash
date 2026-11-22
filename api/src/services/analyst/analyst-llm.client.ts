import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Env } from "@/env"

export type AnalystChatTurn = {
  role: "user" | "assistant"
  content: string
}

const OPENAI_DEFAULT_URL = "https://api.openai.com/v1"
const ANTHROPIC_URL = "https://api.anthropic.com"
const HAIKU_MODEL = "claude-haiku-4-5"

export function readChatCompletion(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null

  const choices = (payload as { choices?: unknown }).choices
  if (!Array.isArray(choices) || !choices[0] || typeof choices[0] !== "object") {
    return null
  }

  const content = (choices[0] as { message?: { content?: unknown } }).message?.content

  if (typeof content === "string") {
    const text = content.trim()
    return text || null
  }

  if (!Array.isArray(content)) return null

  const text = content
    .map((part) => {
      if (typeof part === "string") return part
      if (part && typeof part === "object" && "text" in part && typeof part.text === "string") {
        return part.text
      }
      return ""
    })
    .join("")
    .trim()

  return text || null
}

export function readAnthropicMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null

  const content = (payload as { content?: unknown }).content
  if (typeof content === "string") {
    const text = content.trim()
    return text || null
  }

  if (!Array.isArray(content)) return null

  const text = content
    .map((part) => {
      if (part && typeof part === "object" && "text" in part && typeof part.text === "string") {
        return part.text
      }
      return ""
    })
    .join("")
    .trim()

  return text || null
}

export function toAnthropicMessages(turns: AnalystChatTurn[]) {
  const merged: AnalystChatTurn[] = []

  for (const turn of turns) {
    const content = turn.content.trim()
    if (!content) continue

    const previous = merged.at(-1)
    if (previous && previous.role === turn.role) {
      previous.content = `${previous.content}\n\n${content}`
      continue
    }

    merged.push({ role: turn.role, content })
  }

  while (merged[0]?.role === "assistant") {
    merged.shift()
  }

  if (merged.length === 0) {
    throw new Error("Conversa sem pergunta")
  }

  return merged
}

export function resolveAnalystCall(input: {
  apiKey: string
  baseUrl: string
  model: string
}): {
  provider: "openai" | "anthropic"
  url: string
  model: string
  headers: Record<string, string>
} {
  const baseUrl = (input.baseUrl || OPENAI_DEFAULT_URL).trim().replace(/\/$/, "")
  const requestedModel = input.model.trim()
  const normalizedModel = requestedModel.toLowerCase()
  const anthropic =
    input.apiKey.startsWith("sk-ant-") ||
    baseUrl.includes("anthropic.com") ||
    normalizedModel.startsWith("claude") ||
    normalizedModel === "haiku"

  if (!anthropic) {
    return {
      provider: "openai" as const,
      url: `${baseUrl}/chat/completions`,
      model: requestedModel || "gpt-4o-mini",
      headers: {
        Authorization: `Bearer ${input.apiKey}`,
        "Content-Type": "application/json",
      },
    }
  }

  const anthropicBase = baseUrl.includes("anthropic.com") ? baseUrl : ANTHROPIC_URL
  const useDefaultHaiku =
    !requestedModel ||
    normalizedModel === "gpt-4o-mini" ||
    normalizedModel === "haiku" ||
    normalizedModel === "claude-haiku"

  return {
    provider: "anthropic" as const,
    url: anthropicBase.endsWith("/v1") ? `${anthropicBase}/messages` : `${anthropicBase}/v1/messages`,
    model: useDefaultHaiku ? HAIKU_MODEL : requestedModel,
    headers: {
      "x-api-key": input.apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
  }
}

export function userFacingAnalystError(error: unknown) {
  if (!(error instanceof Error)) return null
  if (error.message.startsWith("A chave de IA") || error.message.startsWith("O modelo de IA")) {
    return error.message
  }
  return null
}

@Injectable()
export class AnalystLlmClient {
  constructor(private config: ConfigService<Env, true>) {}

  isConfigured() {
    return Boolean(this.config.get("AI_API_KEY", { infer: true })?.trim())
  }

  async complete(system: string, turns: AnalystChatTurn[]) {
    const apiKey = this.config.get("AI_API_KEY", { infer: true })?.trim()
    if (!apiKey) {
      throw new Error("AI_API_KEY ausente")
    }

    const call = resolveAnalystCall({
      apiKey,
      baseUrl: this.config.get("AI_BASE_URL", { infer: true }) || OPENAI_DEFAULT_URL,
      model: this.config.get("AI_MODEL", { infer: true }) || "gpt-4o-mini",
    })

    const body =
      call.provider === "anthropic"
        ? {
            model: call.model,
            max_tokens: 700,
            temperature: 0.3,
            system,
            messages: toAnthropicMessages(turns),
          }
        : {
            model: call.model,
            temperature: 0.3,
            max_tokens: 700,
            messages: [{ role: "system", content: system }, ...turns],
          }

    const response = await fetch(call.url, {
      method: "POST",
      headers: call.headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(25_000),
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("A chave de IA foi recusada. Confira o AI_API_KEY.")
      }
      if (response.status === 404) {
        throw new Error("O modelo de IA não foi encontrado. Confira o AI_MODEL.")
      }
      throw new Error(`Falha do provedor de IA (${response.status})`)
    }

    const payload: unknown = await response.json()
    const content = call.provider === "anthropic" ? readAnthropicMessage(payload) : readChatCompletion(payload)
    if (!content) {
      throw new Error("Resposta vazia do provedor de IA")
    }

    return content
  }
}
