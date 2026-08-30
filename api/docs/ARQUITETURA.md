# Cogni Cash API — Mapa de Arquitetura

Documento de revisão da pasta `api/`: estrutura, módulos NestJS, autenticação e banco de dados.

**Stack:** NestJS 11 · Prisma 7 · PostgreSQL · Passport JWT (RS256) · Zod · Swagger · Vitest  
**Porta padrão:** `3333`  
**Docs Swagger:** `http://localhost:3333/api/docs`

---

## 1. Visão geral da arquitetura

A API segue um estilo **use-case oriented** (um controller por caso de uso), com multi-tenant em dois níveis:

1. **Whitelabel** — “central” / tenant de produto (isolamento de usuários e contas)
2. **Account** — conta financeira compartilhada entre membros (`AccountMember`)

```
┌─────────────┐     REST/JWT      ┌──────────────────────────────────────┐
│  manager/   │ ───────────────►  │  NestJS AppModule                    │
│  Next.js    │  Bearer + CORS    │  Controllers (use cases)             │
└─────────────┘                   │  AuthModule (JWT RS256)              │
                                  │  Services (AccountContext, Budget)   │
                                  │  PrismaService                       │
                                  └──────────────┬───────────────────────┘
                                                 │
                                                 ▼
                                          ┌─────────────┐
                                          │ PostgreSQL  │
                                          │ (Prisma 7)  │
                                          └─────────────┘
```

### Princípios observados

| Princípio | Como aparece no código |
|-----------|------------------------|
| Um controller por ação | Ex.: `create-goal.controller.ts`, `list-budgets.controller.ts` |
| Validação por Zod | Schema no topo do arquivo + `ZodValidationPipe` |
| Auth por JWT | `@UseGuards(JwtAuthGuard)` + `@CurrentUser()` |
| Autorização por papel | `@UseGuards(RolesGuard)` + `@RequireRoles(...)` |
| Escopo de dados | Sempre filtrar por `accountId` / `whitelabelId` do contexto |
| Sem feature modules | Quase tudo registrado direto no `AppModule` |

---

## 2. Estrutura de pastas

```
api/
├── Dockerfile
├── docker-compose.yml          # PostgreSQL local (porta 5432)
├── nest-cli.json
├── package.json
├── prisma.config.ts            # Prisma 7: schema + migrations + DATABASE_URL
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── main.ts                 # Bootstrap, CORS, Swagger
│   ├── app.module.ts           # Módulo raiz (único agregador de controllers)
│   ├── env.ts                  # Validação Zod das env vars
│   ├── auth/                   # JWT, guards, decorators, papéis
│   ├── controllers/            # Um arquivo (ou grupo) por domínio/ação
│   │   ├── auth/
│   │   ├── user/
│   │   ├── goals/
│   │   ├── transaction/
│   │   ├── categories/
│   │   ├── budgets/
│   │   └── accounts/
│   ├── services/               # Serviços compartilhados (não são modules)
│   ├── pipes/                  # ZodValidationPipe
│   ├── prisma/                 # PrismaService
│   ├── whitelabel/             # Resolução de header x-whitelabel-id
│   └── generated/prisma/       # Client gerado — NÃO editar
├── test/
│   ├── setup-e2e.ts            # Schema isolado por UUID nos e2e
│   └── helpers/
├── vitest.config.ts
└── vitest.config.e2e.ts
```

