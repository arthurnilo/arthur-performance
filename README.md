# Arthur Performance

Aplicativo de treino híbrido com hipertrofia como prioridade. Esta é a versão independente para **Next.js + Vercel + Supabase**, com o mesmo visual e as funcionalidades do aplicativo criado na conversa.

## O que está incluído

- Cinco sessões de musculação, cheer às quintas/sábados/domingos e ciclo de 16 semanas.
- Calendário com drag-and-drop no computador e seleção de destino no celular.
- Registro de séries, carga, repetições, RIR, cronômetro de sessão e descanso.
- Salvamento de cada série confirmada e retomada da sessão em andamento.
- Sugestão de progressão de carga, redução de volume, recuperação e deload.
- Peso, medidas, gráficos de volume e carga, histórico e importação/exportação JSON.
- Supabase Auth: criação de conta, login, confirmação de e-mail e recuperação de senha.
- Dados por conta com Row Level Security e controle de versão para não sobrescrever alterações feitas em outro aparelho.

Os dados dos treinos ficam no Supabase. O navegador armazena apenas a sessão de autenticação gerenciada pelo SDK; campos ainda não confirmados não são salvos. A aplicação precisa de internet: não há modo offline ou service worker.

## 1. Pré-requisitos

- Node.js 22 LTS ou mais recente.
- Uma conta no Supabase e outra na Vercel.
- GitHub para a forma mais simples de deploy pela Vercel.

Extraia este ZIP e abra a pasta `arthur-performance` no VS Code. Essa pasta, que contém `package.json`, é a raiz do projeto.

## 2. Criar o banco no Supabase

1. Crie um projeto em https://supabase.com/dashboard.
2. Aguarde o banco ficar pronto.
3. Abra **SQL Editor → New query**.
4. Copie todo o conteúdo de `supabase/schema.sql`, cole no editor e execute.
5. Confira a tabela `public.athlete_state` no Table Editor. O script também cria as políticas RLS e a função `save_athlete_state`.
6. Em **Connect / API Keys** (ou Settings → API), obtenha a URL do projeto e a chave **publishable** (`sb_publishable_...`). A chave pública `anon` legada também funciona.

**Não use `service_role`, `sb_secret_...` ou a senha do banco nas variáveis do aplicativo.** Não são necessárias. A chave publishable é pública por definição; o isolamento é feito pelo login e pelas políticas RLS.

### Autenticação

- Mantenha o provedor **Email** habilitado em Authentication → Sign In / Providers.
- Para testar localmente, configure em **Authentication → URL Configuration**:
  - Site URL: `http://localhost:3000`
  - Redirect URLs: `http://localhost:3000`
- Na publicação, mude Site URL para `https://SEU-PROJETO.vercel.app` e adicione essa mesma URL em Redirect URLs. Mantenha localhost se continuar desenvolvendo localmente.
- Cadastre sua conta pelo aplicativo e confirme o e-mail antes de entrar, se a confirmação estiver habilitada.
- O envio padrão de e-mails do Supabase tem restrições. Se a confirmação/recuperação não chegar, confira Authentication Logs, remetente e configuração de SMTP; configure um provedor SMTP para envio confiável.
- Alternativa pessoal: crie seu usuário pelo painel Authentication → Users → Add user, com e-mail confirmado, e entre usando essa conta.
- Se só você usará o app, depois de criar sua conta pode desabilitar novos cadastros no Supabase. O login existente continuará funcionando; o formulário de cadastro exibirá o erro do serviço se alguém tentar utilizá-lo.

## 3. Rodar no computador

Copie `.env.example` para `.env.local` e preencha os valores:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_SUA_CHAVE_PUBLICA
```

No PowerShell do VS Code:

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Em macOS/Linux, o equivalente é `cp .env.example .env.local`.

Abra http://localhost:3000. Após mudar `.env.local`, pare o servidor com Ctrl+C e execute `npm run dev` novamente.

O projeto inclui `package-lock.json`; para instalações reproduzíveis, também pode usar `npm ci`.

## 4. Publicar na Vercel

1. Crie um repositório no GitHub e envie os arquivos extraídos. Inclua arquivos de configuração e o `package-lock.json`; não envie `.env.local`, `node_modules` ou `.next`.
2. Na Vercel, clique em **Add New → Project** e importe o repositório.
3. Escolha **Next.js** como Framework Preset e Node.js **22.x**. Se enviou a pasta externa inteira, configure Root Directory para a pasta que contém `package.json`.
4. Em Environment Variables, adicione as duas variáveis do `.env.example`, com os valores reais do seu projeto Supabase. Habilite Production e os demais ambientes que pretende usar.
5. Mantenha o Build Command como `npm run build`. Não defina um Output Directory manual: deixe o padrão Next.js.
6. Clique em **Deploy**.
7. Copie a URL final e configure Site URL / Redirect URLs no Supabase conforme a seção de autenticação.
8. Acesse a URL, faça login e registre um check-in de teste. Abra o mesmo endereço no celular e entre com **a mesma conta**.

Variáveis `NEXT_PUBLIC_` são incorporadas durante o build. Se alterar alguma variável na Vercel, faça um novo deploy.

O endereço da Vercel mostra a tela de login publicamente; os registros são privados por conta no Supabase. Essa instalação é independente do endereço privado do aplicativo original.

## 5. Usar no celular e computador

Abra a URL da Vercel em ambos. No celular, use o menu do navegador **Adicionar à Tela de Início** para criar um atalho. O layout é responsivo; não é necessário instalar uma aplicação nativa.

Cada série confirmada é salva no servidor. Os dados são carregados ao entrar/recarregar; o botão **Atualizar** busca a versão mais recente. Não há atualização em tempo real em uma tela que ficou aberta. Se houver edição simultânea em dois aparelhos, a versão antiga recebe um aviso e não sobrescreve a nova: recarregue o aparelho desatualizado e continue.

Não execute simultaneamente a mesma sessão em dois dispositivos. Preferencialmente, conclua/confirme a série e depois atualize o outro aparelho.

## 6. Levar os dados do aplicativo anterior

1. No aplicativo anterior, abra **Evolução → Exportar todos os registros**, ou use o ícone de exportação no perfil.
2. Na nova versão, faça login e abra **Evolução → Importar registros**.
3. Selecione o JSON exportado e confirme.

A importação substitui os dados atuais dessa conta; exporte um backup antes. O rascunho de treino em andamento é descartado na importação, mas sessões concluídas, medidas, calendário e recuperação são preservados. Não há migração automática entre o banco anterior e o Supabase.

## Estrutura do código

```text
app/
  page.tsx              Dashboard responsivo e interações
  globals.css           Estilos desktop e mobile
  layout.tsx            Metadados e idioma
  api/state/route.ts    API autenticada de leitura e gravação
