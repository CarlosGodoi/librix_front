
# LibriX Frontend

Frontend web do LibriX, um sistema de gestão de bibliotecas. A aplicação oferece uma interface única para organizar o acervo, administrar leitores e acompanhar o ciclo de empréstimos e devoluções.

Este repositório contém somente o frontend. Ele depende de uma API backend externa, configurada por variável de ambiente, que fornece autenticação, persistência e regras de negócio.

## Sumário

- [Visão geral](#visão-geral)
- [Problema resolvido](#problema-resolvido)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e execução](#instalação-e-execução)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Como utilizar](#como-utilizar)
- [Arquitetura](#arquitetura)
- [Rotas internas](#rotas-internas)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Histórico do desenvolvimento](#histórico-do-desenvolvimento)
- [Validação e limitações conhecidas](#validação-e-limitações-conhecidas)

## Visão geral

O LibriX é um painel autenticado para bibliotecas. Depois do login, o usuário acessa um shell responsivo com navegação, tema claro/escuro, feedback por notificações e telas para:

- consultar e filtrar o catálogo de livros;
- visualizar detalhes, disponibilidade e capa dos livros;
- cadastrar, editar, excluir e enviar imagem de capa de livros;
- cadastrar, editar, pesquisar e excluir usuários;
- criar empréstimos e registrar devoluções;
- acompanhar empréstimos em andamento, atrasados e devolvidos;
- receber recomendações e conversar com um recurso de chat relacionado ao acervo.

O frontend usa componentes Server e Client do Next.js. A primeira carga das áreas protegidas busca usuário, livros, usuários e empréstimos no servidor; depois, os contextos React mantêm o estado e executam atualizações no navegador.

## Problema resolvido

Bibliotecas precisam manter sincronizados acervo, leitores e circulação de exemplares. Sem uma ferramenta central, tarefas como saber quais livros estão disponíveis, identificar empréstimos atrasados, localizar um leitor ou registrar uma devolução ficam espalhadas em planilhas e processos manuais.

O LibriX resolve esse problema ao concentrar esses fluxos em uma interface com permissões por perfil e comunicação padronizada com a API. Assim, o operador pode administrar o acervo e a circulação em um só lugar, enquanto visitantes veem o catálogo e seus próprios empréstimos.

## Funcionalidades

### Autenticação e sessão
- Data de devolução inicial sugerida para 14 dias após a data atual.
- Abas para todos, em andamento, atrasados e devolvidos.
- Cálculo visual de atraso comparando a data de devolução com o dia atual.
- Registro de devolução e atualização imediata do status.
- Visitantes recebem a visão dos próprios empréstimos; administradores e bibliotecários veem a circulação geral.

### Recomendações e chat

- Busca de recomendações por usuário autenticado.
- Chat que envia mensagens para o backend e pode retornar livros relacionados.
- Hooks dedicados (`useBookChat` e `useBookRecommendations`) controlam carregamento, erro e dados.

## Tecnologias

- [Next.js](https://nextjs.org/) `16.3.0`, com App Router e Route Handlers.
- React `19.2.8` e React DOM `19.2.8`.
- TypeScript `5` em modo estrito.
- Tailwind CSS `4` e `tw-animate-css`.
- Componentes baseados em `@base-ui/react` e configuração do shadcn.
- React Hook Form e Zod para formulários e validação.
- Axios para comunicação com a API.
- `next-themes` para tema claro/escuro.
- `sonner` para notificações.
- `lucide-react` para ícones.
- pnpm como gerenciador indicado, conforme o lockfile versionado.

## Pré-requisitos

1. Node.js compatível com Next.js 16.
2. pnpm instalado e disponível no PATH.
3. A API backend do LibriX executando e acessível pela máquina que executa o frontend.
4. Um usuário válido criado no backend para realizar o primeiro login.

O backend não faz parte deste repositório. Portanto, instalar o frontend sem configurar a API permite iniciar o processo do Next.js, mas não permite autenticar nem carregar o catálogo.

## Instalação e execução

Clone o repositório e entre na pasta:

```bash
git clone <URL_DO_REPOSITORIO>
cd librix_front
```

Instale as dependências usando o lockfile do projeto:

```bash
pnpm install
```

Crie o arquivo `.env.local` na raiz, conforme a seção [Variáveis de ambiente](#variáveis-de-ambiente). Em seguida, inicie o servidor de desenvolvimento:

```bash
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000). A tela inicial é o login. Após autenticar, a aplicação redireciona para o catálogo em `/livros`.

Comandos disponíveis:

```bash
pnpm dev      # desenvolvimento com hot reload
pnpm lint     # ESLint
pnpm build    # build de produção
pnpm start    # inicia o build de produção
```

## Variáveis de ambiente

O arquivo `.env.local` é ignorado pelo Git e não deve ser versionado. Use valores próprios do ambiente:

```dotenv
NEXT_PUBLIC_BASE_API=http://localhost:3334
NEXT_PUBLIC_BASE_FRONT=http://localhost:3000
NEXT_PUBLIC_BASE_FRONT_PROD=https://seu-frontend-em-producao.example.com
```
3. Use **Cadastrar livro** para incluir uma obra. Preencha os campos obrigatórios e, quando necessário, envie a capa.
4. Acesse **Usuários** para cadastrar leitores, alterar perfil ou situação e remover cadastros.
5. Em **Novo empréstimo**, selecione um livro disponível, um usuário ativo e as datas.
6. Em **Empréstimos**, filtre por situação e use a ação de devolução quando o livro retornar.
7. Use o chat ou as recomendações na área do livro quando o backend disponibilizar esse recurso.

### Visitante

O perfil `VISITOR` recebe uma navegação restrita: pode consultar o acervo e acessar **Meus empréstimos**, mas não vê os menus administrativos de usuários, cadastro de livros e criação de empréstimos.

A restrição de navegação é aplicada no `AppShell` e a carga inicial de empréstimos é direcionada para o usuário autenticado no layout server-side. As permissões definitivas também devem existir e ser validadas pelo backend.

## Arquitetura

### Fluxo de requisição

```text
Browser
	-> apiFront (Axios, cookies incluídos)
	-> Next.js Route Handler em app/api
	-> api (Axios, Authorization: Bearer <token>)
	-> API backend externa
```

Essa camada intermediária evita expor diretamente a URL e o token do backend ao código do navegador. Os Route Handlers leem o cookie de sessão, encaminham a requisição e normalizam os erros do backend em respostas Next.js.

### Sessão

1. `POST /api/login` encaminha credenciais para `/auth` no backend.
2. O backend retorna access token, refresh token e usuário.
3. O frontend grava `token` e `refresh` como cookies `httpOnly` e o usuário como cookie não sensível.
4. O `proxy.ts` protege `/livros`, `/emprestimos` e `/usuarios`, verifica expiração do JWT e tenta renovar a sessão.
5. O interceptor de `apiFront` também tenta `POST /api/refresh` após respostas `401`, enfileirando requisições concorrentes enquanto a renovação acontece.

### Estado da interface

- `AuthProvider`: usuário atual, login, logout e atualização de dados locais.
- `UsersProvider`: listagem, criação, edição e remoção de usuários.
- `BooksProvider`: catálogo, filtro, criação, edição, upload e remoção de livros.
- `LoansProvider`: listagem, criação, atualização e devolução de empréstimos.
- Server services: carregamento inicial autenticado com `cookies()` e `server-only`.
- Client services: chamadas às rotas internas pelo Axios configurado em `services/api.ts`.

## Rotas internas

As rotas abaixo pertencem ao frontend e são chamadas pelo navegador. Elas repassam as operações para a API externa.

| Método | Rota | Finalidade |
| --- | --- | --- |
| `POST` | `/api/login` | Autenticar e criar cookies de sessão |
| `POST` | `/api/logout` | Remover cookies de sessão |
| `POST` | `/api/refresh` | Renovar o access token |
| `GET` | `/api/livros` | Listar livros |
| `GET` | `/api/livros/:id` | Buscar um livro |
| `POST` | `/api/livros/novo` | Cadastrar livro |
| `PUT` | `/api/livros/:id/editar` | Atualizar livro |
| `DELETE` | `/api/livros/:id/delete` | Excluir livro |
| `POST` | `/api/livros/:id/upload` | Enviar capa |
| `GET` | `/api/livros/recommendations/:id` | Buscar recomendações |
| `POST` | `/api/livros/chat/:id` | Enviar mensagem ao chat |
| `GET` | `/api/usuarios` | Listar usuários |
| `POST` | `/api/usuarios/novo` | Cadastrar usuário |
| `PUT` | `/api/usuarios/editar/:id` | Atualizar usuário |
| `DELETE` | `/api/usuarios/delete/:id` | Excluir usuário |
| `GET` | `/api/emprestimos` | Listar empréstimos |
| `POST` | `/api/emprestimos/novo` | Registrar empréstimo |
| `PATCH` | `/api/emprestimos/retorno/:id` | Registrar devolução |

Os caminhos do backend externo correspondentes aparecem nos Route Handlers, incluindo `/auth`, `/refresh`, `/books`, `/book/register`, `/book/:id`, `/loans`, `/loan/register`, `/loan/return/:id`, `/users`, `/register`, `/user/:id` e os endpoints de recomendações, chat, edição e exclusão. O contrato definitivo de payload e resposta pertence ao backend, que não está neste repositório.

## Estrutura de pastas

```text
app/
	page.tsx                 # login
	layout.tsx               # metadata, providers globais e usuário inicial
	(app)/                    # área autenticada
		layout.tsx              # carregamento server-side dos dados iniciais
		appLayoutClient.tsx     # composição dos providers client-side
		livros/                 # catálogo, detalhes, cadastro e edição
		usuarios/               # lista e formulários de usuários
		emprestimos/            # lista, cadastro e devolução
	api/                      # BFF/Route Handlers do Next.js
components/                 # shell, formulários, modais e UI reutilizável
context/                    # providers de autenticação e domínios
enums/                      # status e perfis tipados
interfaces/                # contratos TypeScript e payloads
services/                   # clientes Axios e operações de domínio
	*/*Server.ts              # consultas server-only da carga inicial
utils/                      # categorias, labels, ISBN e funções auxiliares
public/covers/              # capas estáticas e placeholder
```

## Histórico do desenvolvimento

O estado documentado corresponde ao commit `cab1669` (`2026-09-14`). A evolução observada no histórico foi:

- `eb272c8` e `72ddf12`: criação do projeto Next.js e configuração inicial do frontend.
- `5c43a20`: login e contexto de autenticação.
- `17f0f8e`, `f303265` e `0d2782e`: catálogo, listagem e modal de detalhes.
- `c948302`, `798db80` e `75314c0`: recomendações e chat de livros.
- `65e73e9`, `7dfaa29`, `49971c3` e `f98f777`: cadastro de livros, empréstimos e devoluções.
- `034f1ce`, `a99260e` e `1dc50a0`: upload de capa, edição e exclusão de livros.
- `ce33d57`, `6e84395` e `c361b20`: listagem, cadastro, edição e exclusão de usuários.
- `55028fa`, `ff7426a` e `d39e2b4`: ajustes de Server/Client Components, logout, refresh token e rotas protegidas.
- `aed8600`, `fb19065` e `cab1669`: limpeza de configurações não utilizadas, ajustes de parâmetros e correções no carregamento inicial/server services.

## Validação e limitações conhecidas

O comando recomendado para verificar o código é:

```bash
pnpm lint
```

Na análise deste estado, o lint terminou com `6 errors` e `28 warnings`. Os erros observados estão concentrados em tipos `any` explícitos, componentes declarados dentro do render do `AppShell` e uma regra do React Compiler no `ThemeToggle`. Eles são pendências da base atual e não foram alterados durante a criação desta documentação.

Também não há testes automatizados ou script de testes definido no `package.json`. A validação funcional depende de uma API backend disponível e de um usuário autenticado.

O `next.config.ts` está configurado com `typescript.ignoreBuildErrors: true`, portanto um build pode não representar uma verificação completa de tipos. Antes de publicar, é recomendável remover essa tolerância, corrigir os erros do lint e adicionar testes para autenticação, permissões, empréstimo, devolução e refresh de sessão.

## Segurança operacional


## Licença

Não há um arquivo de licença neste repositório. Defina a licença antes de distribuir o projeto publicamente.