### Arquivos de bootstrap

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/main.ts` | `NestFactory.create`, CORS aberto, Swagger em `/api/docs`, porta via `ConfigService` |
| `src/app.module.ts` | Imports, lista de controllers, providers |
| `src/env.ts` | Schema Zod: `DATABASE_URL`, `PORT`, `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY` |
| `Dockerfile` | Build multi-stage; em runtime: `prisma migrate deploy && node dist/main` |
| `docker-compose.yml` | Container `cogni-cash-pg` (user/pass/db: `postgres` / `postgres` / `cogni-cash`) |

### Alias de import

`@/` → `api/src/` (configurado em `tsconfig.json`).

---

## 3. Módulos NestJS — revisão

### 3.1 Inventário

| Módulo | Tipo | Observação |
|--------|------|------------|
| `AppModule` | Raiz | Agrega **todos** os controllers e providers de domínio |
| `AuthModule` | Feature | Único módulo de feature; registra Passport + JwtModule + JwtStrategy |
| `ConfigModule` | Global | `ConfigModule.forRoot({ validate: envSchema.parse, isGlobal: true })` |

Não existem `GoalsModule`, `TransactionsModule`, `BudgetsModule`, etc. O projeto **não usa** a organização clássica “um Module por domínio”; usa **AppModule flat** + controllers por use case.

### 3.2 `AppModule` — composição

**Imports**

- `ConfigModule.forRoot` (global, validação Zod)
- `AuthModule`

**Controllers registrados (17)**

| Controller | Domínio |
|------------|---------|
| `CreateUserController` | Users |
| `AuthenticateController` | Auth |
| `CreateGoalController` | Goals |
| `FetchListGoalsController` | Goals |
| `CreateTransactionController` | Transactions |
| `FetchTransactionsByTypeController` | Transactions |
| `CreateCategoryController` | Categories |
| `ListCategoriesController` | Categories |
| `ListBudgetsController` | Budgets |
| `CreateBudgetController` | Budgets |
| `UpdateBudgetController` | Budgets |
| `DeleteBudgetController` | Budgets |
| `InviteMemberController` | Account Members |
| `AcceptInviteController` | Account Members |
| `ListMembersController` | Account Members |
| `UpdateMemberController` | Account Members |
| `RemoveMemberController` | Account Members |

**Providers**

- `PrismaService`
- `AccountContextService`
- `BudgetQueryService`
- `RolesGuard`

### 3.3 `AuthModule`

```
imports:
  PassportModule
  JwtModule.registerAsync({ global: true, algorithm: RS256, keys base64 })

providers:
  JwtStrategy
  PrismaService   ← também registrado no AppModule (instância duplicada potencial)
```

O `JwtModule` é **global**, então `JwtService` fica disponível em qualquer controller (ex.: `AuthenticateController`, `AcceptInviteController`) sem reimportar.

### 3.4 Serviços fora de módulos dedicados

| Serviço / util | Injetável Nest? | Função |
|----------------|-----------------|--------|
| `AccountContextService` | Sim | Resolve membership + role a partir do JWT |
| `BudgetQueryService` | Sim | Lista orçamentos com progresso de gastos |
| `budget-progress.service.ts` | Não (funções puras) | `computeBudgetProgress`, `getMonthDateRange` |
| `resolve-whitelabel.ts` | Não (função) | Valida header `x-whitelabel-id` |

### 3.5 Avaliação dos módulos

**Pontos positivos**

- Padrão de use case deixa cada endpoint isolado e fácil de achar
- `AuthModule` bem delimitado (JWT + strategy)
- Env validada na subida da aplicação
- Guards/decorators reutilizáveis para authz

**Pontos de atenção**

1. **AppModule monolítico** — qualquer novo endpoint exige editar `app.module.ts`; escala mal se o número de controllers crescer muito.
2. **`PrismaService` em dois módulos** — registrado em `AppModule` e `AuthModule`. No Nest isso cria **duas instâncias** (a menos que se use `exports` + import). Preferível: `PrismaModule` global com `exports: [PrismaService]`.
3. **Sem `PrismaModule` / `SharedModule`** — providers compartilhados vivem no root.
4. **`RolesGuard` como provider** — necessário porque injeta `Reflector` + `AccountContextService`; ok, mas depende de estar no mesmo módulo dos controllers que o usam.
5. **Leituras sem `RolesGuard`** — GETs de goals/transactions/categories/budgets usam só `JwtAuthGuard`. Qualquer membro autenticado da conta (incluindo VIEWER) lê; isso é coerente com `READ_ROLES`, mas o guard de roles não é aplicado explicitamente nessas rotas.
6. **Sem exception filters / interceptors globais** — erros vêm dos exceptions do Nest + pipe Zod.

---

## 4. Autenticação e autorização — revisão

### 4.1 Fluxo de autenticação (login)

```
POST /sessions
Header: x-whitelabel-id (obrigatório)
Body: { email, password }
        │
        ▼
