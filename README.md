# Gen Atividades Complementares App

Um aplicativo mobile desenvolvido para estudantes do Senac, focado em simplificar o **registro, acompanhamento e gerenciamento de atividades e horas complementares acadêmicas** diretamente do smartphone.

> **⚠️ Status do Projeto:** Este aplicativo está atualmente em fase de desenvolvimento ativo. Estruturas, telas e funcionalidades estão sendo construídas e aprimoradas continuamente. Algumas telas ainda são placeholders e a integração com backend está prevista para as próximas iterações.

---

## 📱 Sobre o Projeto

A gestão de horas complementares costuma ser um processo manual e suscetível a perdas de documentos, exigindo que o aluno acompanhe certificados em papel, planilhas dispersas e processos burocráticos junto à coordenação do curso.

O objetivo principal deste aplicativo é **centralizar essas informações em uma única plataforma**, permitindo que o aluno tenha controle total sobre seu progresso acadêmico de forma rápida e intuitiva. Entre os principais benefícios:

- 📊 Acompanhamento visual do progresso em tempo real através de gráficos e estatísticas
- 📤 Submissão de certificados diretamente pelo celular (upload de arquivo ou foto)
- 🗂️ Histórico completo de atividades submetidas, aprovadas, pendentes e rejeitadas
- 📚 Acesso rápido às regras de atividades complementares do curso
- 🔔 Notificações sobre o status das submissões

---

## ✨ Funcionalidades Implementadas

### 🔐 Tela de Login

- Interface com gradiente escuro azul → marrom personalizado
- Logo do Senac com layout responsivo e centralizado
- Campos de e-mail e senha com validação inline
- Toggle de visibilidade de senha com ícones intuitivos
- Suporte completo a teclado adaptativo (`KeyboardAvoidingView`) no iOS e Android
- Navegação segura com `router.replace` para impedir retorno à tela de login após autenticação

### 📊 Dashboard (Painel do Aluno)

- **Top bar** com botão de menu lateral e identificação do app
- **Cards de cursos matriculados** com indicação de progresso percentual e destaque visual para o curso ativo
- **Grid de estatísticas (2x2)** exibindo:
  - ✅ Horas Aprovadas (verde)
  - ⏳ Horas Pendentes (laranja)
  - ❌ Horas Rejeitadas (vermelho)
  - 🎯 Meta Total (roxo)
- **Gráfico Donut em SVG nativo** com `react-native-svg` mostrando a proporção entre horas aprovadas, pendentes e rejeitadas, com label central de percentual concluído
- **Gráfico de barras horizontal** com Progresso por Área (Pesquisa, Extensão, Ensino, Cultura, Esporte) incluindo eixo X com marcadores
- **Lista de submissões recentes** com badges de status coloridos e metadados (área, carga horária, data)

### 📝 Nova Submissão

- Formulário completo com campos obrigatórios marcados visualmente (asterisco vermelho)
- Campos: Título, Categoria, Data de Início, Carga Horária, Descrição, Certificado
- **Seletor de categoria via modal customizado** com checkmark visual na opção selecionada
- **Área de upload com borda tracejada** oferecendo duas opções:
  - 📎 Seletor de arquivo (PDF, JPG ou PNG)
  - 📷 Captura por câmera
- **Validação em tempo real**: botão de envio só é habilitado quando todos os campos obrigatórios estão preenchidos
- Feedback visual do arquivo selecionado

### 🧭 Menu Lateral (SideDrawer)

- Drawer animado com **80% da largura da tela**
- **Animações paralelas de slide e fade** com `Animated` API nativa (280ms entrada / 240ms saída)
- Header do usuário com avatar gerado a partir da inicial do nome
- 4 itens de navegação: Dashboard, Nova Submissão, Regras do Curso, Notificações
- Item ativo destacado com **contorno laranja** (`#F59E0B`)
- Botão de logout ancorado no rodapé
- Modal mantido montado durante animação de saída para transições suaves
- Suporte completo a SafeArea (notch superior e barra de navegação inferior)

### 📋 Telas Placeholder

- **Regras do Curso**: estrutura preparada para receber o conteúdo das normas de atividades complementares
- **Notificações**: estrutura preparada para listar atualizações sobre as submissões do aluno

---

## 🏗️ Arquitetura

O projeto utiliza **Expo Router** com roteamento baseado em arquivos (file-based routing), onde a estrutura de pastas define automaticamente as rotas da aplicação. Isso elimina a necessidade de configuração manual de rotas e oferece tipagem automática via `typedRoutes`.

