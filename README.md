# ![Banner do Projeto](assets/banner.png)
# RPG Edu Tracker

RPG Edu Tracker é um projeto educacional gamificado que utiliza elementos de RPG para engajar alunos e acompanhar o progresso em cursos, conquistas e atividades. Este repositório serve como modelo para projetos modernos de desenvolvimento web fullstack, destacando boas práticas, tecnologias atuais e integração entre frontend e backend.

## 🚀 Visão Geral
- Sistema de acompanhamento de cursos, conquistas e perfil do usuário
- Interface arcade, responsiva e intuitiva
- Autenticação via Google OAuth
- Seleção de avatar customizada (pixel-art e DiceBear)
- Persistência em banco de dados (MySQL) e fallback para modo dev (cache/localStorage)
- Exibição de selos/conquistas
- Formulário inteligente para cursos (cálculo automático de horas, datas)
- Footer com branding

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 19**: Biblioteca principal para construção da interface
- **Vite 7**: Bundler ultrarrápido para desenvolvimento e build
- **TypeScript**: Tipagem estática para maior segurança e produtividade
- **TailwindCSS**: Estilização utilitária e responsiva
- **tRPC**: Comunicação typesafe entre frontend e backend
- **React Query**: Gerenciamento de estado assíncrono

### Backend
- **Node.js**: Ambiente de execução JavaScript server-side
- **Express**: Framework para APIs HTTP
- **Drizzle ORM**: Mapeamento objeto-relacional moderno para TypeScript
- **MySQL**: Banco de dados relacional (com fallback para cache/localStorage em dev)

### Autenticação & Persistência
- **Google OAuth**: Login seguro e rápido
- **JWT**: Tokens para autenticação
- **localStorage**: Persistência client-side para modo dev

### UI/UX
- **Arcade Style**: Interface inspirada em jogos clássicos
- **Pixel-art Avatars**: Avatares customizados e integração com DiceBear
- **Componentização**: Cards, diálogos, formulários, badges, HUD
- **Responsividade**: Mobile-first, dialogs adaptativos

## 📁 Estrutura do Projeto
```
client/
  src/
    components/
    pages/
    hooks/
    lib/
    contexts/
server/
  _core/
  routers.ts
  db.ts
shared/
drizzle/
patches/
```

## ✨ Funcionalidades em Destaque
- **Edição de perfil**: Avatar, nome, email
- **Seleção de avatar**: Pixel-art e DiceBear
- **Conquistas**: Exibição de selos ao lado do perfil
- **Formulário de cursos**: Seleção de categoria, cálculo automático de horas, datas de início/fim
- **Persistência inteligente**: Banco de dados ou cache/localStorage
- **Footer personalizado**: Link para https://g.dev/eusoumanoelnetto

## 📚 Aprendizados e Boas Práticas
- Componentização e reutilização de código
- Tipagem forte com TypeScript
- Integração segura entre frontend e backend
- Gerenciamento de estado assíncrono
- Design responsivo e acessível
- Estratégias de fallback para ambientes de desenvolvimento

## 🔗 Demo (GitHub Pages)
- Acesse: https://eusoumanoelnetto.github.io/rpg_edu_tracker/

## 👨‍💻 Como rodar o projeto
1. Instale as dependências:
   ```sh
   pnpm install
   ```
2. Configure o banco de dados MySQL (ou use modo dev)
3. Inicie o servidor e o frontend:
   ```sh
   pnpm dev
   ```
4. Acesse via navegador ou browser interno do VS Code

## 📢 Autor
- [Manoel Netto](https://g.dev/eusoumanoelnetto)

---

Este projeto é um modelo educativo para quem deseja aprender e aplicar tecnologias modernas em desenvolvimento web fullstack. Sinta-se à vontade para usar como referência, adaptar e compartilhar!