resolveWhitelabelById()  → whitelabel ativa
        │
        ▼
user.findUnique({ whitelabelId_email })
        │
        ▼
bcryptjs.compare(password, user.password)
        │
        ▼
accountMember.findFirst (mais antigo daquele whitelabel)
        │
        ▼
jwt.sign({ userId, whitelabelId, accountId })
        │
        ▼
{ access_token }
```

**Respostas de erro:** `401` email/senha inválidos ou usuário sem conta; `400` header whitelabel ausente; `404` whitelabel inexistente/inativa.

### 4.2 Criação de titular (signup)

`POST /users` (público) em uma **transação Prisma**:

1. Cria `Whitelabel` (`name: Família de {name}`)
2. Cria `User` (senha hash bcrypt cost 8)
3. Cria `Account`
4. Cria `AccountMember` com role `OWNER`

Retorna `{ id, name, email, whitelabelId, accountId }` — **não** retorna token; o cliente deve chamar `/sessions`.

### 4.3 JWT (RS256)

| Aspecto | Detalhe |
|---------|---------|
| Algoritmo | `RS256` |
| Chaves | `JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY` em **base64** (decodificadas com `Buffer.from(..., 'base64')`) |
| Extração | `Authorization: Bearer <token>` |
| Payload atual | `{ userId, whitelabelId, accountId }` (UUIDs) |
| Payload legado | `{ userId }` — `JwtStrategy.validate` busca a membership mais antiga e completa o payload |

**Validação (`JwtStrategy.validate`)**

1. Tenta parsear payload completo com Zod
2. Se falhar, tenta legado só com `userId` e hidrata `accountId`/`whitelabelId` via banco
3. Caso contrário → `UnauthorizedException`

### 4.4 Guards e decorators

| Peça | Arquivo | Função |
|------|---------|--------|
| `JwtAuthGuard` | `auth/jwt-auth.guard.ts` | `AuthGuard('jwt')` |
| `RolesGuard` | `auth/roles.guard.ts` | Lê metadata `@RequireRoles`; resolve contexto; checa role; anexa `request.accountContext` |
| `@CurrentUser()` | `auth/current-user-decorator.ts` | Retorna `request.user` (`UserPayload`) |
| `@CurrentAccountContext()` | `auth/current-account-context.decorator.ts` | Retorna `request.accountContext` (preenchido pelo `RolesGuard`) |
| `@RequireRoles(...roles)` | `auth/require-roles.decorator.ts` | Metadata `ROLES_KEY` |

**Importante:** `@CurrentAccountContext()` só funciona em rotas que passaram pelo `RolesGuard` **e** tinham `@RequireRoles` (porque o guard só anexa o contexto quando há roles definidas). Controllers que só chamam `accountContext.resolve(user)` manualmente não dependem desse decorator.

### 4.5 Matriz de papéis (`AccountMemberRole`)

Constantes em `auth/account-member-role.ts`:

| Constante | Roles | Uso típico |
|-----------|-------|------------|
| `WRITE_FINANCE_ROLES` | OWNER, DEPENDENT | Criar transações |
| `WRITE_STRUCTURE_ROLES` | OWNER | Metas, categorias, orçamentos |
| `MANAGE_MEMBERS_ROLES` | OWNER | Convidar / alterar / remover membros |
| `READ_ROLES` | OWNER, DEPENDENT, VIEWER | Definido, mas pouco aplicado via guard nos GETs |

### 4.6 Whitelabel

- Header: `x-whitelabel-id` (`WHITELABEL_ID_HEADER`)
- Usado no login (`/sessions`)
- No signup do titular, a whitelabel é **criada automaticamente**
- Email de usuário é único **por whitelabel** (`@@unique([whitelabelId, email])`)

### 4.7 Convites de membros

Fluxo público de aceite:

1. OWNER: `POST /accounts/members/invite` → gera `MemberInvite` (token UUID, expira em 7 dias)
2. Convidado: `POST /accounts/members/accept` (sem JWT) com `{ token, name, password }`
3. Cria user + membership + marca invite aceito
4. Retorna `access_token` já assinado

### 4.8 Avaliação de autenticação

**Pontos positivos**

- RS256 com chaves assimétricas (adequado para produção)
- Payload multi-tenant (`whitelabelId` + `accountId`) evita ambiguidade
- Compatibilidade com tokens legados
- Separação clara auth (JWT) vs authz (roles)
- Senhas com bcrypt

**Pontos de atenção**

1. **Sem `expiresIn` explícito** no `JwtModule` / `sign` — tokens podem viver indefinidamente (depende do default do `@nestjs/jwt`).
2. **CORS aberto** (`app.enableCors()` sem origin) — ok em dev; restringir em produção.
3. **Login fixa a primeira membership** (`orderBy: createdAt asc`) — usuário com várias contas não escolhe conta no login.
4. **`AcceptInvite` retorna token** mas signup do OWNER não — inconsistência de DX.
5. **VIEWER** pode ler finanças nos GETs sem `@RequireRoles(READ_ROLES)` — funciona via membership no JWT, mas a intenção de “somente leitura” não está centralizada no guard.
6. **Sem refresh token / logout / denylist**.
7. **Header whitelabel só no login** — rotas autenticadas confiam no JWT (correto), mas o front precisa guardar `whitelabelId` do signup.

---

## 5. Banco de dados — revisão

### 5.1 Stack Prisma

| Item | Valor |
|------|-------|
| Versão | Prisma 7 (`@prisma/client`, `prisma`, `@prisma/adapter-pg`) |
| Provider | PostgreSQL |
| Client gerado | `src/generated/prisma` (`moduleFormat: commonjs`) |
| Config | `prisma.config.ts` (URL via `DATABASE_URL`) |
| Adapter | `PrismaPg` no `PrismaService` (suporta `?schema=` na connection string) |

`PrismaService` estende `PrismaClient`, conecta em `onModuleInit` e desconecta em `onModuleDestroy`. Logs: `error`, `warn`.

### 5.2 Diagrama de relações

```
Whitelabel
  ├── User[]
  ├── Account[]
  └── MemberInvite[]

