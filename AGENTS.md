# Cogni Cash — Guia para Agentes de IA

Aplicação de **gestão financeira pessoal**. Monorepo com backend e frontend separados.

## Estrutura do repositório

```
cogni-cash/
├── api/       # Backend (NestJS)
└── manager/   # Frontend (Next.js)
```

| Pasta | Papel | Porta padrão |
|-------|-------|--------------|
| `api/` | REST API, autenticação, regras de negócio, banco | `3333` |
| `manager/` | Interface web para o usuário final | `3000` |

## Stack tecnológica

### Backend (`api/`)

- **NestJS 11** — framework HTTP
- **Prisma 7** + **PostgreSQL** — ORM e banco (client gerado em `api/src/generated/prisma`)
- **Zod** — validação de env e payloads
- **Passport JWT (RS256)** — autenticação com chaves base64
- **Swagger** — documentação em `/api/docs`
- **Vitest** + **Supertest** — testes unitários e e2e

### Frontend (`manager/`)

- **Next.js 14** (Pages Router)
- **React 18** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (Radix Nova)
- **TanStack Query** + **Axios** — chamadas à API
- **React Hook Form** + **Zod** — formulários
- **Recharts** — gráficos do dashboard

## Como executar

### Pré-requisitos

- Node.js 20+
- Yarn
- Docker (para PostgreSQL)

### Backend

```bash
cd api
docker compose up -d          # PostgreSQL na porta 5432
cp .env.example .env          # configurar variáveis (se existir)
yarn install
npx prisma migrate dev
yarn start:dev                # http://localhost:3333
```

### Frontend

```bash
cd manager
yarn install
# Definir NEXT_PUBLIC_API_URL=http://localhost:3333
yarn dev                      # http://localhost:3000
```

## Variáveis de ambiente

### `api/.env`

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | Connection string PostgreSQL |
| `PORT` | Porta da API (padrão `3333`) |
| `JWT_PRIVATE_KEY` | Chave privada RSA em base64 |
| `JWT_PUBLIC_KEY` | Chave pública RSA em base64 |

### `manager/.env.local`

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_API_URL` | URL base da API (ex: `http://localhost:3333`) |

## Domínio de negócio

Multi-tenant por **Account** (conta financeira). Usuários se vinculam via **AccountMember**.

Entidades principais: `User`, `Account`, `AccountMember`, `Category`, `Transaction`, `Budget`, `Goal`.

Tipos de transação: `EXPENSE` | `INCOME`. Planos de conta: `FREE` | `PREMIUM`.

## Endpoints da API

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/users` | Não | Criar usuário |
| POST | `/sessions` | Não | Login → `{ access_token }` |
| POST | `/goals` | JWT | Criar meta |
| GET | `/goals` | JWT | Listar metas |
| POST | `/transactions` | JWT | Criar transação |
| GET | `/transactions` | JWT | Listar por tipo |
| POST | `/categories` | JWT | Criar categoria |
| GET | `/categories` | JWT | Listar categorias |

Rotas protegidas usam `@UseGuards(JwtAuthGuard)` e `@CurrentUser()` para obter `userId`.

## Convenções de código

### Backend

- Um controller por caso de uso em `api/src/controllers/<domínio>/`
- Nome: `<ação>-<recurso>.controller.ts` (ex: `create-goal.controller.ts`)
- Schema Zod no topo do arquivo + `ZodValidationPipe`
- Registrar controller em `app.module.ts`
- Testes e2e: `<controller>.e2e-spec.ts` no mesmo diretório
- Alias de import: `@/` → `api/src/`
- **Não editar** arquivos em `api/src/generated/prisma/` — gerados pelo Prisma

### Frontend

- Pages Router em `manager/src/pages/`
- Componentes UI em `manager/src/components/ui/` (shadcn)
- Cliente HTTP: `manager/src/api/index.ts` (Axios + token `COGNI_CASH_TOKEN`)
- Contextos: `authContext.tsx`, `FinanceContext.tsx`
- Alias: `@/` → raiz de `manager/`

## Comandos úteis

```bash
# API
cd api && yarn test          # unitários
cd api && yarn test:e2e      # e2e (requer DATABASE_URL)
cd api && npx prisma migrate dev

# Frontend
cd manager && yarn lint
cd manager && yarn build
```

## Diretrizes para agentes

1. **Escopo mínimo** — altere apenas o necessário; não refatore código não relacionado.
2. **Siga os padrões existentes** — copie a estrutura de controllers, pipes e componentes já no projeto.
3. **Migrações** — mudanças no schema vão em `api/prisma/schema.prisma`; rode `prisma migrate dev`.
4. **Idioma** — mensagens de API e UI em português; código (nomes de variáveis, arquivos) em inglês.
5. **Segredos** — nunca commitar `.env`, chaves JWT ou credenciais.
6. **Testes** — ao criar endpoint, incluir e2e seguindo o padrão de `create-goal.controller.e2e-spec.ts`.