```
gen-atvd-app/
├── app/                              # Pasta raiz do Expo Router
│   ├── _layout.tsx                   # Layout raiz (StatusBar, SafeAreaProvider, Stack)
│   ├── index.tsx                     # Rota '/' → redireciona para Login
│   ├── Telas/                        # Agrupamento das telas da aplicação
│   │   ├── Login/
│   │   │   ├── index.tsx             # Componente da tela
│   │   │   └── style.ts              # StyleSheet isolado
│   │   ├── Dashboard/
│   │   │   ├── index.tsx
│   │   │   └── style.ts
│   │   ├── NovaSubmissao/
│   │   │   ├── index.tsx
│   │   │   └── style.ts
│   │   ├── RegrasCurso/
│   │   │   ├── index.tsx
│   │   │   └── style.ts
│   │   └── Notificacoes/
│   │       ├── index.tsx
│   │       └── style.ts
│   ├── componentes/                  # Componentes reutilizáveis
│   │   └── SideDrawer/
│   │       ├── index.tsx
│   │       └── style.ts
│   └── hooks/                        # Hooks customizados
│       └── userDrawerNavigation.ts   # Lógica centralizada do drawer
├── assets/                           # Imagens, ícones e fontes
│   └── images/
│       ├── logo_senac_branca.png
│       └── logo_senac_preta.png
├── app.json                          # Configuração do Expo
├── package.json
└── tsconfig.json
```

### 🎨 Padrão de Organização das Telas

Cada tela segue o padrão **separação de responsabilidades** com dois arquivos:

- **`index.tsx`** — Contém apenas a lógica do componente, JSX e hooks
- **`style.ts`** — Contém o `StyleSheet.create()` com todos os estilos isolados

Esta separação melhora a legibilidade, facilita manutenção e permite reaproveitar estilos quando necessário.

### 🪝 Hook `useDrawerNavigation`

Centraliza toda a lógica do menu lateral em um hook customizado, eliminando duplicação de código entre as telas:

```typescript
const { drawerOpen, openDrawer, closeDrawer, handleSelect, handleLogout } =
  useDrawerNavigation("dashboard");
```

Responsabilidades:

- Gerenciar estado de abertura/fechamento do drawer
- Mapear chaves de menu (`MenuItemKey`) para rotas do Expo Router
- Evitar renavegação quando o item selecionado é o atual
- Centralizar a lógica de logout

---

## 🛠️ Tecnologias Utilizadas

O projeto está construído com foco em **performance, escalabilidade e experiência nativa**, utilizando as seguintes tecnologias:

### Core

- **React Native** (`0.81.5`) — Framework principal para desenvolvimento mobile multiplataforma
- **Expo** (`~54.0.33`) — Plataforma para simplificar o desenvolvimento React Native
- **Expo Router** — Roteamento baseado em arquivos com tipagem automática
- **TypeScript** (`~5.9.2`) — Tipagem estática para maior segurança e manutenibilidade
- **React** (`19.1.0`) e **React DOM** (`19.1.0`)

### UI e Animações

- **React Native Reanimated** (`~4.1.1`) — Animações de alta performance executadas na thread nativa
- **React Native Gesture Handler** (`~2.28.0`) — Sistema declarativo de gestos
- **React Native Screens** (`~4.16.0`) — Otimização de telas nativas
- **React Native Safe Area Context** (`~5.6.0`) — Suporte a áreas seguras (notch, barra de status)
- **Expo Linear Gradient** (`~15.0.8`) — Gradientes nativos performáticos
- **React Native SVG** (`15.12.1`) — Renderização de SVG (utilizado no gráfico donut do Dashboard)
- **@expo/vector-icons** — Biblioteca de ícones (Ionicons utilizada em todo o app)

### Recursos do Sistema

- **Expo Status Bar** — Controle da barra de status
- **Expo Splash Screen** — Tela de splash nativa
- **Expo Constants** — Acesso a constantes do dispositivo
- **Expo Linking** — Deep linking
- **Expo Haptics** — Feedback tátil
- **Expo System UI** — Controle de UI do sistema

### Qualidade de Código

- **ESLint** (`^9.25.0`) com `eslint-config-expo` — Padronização e análise estática
- **React Compiler** (experimental) — Otimização automática de re-renders

---

## 🚀 Como Executar

### Pré-requisitos

