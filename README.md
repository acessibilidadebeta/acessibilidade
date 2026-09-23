# Painel de Acessibilidade

Portal interno de consulta e gestão de bugs de acessibilidade por versão e plataforma. Os dados iniciais são inteiramente fictícios.

## Requisitos

Node.js 20 ou superior e npm. Para usar dados compartilhados, crie um projeto no Firebase no plano gratuito.

## Executar localmente

```bash
npm install
npm run dev
```

Abra a URL mostrada pelo Vite. Sem variáveis Firebase, o projeto entra automaticamente em **Modo demonstração**. As edições desse modo ficam no `localStorage` do navegador e não são compartilhadas com outras pessoas. As ações de edição são disponibilizadas no modo demonstração apenas para avaliação.

## Firebase

1. No console do Firebase, crie um projeto e adicione um aplicativo Web.
2. Em **Build > Firestore Database**, crie o banco em modo de produção.
3. Em **Authentication > Sign-in method**, habilite **Email/Password**.
4. Copie `.env.example` para `.env.local` e preencha os seis valores da configuração do aplicativo Web. Não use credenciais de serviço ou chaves administrativas no frontend.
5. Publique as regras de `firestore.rules` na aba **Rules** do Firestore.
6. Crie o primeiro usuário em Authentication. Em seguida, crie manualmente `users/{uid}` no Firestore com os campos `name`, `email` e `role: "admin"`. O UID deve ser o do usuário criado em Authentication. A regra impede que alguém se atribua uma função por conta própria.
7. Depois, administradores podem criar outros usuários no console e os respectivos documentos `users/{uid}` com `role` igual a `viewer`, `editor` ou `admin`.

Coleções usadas: `users`, `versions`, `prs`, `issues`, `regressionTests`, `knowledgeArticles` e `auditLogs`. As cinco coleções de conteúdo podem começar vazias. O app não importa automaticamente os dados fictícios para o Firestore. Os documentos de data usam strings ISO `AAAA-MM-DD`; o repositório pode ser evoluído para `Timestamp` se houver necessidade de consultas por intervalo no servidor. O campo `evidence` em apontamentos já admite metadados de imagem, vídeo e documento; upload de arquivos ainda depende de configurar um serviço de armazenamento.

As regras da interface servem para usabilidade e **não substituem as Firestore Security Rules**. As regras fornecidas exigem autenticação, controlam leitura por função, edição por `editor` e `admin`, e exclusão por `admin`. Ajuste e teste as regras antes de usar dados reais. O exemplo usa uma regra genérica para as coleções de conteúdo; para produção com dados sensíveis, adicione validação de esquema e trilha de auditoria confiável no backend.

## Qualidade e build

```bash
npm run lint
npm run build
npm run preview
```

## Publicar na Vercel

Importe este repositório na Vercel. O preset Vite deve detectar `npm run build` e a pasta `dist`. Adicione as mesmas variáveis `VITE_FIREBASE_*` em **Project Settings > Environment Variables** e faça o deploy. O `vercel.json` redireciona rotas da SPA como `/issues/123` para `index.html`.

## Acessibilidade

O portal usa regiões semânticas, link para pular ao conteúdo, labels, foco visível, tabelas estruturadas, resumos textuais dos gráficos, navegação por teclado e redução de movimento conforme a preferência do sistema. Valide com pessoas usuárias de tecnologias assistivas antes de operar em produção.

## Fluxo atual de bugs

O foco atual é abrir e acompanhar bugs. Os status disponíveis são Aberto, Fechado, Resolvido, Cancelado e Aguardando reteste. O painel principal apresenta gráficos separados para Android e iOS. A interface de PRs foi retirada por enquanto.

## Controle de registros

Usuários `editor` e `admin` podem criar e editar bugs e versões. Usuários `admin` também podem excluir. No modo demonstração, o perfil local é administrativo para permitir validar o CRUD completo. Uma versão com bugs vinculados não pode ser excluída.