components/
  auth-gate.tsx         Login, cadastro e recuperação de senha
lib/
  program.ts            Exercícios, orçamento de tempo e progressão
  state-schema.ts       Validação dos registros com Zod
  supabase.ts            Cliente de autenticação e chamadas autenticadas
supabase/
  schema.sql            Tabela, políticas e gravação atômica
  verify.sql            Inspeções de configuração após instalação
tests/
  program.test.mjs      Regras de tempo, progressão e recuperação
  database.test.mjs     Isolamento RLS e conflitos em PostgreSQL local
```

Esta primeira versão armazena o estado de cada usuário em uma linha JSONB. Simplifica a migração e a sincronização do aplicativo pessoal; não é um modelo relacional completo por exercício. O limite de gravação é 1 MB de JSON; exporte o histórico e planeje normalização/paginação caso ele se aproxime desse limite.

## Verificações

```bash
npm test
npm run typecheck
npm run build
npm start
```

Os testes de banco usam PGlite (PostgreSQL local em memória), com uma simulação da identidade do Supabase. Não precisam de credenciais e não alteram seu projeto real. A validação do login, e-mail e gravação no seu Supabase depende da configuração da sua conta e deve ser feita após o deploy.

Checklist de integração:

- Criar/confirmar conta e entrar.
- Registrar check-in, medida e uma série.
- Recarregar e confirmar a retomada.
- Entrar pelo celular e verificar os mesmos dados.
- Em outra conta, confirmar que os dados anteriores não aparecem.
- Testar recuperação de senha com o link recebido por e-mail.

## Problemas comuns

- **Tela pedindo configuração:** variáveis ausentes; reinicie localmente ou faça novo deploy.
- **Falha ao carregar/salvar:** confira se `schema.sql` foi executado no mesmo projeto indicado nas variáveis.
- **Invalid login credentials:** confirme o e-mail e a senha usados; confira se a confirmação foi concluída.
- **Link de e-mail leva para localhost:** ajuste Site URL/Redirect URLs no Supabase para o endereço de produção.
- **Aviso de alteração em outro dispositivo:** recarregue antes de continuar; é a proteção contra perda de dados.
- **Não consegue registrar medidas durante carregamento:** espere a conexão ser concluída e resolva eventual mensagem de erro.

## Referências oficiais da integração

- Supabase Auth: https://supabase.com/docs/guides/auth
- Login por senha: https://supabase.com/docs/reference/javascript/auth-signinwithpassword
- Validação de usuário no servidor: https://supabase.com/docs/reference/javascript/auth-getuser
- RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Variáveis Vercel: https://vercel.com/docs/environment-variables

O programa de treino é um ponto de partida ajustável. A meta de 85–86 kg é de médio/longo prazo; gráficos de peso, medidas e volume não medem massa muscular diretamente.


## Projeto Caveira — modo caverna

Nova aba integrada ao dashboard, mantendo calendário, ciclo de 16 semanas, treinos,
progressão, recuperação e histórico existentes. O foco físico continua sendo
hipertrofia, força e capacidade atlética; o modo caverna acrescenta organização da atenção.

- Compromisso de 7–90 dias com um hábito escolhido pelo usuário, gatilho,
  barreira ambiental e ação alternativa. O padrão inicial é 14 dias.
- Registro de impulsos com intensidade, contexto, resultado e próxima ação.
  Deslizes permanecem no histórico e não apagam progresso anterior.
- Revisão diária editável com minutos de foco, aplicação da barreira,
  contato com pessoas de confiança e ajuste para o dia seguinte.
- Exclusão dos relatos e revisões com confirmação, preservando o plano.
- Dados sincronizados em `athlete_state.data.caverna`, com validação Zod e
  o mesmo controle de revisão e isolamento por conta existentes. Nenhuma
  migração SQL é necessária. Backups antigos continuam válidos.
- Exportar JSON inclui os relatos. Importar um backup antigo substitui o
  estado completo, como antes, portanto também remove os dados do modo caverna.

O app não bloqueia sites ou aplicativos e não oferece tratamento para dependência.
O protocolo de pausa é um roteiro voluntário, sem promessa de eliminar impulsos.
Não há punição, diagnóstico, ranking ou inferência de abstinência por falta de registros.

Validação: `npm ci`, `npm run typecheck`, `npm test`, `npm run build`.
Os testes do modo caverna verificam compatibilidade com estados antigos,
preservação dos campos pela validação da API, limites e contagem de dias.