- **Node.js** 20 ou superior
- **npm** ou **yarn**
- **Expo Go** instalado no celular ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) ou [iOS](https://apps.apple.com/app/expo-go/id982107779))
- Para emuladores: Android Studio (Android) ou Xcode (iOS, apenas macOS)

### Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd gen-atvd-app

# Instale as dependências
npm install
```

### Execução

```bash
# Inicia o servidor de desenvolvimento (escolha a plataforma no terminal)
npm start

# Ou inicie diretamente em uma plataforma específica:
npm run android    # Abre no emulador Android ou dispositivo conectado
npm run ios        # Abre no simulador iOS (apenas macOS)
npm run web        # Abre no navegador
```

Após executar `npm start`, escaneie o QR Code com o app **Expo Go** no seu celular para visualizar o aplicativo em tempo real.

### Lint

```bash
npm run lint
```

---

## 🎨 Identidade Visual

O design segue uma paleta de cores consistente baseada em:

| Elemento           | Cor                 | Uso                                                 |
| ------------------ | ------------------- | --------------------------------------------------- |
| 🟣 Roxo Índigo     | `#6366F1`           | Botões primários, badges, gráficos de área          |
| 🟠 Laranja Senac   | `#F59E0B`           | Avatar do usuário, destaque do item ativo no drawer |
| 🟢 Verde           | `#22C55E`           | Status "aprovada", horas aprovadas                  |
| 🟡 Amarelo         | `#F59E0B`           | Status "pendente", horas pendentes                  |
| 🔴 Vermelho        | `#EF4444`           | Status "rejeitada", campos obrigatórios             |
| ⚫ Azul Escuro     | `#1A2432`           | Fundo do SideDrawer                                 |
| 🌊 Gradiente Login | `#0D1F3C → #1A0E08` | Fundo da tela de Login                              |

---

## 📦 Estado Atual do Desenvolvimento

### ✅ Implementado

- [x] Tela de Login com gradiente e validação visual
- [x] Dashboard completo com gráficos SVG nativos
- [x] Tela de Nova Submissão com formulário completo
- [x] Menu lateral animado com transições suaves
- [x] Hook centralizado para navegação do drawer
- [x] Estrutura base das telas placeholder
- [x] Configuração do Expo Router com tipagem
- [x] Suporte completo a SafeArea em todas as telas

### 🚧 Em Desenvolvimento

- [ ] Implementação do conteúdo real da tela Regras do Curso
- [ ] Lista funcional de Notificações com dados reais
- [ ] Integração do `expo-document-picker` para upload de arquivos
- [ ] Integração do `expo-image-picker` para captura de fotos
- [ ] DatePicker nativo para o campo de Data de Início

### 🔮 Planejado

- [ ] Integração com **API REST em Spring Boot** (backend separado)
- [ ] Autenticação JWT com persistência via `AsyncStorage`
- [ ] Context API para gerenciamento global de sessão do usuário
- [ ] Sistema de notificações push com `expo-notifications`
- [ ] Modo offline com sincronização posterior
- [ ] Tela de perfil do usuário editável
- [ ] Dark mode (já preparado via `userInterfaceStyle: "automatic"`)
- [ ] Testes unitários e de integração

---

## 📝 Convenções do Projeto

### Commits

O projeto segue o padrão **Conventional Commits** em português:

| Tipo       | Quando usar                              | Exemplo                                                   |
| ---------- | ---------------------------------------- | --------------------------------------------------------- |
| `feat`     | Nova funcionalidade                      | `feat(login): adiciona toggle de visibilidade de senha`   |
| `style`    | Apenas estilos visuais                   | `style(dashboard): ajusta espaçamento dos cards de stats` |
| `chore`    | Configuração ou infraestrutura           | `chore(navegacao): configura layout raiz do Expo Router`  |
| `fix`      | Correção de bug                          | `fix(drawer): corrige animação travada no Android`        |
| `refactor` | Refatoração sem mudança de comportamento | `refactor(hooks): extrai lógica do drawer para hook`      |

### Estrutura de Componentes

Todos os componentes seguem o padrão:

- Imports organizados (externos → internos → estilos)
- Tipagem explícita com TypeScript em todas as props
- Separação entre `index.tsx` (lógica) e `style.ts` (estilos)
- Uso de `React.memo` quando aplicável para otimização

---

## 👥 Autores

| Integrante       |
| ---------------- |
| Jorge Figueredo  |
| Vitor Santos     |
| Lucas Vinícius   |
| Renan Souza      |
| Antonio Vinícius |
| Maria Vitória    |

---

## 📄 Licença

Este projeto é de uso acadêmico e está em desenvolvimento para fins educacionais.

---
