# RPG Edu Tracker - TODO

## Features

- [x] Criar assets visuais 8-bit (sprites de personagem, ícones de cursos, badges)
- [x] Implementar HUD (status do personagem com nome, nível, experiência)
- [x] Criar sistema de progresso (barras de experiência animadas)
- [x] Implementar registro de cursos/bootcamps/trilhas/projetos
- [x] Criar sistema de badges e achievements
- [x] Implementar microanimações pixeladas
- [x] Criar tela de conclusão estilizada em 8-bit
- [x] Implementar funcionalidade de compartilhamento no LinkedIn
- [x] Garantir responsividade mobile/desktop
- [x] Testar experiência em navegadores e dispositivos

## Bugs

(Nenhum registrado ainda)

## Notas de Design

- Estética: RPG retrô 8-bit
- Cores: Paleta retrô (verificar durante desenvolvimento)
- Tipografia: Fonte pixelada/retrô
- Animações: Transições suaves com efeito pixel
- Responsividade: Mobile-first approach


## Redesign com Estilo do Portfólio

- [x] Atualizar paleta de cores (azul ciano, verde, amarelo, vermelho)
- [x] Implementar tipografia pixelada retrô
- [x] Redesenhar componentes com bordas pretas espessas
- [x] Criar botões com estilo arcade/retro
- [x] Adicionar badges amarelos para XP/Level
- [x] Atualizar HUD com novo estilo visual
- [x] Redesenhar tela de conclusão com cores vibrantes
- [x] Testar novo design em mobile e desktop


## Correção de Login

- [x] Corrigir link de login para usar getLoginUrl() correto
- [x] Implementar hook useAuth() na tela de login
- [x] Melhorar UX da tela de login com animações
- [x] Testar fluxo de autenticação completo


## Correção de Responsividade Mobile

- [x] Corrigir CompletionScreen para mobile (tamanho de fonte, padding, layout)
- [x] Otimizar CourseList para telas pequenas
- [x] Ajustar CharacterHUD para mobile
- [x] Testar em diferentes resoluções (320px, 375px, 768px, 1024px)
- [x] Remover overflow horizontal


## Correção de Layout dos Cards Mobile

- [x] Ajustar CourseList para layout vertical em mobile
- [x] Expandir cards para usar melhor o espaço disponível
- [x] Reorganizar botões em mobile (empilhados verticalmente)


## Melhoria de Experiência do Usuário

- [x] Adicionar feedback visual aos botões (hover, active states)
- [x] Implementar toasts de sucesso/erro para ações
- [x] Adicionar loading states em mutações
- [x] Testar todos os botões (adicionar curso, atualizar progresso, completar, compartilhar, logout)
- [x] Melhorar mensagens de feedback ao usuário
- [x] Adicionar confirmação antes de ações destrutivas


## Tradução para Português Brasileiro

- [ ] Traduzir Home.tsx
- [ ] Traduzir CourseList.tsx
- [ ] Traduzir CompletionScreen.tsx
- [ ] Traduzir AchievementsList.tsx
- [ ] Traduzir CharacterHUD.tsx
- [ ] Traduzir mensagens de toast
- [ ] Traduzir placeholders e labels