User
  ├── memberships → AccountMember[]
  ├── createdTransactions → Transaction[]
  └── sentInvites → MemberInvite[]

Account
  ├── members → AccountMember[]
  ├── transactions → Transaction[]
  ├── categories → Category[]
  ├── budgets → Budget[]
  ├── goals → Goal[]
  └── invites → MemberInvite[]

Category
  ├── transactions → Transaction[]
  └── budgets → Budget[]
```

### 5.3 Models

#### `Whitelabel` → tabela `whitelabels`

| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID | PK |
| name | String? | |
| status | String | default `"active"` |
| createdAt / updatedAt | DateTime | mapped |

#### `User` → `users`

| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID | PK |
| name, email, password | String | password hasheada |
| telephone | String? | |
| whitelabelId | String | FK Cascade |
| **Unique** | `[whitelabelId, email]` | Multi-tenant por email |

#### `Account` → `accounts`

| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID | PK |
| name | String? | |
| plan | `Plans` | `FREE` \| `PREMIUM` (default FREE) |
| whitelabelId | String | FK + index |

#### `AccountMember` → `account_members`

| Campo | Tipo | Notas |
|-------|------|-------|
| role | `AccountMemberRole` | `OWNER` \| `DEPENDENT` \| `VIEWER` |
| userId + accountId | | **Unique** composto |

#### `MemberInvite` → `member_invites`

| Campo | Tipo | Notas |
|-------|------|-------|
| email, token | String | token unique UUID |
| role | AccountMemberRole | default DEPENDENT |
| expiresAt / acceptedAt | DateTime | |
| Unique | `[whitelabelId, email, accountId]` | upsert no invite |

#### `Category` → `categories`

Vinculada à `Account`. Sem unique de nome no schema (unicidade checada na aplicação).

#### `Transaction` → `transactions`

| Campo | Tipo | Notas |
|-------|------|-------|
| description | String | |
| amount | Decimal(10,2) | |
| date | DateTime | index |
| type | `transactionType` | `EXPENSE` \| `INCOME` |
| source | String? | |
| categoryId | String? | opcional |
| createdBy | String | FK User |
| Indexes | `accountId`, `date` | |

#### `Budget` → `budgets`

| Campo | Tipo | Notas |
|-------|------|-------|
| limit | Decimal(10,2) | |
| month / year | Int | |
| **Unique** | `[accountId, categoryId, month, year]` | |

#### `Goal` → `goals`

| Campo | Tipo | Notas |
|-------|------|-------|
| title | String | |
| targetAmount / currentAmount | Decimal(10,2) | current default 0 |
| deadline | DateTime? | |
| slug | String | **unique** global |

### 5.4 Enums

```
Plans: FREE | PREMIUM
AccountMemberRole: OWNER | DEPENDENT | VIEWER
transactionType: EXPENSE | INCOME
```

### 5.5 Migrações existentes

| Migration | Tema |
|-----------|------|
| `20260215224747_initial_migrations` | Base inicial |
| `20260216150148_update_user` | Ajustes em User |
| `20260218152939_add_slug_in_goal_table` | Slug em Goal |
| `20260314202440_add_account_model` | Account / membership |
| `20260706170000_budget_unique_and_updated_at` | Unique de budget |
| `20260706183000_add_whitelabel` | Whitelabel + invites |

Provider lock: `postgresql`.

### 5.6 Isolamento multi-tenant (padrão de consulta)

Quase todas as operações autenticadas:

1. Extraem `UserPayload` do JWT
2. Chamam `AccountContextService.resolve(user)` — valida que o user é membro da `accountId` na `whitelabelId`
3. Filtram Prisma por `context.accountId`

Isso é a **barreira de tenant** principal. Não há Prisma middleware de row-level security.

### 5.7 Avaliação do banco

**Pontos positivos**

- Modelo claro de família/conta compartilhada
- Unique compostos bem pensados (email por WL, membership, budget mensal, invite)
- Decimal para dinheiro
- Cascades coerentes no whitelabel/account
- Índices em `transactions.accountId` e `date`
- E2E usa schema PostgreSQL isolado por UUID (`test/setup-e2e.ts`)

**Pontos de atenção**

1. **`Goal.slug` unique global** — duas contas não podem ter o mesmo slug; risco de colisão (`P2002`) em títulos iguais.
2. **`Category.name` sem unique no schema** — só validação na app (race condition possível).
3. **`Whitelabel.status` como String** — poderia ser enum.
4. **`Plans` pouco usado** na lógica dos controllers (campo existe, feature de planos não aparece nos use cases).
5. **`Transaction.category` sem `onDelete`** explícito — comportamento default do Prisma/Postgres ao apagar categoria.
6. **Sem soft delete** — remoções são físicas.
7. **Datasource sem `url` no schema** — correto no Prisma 7 (URL em `prisma.config.ts`).

---

## 6. Catálogo de endpoints

### Públicos

| Método | Rota | Controller | Auth |
|--------|------|------------|------|
| POST | `/users` | CreateUser | Não |
| POST | `/sessions` | Authenticate | Não (+ header whitelabel) |
| POST | `/accounts/members/accept` | AcceptInvite | Não |

### Protegidos (JWT)

| Método | Rota | Roles | Descrição |
|--------|------|-------|-----------|
| POST | `/goals` | OWNER | Criar meta |
| GET | `/goals?page=` | JWT only | Listar metas (pag. 10) |
| POST | `/transactions` | OWNER, DEPENDENT | Criar transação (cria categoria se `categoryName`) |
| GET | `/transactions?type=&page=` | JWT only | Listar por tipo |
| POST | `/categories` | OWNER | Criar categoria |
| GET | `/categories` | JWT only | Listar |
| POST | `/budgets` | OWNER | Criar limite mensal |
| GET | `/budgets?month=&year=` | JWT only | Listar com progresso |
| PATCH | `/budgets/:id` | OWNER | Atualizar limite |
| DELETE | `/budgets/:id` | OWNER | Remover (204) |
| POST | `/accounts/members/invite` | OWNER | Convidar |
| GET | `/accounts/members` | OWNER, DEPENDENT, VIEWER | Listar membros |
| PATCH | `/accounts/members/:id` | OWNER | Alterar role |
| DELETE | `/accounts/members/:id` | OWNER | Remover membro (204) |

### Progresso de orçamento (`BudgetQueryService`)

Para cada categoria da conta no mês/ano:

- Soma `EXPENSE` no período
- Calcula `limit`, `spent`, `remaining`, `percentUsed`
- Status: `ok` | `warning` (≥80%) | `exceeded` | `no_limit`

---

## 7. Cross-cutting

### Validação

`ZodValidationPipe` — parse Zod; em erro retorna `400` com `fromZodError`.

### Config / env

```ts
DATABASE_URL   // URL PostgreSQL (obrigatória)
PORT           // default 3333
JWT_PRIVATE_KEY // RSA privada base64
JWT_PUBLIC_KEY  // RSA pública base64
```

Ver `.env.example`.

### Swagger

Configurado em `main.ts`: título “Cogni Cash API”, Bearer Auth, UI em `/api/docs`. Controllers usam `@ApiTags`, `@ApiOperation`, `@ApiResponse`, etc.

### Testes

| Tipo | Comando | Notas |
|------|---------|-------|
| Unit | `yarn test` | Vitest |
| E2E | `yarn test:e2e` | Schema isolado; `migrate deploy`; Supertest |

Specs e2e ficam ao lado dos controllers (`*.e2e-spec.ts`).

### Scripts úteis

```bash
yarn start:dev
yarn build
yarn test
yarn test:e2e
npx prisma migrate dev
npx prisma migrate deploy
```

---

## 8. Dependências principais

**Runtime:** `@nestjs/*`, `@prisma/client`, `@prisma/adapter-pg`, `passport` / `passport-jwt`, `bcryptjs`, `zod`, `zod-validation-error`, `swagger-ui-express`

**Dev:** `prisma`, `vitest`, `supertest`, `@nestjs/testing`, `@swc/core`, TypeScript 5.7

---

## 9. Síntese da revisão

### Arquitetura

API NestJS enxuta, orientada a **casos de uso**, com multi-tenant **Whitelabel → Account → Member**. Boa adequação ao domínio de finanças familiares. O custo é um `AppModule` que concentra tudo.

### Módulos

Só há modularização real em `AuthModule` + `ConfigModule`. Domínios não têm modules próprios. Funciona hoje; para crescer, extrair `PrismaModule` e feature modules por domínio reduziria acoplamento.

### Autenticação

Sólida na base (RS256, bcrypt, payload tenant-aware, roles). Faltam expiração explícita de JWT, seleção de conta no login e (opcional) refresh tokens. Autorização por role está bem modelada nas escritas; leituras confiam só no JWT + membership.

### Banco

Schema maduro para o domínio atual (contas compartilhadas, convites, orçamentos com unique mensal, metas). Atenção a `Goal.slug` global, unique de categoria só na app, e pouco uso de `Plans` na lógica.

---

## 10. Sugestões prioritárias (não implementadas neste documento)

1. Extrair `PrismaModule` global e remover `PrismaService` duplicado do `AuthModule`
2. Definir `expiresIn` no JWT (ex.: `7d` ou `1d` + refresh)
3. Tornar `Goal.slug` unique por `accountId` (ou incluir accountId no slug)
4. Aplicar `@RequireRoles(...READ_ROLES)` nos GETs para documentar/centralizar política de leitura
5. Endpoint para trocar/selecionar `accountId` ativo quando o usuário tiver várias memberships
6. Restringir CORS em produção

---

*Gerado a partir do código em `api/` — NestJS AppModule, AuthModule, Prisma schema e controllers de domínio.*
