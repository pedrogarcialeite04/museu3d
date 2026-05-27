# 🏛️ Museu 3D — Pedroca

> Portfólio interativo em forma de cidade 3D navegável, onde cada prédio representa um projeto real desenvolvido por Pedro Garcia.

---

## 📖 Sobre o Projeto

O **Museu 3D** é uma experiência imersiva de portfólio construída inteiramente em um único arquivo HTML (`index.html`), sem dependências de bundlers ou frameworks. O usuário explora uma cidade 3D renderizada em tempo real no navegador, onde cada prédio representa um projeto desenvolvido por Pedro. Ao se aproximar de um prédio e atirar nele, um painel 3D flutua com informações do projeto e um botão para acessar o link real.

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Uso |
|---|---|
| **Three.js** | Renderização 3D da cidade, câmera, iluminação, física |
| **JavaScript (Vanilla)** | Lógica de jogo, HUD, navegação, colisão |
| **HTML5 Canvas** | Geração procedural de texturas (asfalto, calçada, fachada, tijolos) |
| **CSS3** | HUD, overlays, animações, efeitos glassmorphism |
| **Google Fonts** | Instrument Serif, Outfit, Space Mono, Syne |
| **WebGL** | Renderização via Three.js |

> Nenhum framework front-end (React, Vue, etc.) é utilizado na experiência principal. Tudo é gerado proceduralmente em runtime.

---

## 🎮 Como Usar / Controles

### Desktop

| Ação | Controle |
|---|---|
| Mover | `W A S D` ou setas |
| Olhar ao redor | Mover o mouse (pointer lock) |
| Atirar / Interagir | `Clique esquerdo` ou `Espaço` |
| Agachar | `Ctrl` |
| Pular | `Espaço` (fora do modo galeria) |
| Navegar entre projetos | `Scroll do mouse` (cima/baixo) |
| Fechar painel de projeto | `Esc` |

### Mobile / Touch

| Ação | Controle |
|---|---|
| Olhar | Tocar e arrastar na metade direita da tela |
| Mover | Joystick virtual (metade esquerda da tela) |
| Atirar | Botão de disparo dedicado (botão laranja) |
| Navegar entre projetos | Swipe vertical |
| Fechar painel | Botão ✕ no painel |

---

## 🏙️ Estrutura da Cidade

A cidade é gerada proceduralmente com:

- **Grade de quarteirões** com blocos de 340 unidades e ruas de 110 unidades de largura
- **Calçadas**, sarjetas, ciclovias e marcações de pista detalhadas
- **Prédios** com geometria extrudada, fachadas com imagens reais dos projetos, fins de esquina com LEDs neon laranja
- **Iluminação dinâmica** com point lights e ambient light
- **Névoa** para dar profundidade à cena
- **Sistema de colisão** com grade espacial para otimização

---

## 🗂️ Projetos Exibidos no Museu

### 1. Painel de Administração
- **Imagem de fachada:** `img/cheques.png`
- **Stack:** React · TypeScript · Node.js · MySQL
- **Descrição:** Sistema para gerenciamento de cheques que entram e saem de uma empresa.
- **Link:** [saa-s-cheques.vercel.app](https://saa-s-cheques.vercel.app/)

---

### 2. Devero
- **Imagem de fachada:** `img/devero.jpeg`
- **Stack:** JavaScript · Tailwind · GSAP · Figma
- **Descrição:** Landing page construída meticulosamente para apresentar um serviço de consultoria em marketing digital.
- **Link:** [Post no LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7442203757192548352/)

---

### 3. Foco
- **Imagem de fachada:** `img/foco.png`
- **Stack:** JavaScript · MongoDB · Node.js · GSAP
- **Descrição:** Sistema para gerenciar metas e rotinas de um usuário.
- **Link:** [foco-rotina.vercel.app](https://foco-rotina.vercel.app/)

---

### 4. PGFlow
- **Imagem de fachada:** `img/pgflow.png`
- **Stack:** JavaScript · GSAP · Three.js
- **Descrição:** Página intuitiva para mostrar meu trabalho como desenvolvedor web.
- **Link:** [pgflow.vercel.app](https://pgflow.vercel.app/)

---

### 5. Posto
- **Imagem de fachada:** `img/posto.png`
- **Stack:** JavaScript · Node.js · MongoDB
- **Descrição:** Painel administrativo para um posto de combustível.
- **Link:** [Vídeo demonstrativo (YouTube)](https://www.youtube.com/watch?v=9zFzS9nHbZU)

---

### 6. Planilha de Registros
- **Imagem de fachada:** `img/robo.jpg`
- **Stack:** JavaScript · Node.js · MongoDB · Tailwind
- **Descrição:** Painel administrativo para registro de gastos.
- **Link:** [registrospedro.netlify.app](https://registrospedro.netlify.app/)

---

### 7. TheGadu
- **Imagem de fachada:** `img/thegadu.png`
- **Stack:** Node.js · Tailwind · JavaScript · MongoDB
- **Descrição:** Painel administrativo para uma empresa de venda de roupas.
- **Link:** [thegadu.onrender.com](https://thegadu.onrender.com/)

---

### 8. Theze
- **Imagem de fachada:** `img/theze.png`
- **Stack:** React · TypeScript · Tailwind CSS
- **Descrição:** Landing page para apresentação de uma empresa agrícola.
- **Link:** [thezeagricola.netlify.app](https://thezeagricola.netlify.app/)

---

### 9. Topografia
- **Imagem de fachada:** `img/topografia.png`
- **Stack:** Three.js · JavaScript · Node.js · MongoDB
- **Descrição:** Landing page para apresentação de uma empresa topográfica.
- **Link:** [fjstopografia.com.br](https://www.fjstopografia.com.br/)

---

### 10. Convite
- **Imagem de fachada:** `img/valquiria.png`
- **Stack:** Figma · JavaScript · Node.js · Three.js
- **Descrição:** Convite para um casamento com painel de administração de convidados.
- **Link:** [conviteval.vercel.app](https://conviteval.vercel.app/)

---

### 11. Sistema de Venda
- **Imagem de fachada:** `img/venda.png`
- **Stack:** JavaScript · Node.js · MySQL
- **Descrição:** Sistema de vendas com emissão de nota fiscal válida pela SEFAZ, com banco de dados para guardar clientes e vendas.
- **Link:** [Vídeo demonstrativo (YouTube)](https://www.youtube.com/watch?v=skiS8TAx6zA)

---

### 12. Pedroca
- **Imagem de fachada:** `img/Captura de Tela (648).png`
- **Stack:** Three.js · TypeScript · GSAP · React
- **Descrição:** Meu portfólio, onde combino minhas habilidades em design e desenvolvimento web para criar uma experiência imersiva e interativa.
- **Link:** [pedrogarciadev.com.br](https://www.pedrogarciadev.com.br/)

---

### 13. PratoUp
- **Imagem de fachada:** `img/pratoup.png`
- **Stack:** React · TypeScript · GSAP · Three.js
- **Descrição:** Landing page premium para a PratoUp — narrativa visual dark com dourado editorial, hero gastronômico de alto impacto e jornada de contato pensada para transformar visitantes em leads, com animações GSAP e profundidade em Three.js.
- **Link:** [pratoup.com.br](https://pratoup.com.br/)

---

## 🎨 Design System

### Paleta de Cores

| Token | Valor | Uso |
|---|---|---|
| `--mu-gold` | `#c9a84c` | Destaque principal (dourado) |
| `--mu-gold-light` | `#f0ddb0` | Textos em gradiente dourado |
| `--mu-gold-dark` | `#6e5420` | Sombras douradas |
| `--mu-bg-deep` | `#050608` | Fundo profundo |
| `--mu-text` | `#f4f1ea` | Texto principal |
| `--mu-text-muted` | `rgba(244,241,234,0.5)` | Texto secundário |

### Tipografia

| Variável | Fonte | Uso |
|---|---|---|
| `--mu-serif` | Instrument Serif | Títulos itálicos elegantes |
| `--mu-display` | Syne | Títulos em caps (display) |
| `--mu-sans` | Outfit | Corpo de texto, descrições |
| `--mu-mono` | Space Mono | Labels, metadados, HUD |

---

## ⚙️ Arquitetura Técnica

### Sistema de Renderização
- **Three.js WebGLRenderer** com `antialias`, `shadowMap` e tone mapping configurados
- **Duas layers** separadas: `WORLD_LAYER` (cena 3D) e layer padrão (HUD/UI sobreposta)
- **LOD implícito** via `frustumCulled` e distância de renderização configurada por peça

### Sistema de Física e Colisão
- Colisões baseadas em **AABB (Axis-Aligned Bounding Boxes)** com grade espacial
- Player com `radius`, `height`, `eyeHeight`, gravidade, velocidade e fricção configuráveis
- Suporte a agachar (crouch) com redução de altura e olho

### Sistema de Galeria
- **13 estações** posicionadas automaticamente ao redor de cada prédio
- Navegação suave com interpolação `easeInOutCubic` entre posições
- Câmera livre para olhar ao redor enquanto posição permanece fixa na estação

### Painel 3D de Projeto (PP3D)
- Painel renderizado **dentro da cena 3D** (não como HTML overlay)
- Texto e imagens gerados via **Canvas API** e convertidos em `THREE.CanvasTexture`
- Botões "ENTRAR" e "SAIR" com raycasting para detecção de cliques via disparo
- Animação de entrada com `easeOut` e saída com `easeIn`
- Luz pontual dinâmica (`PointLight`) ilumina o prédio ao abrir o painel

### Texturas Procedurais
Todas as texturas do chão/cidade são geradas em runtime por funções Canvas:
- `makeAsphaltTexture` — asfalto com ruído
- `makeSidewalkTexture` — calçada com blocos
- `makePlazaTexture` — praça
- `makeBrickTexture` — tijolos
- `makeFacadeTexture` — fachada de prédio genérica
- `makeMetalTexture` — metal
- `makeCurbTexture`, `makeGutterTexture`, `makeTactileTexture` — detalhes de rua

---

## 📁 Estrutura de Arquivos

```
testecs/
├── index.html              # Arquivo principal (toda a aplicação)
├── README.md               # Este arquivo
└── img/
    ├── cheques.png         # Painel de Administração
    ├── devero.jpeg         # Devero
    ├── foco.png            # Foco
    ├── pgflow.png          # PGFlow
    ├── posto.png           # Posto
    ├── robo.jpg            # Planilha de Registros
    ├── thegadu.png         # TheGadu
    ├── theze.png           # Theze
    ├── topografia.png      # Topografia
    ├── valquiria.png       # Convite
    ├── venda.png           # Sistema de Venda
    ├── pratoup.png         # PratoUp
    ├── msueu.jpg           # Assets do museu
    ├── Captura de Tela (648).png  # Pedroca (portfólio)
    └── Gemini_Generated_Image_rluay3rluay3rlua-removebg-preview.png
```

---

## 🚀 Como Rodar

Por ser um único arquivo HTML sem dependências locais (Three.js carregado via CDN implícito ou inline), basta:

1. Clonar ou baixar o repositório
2. Abrir o arquivo `index.html` diretamente no navegador

> **Nota:** Algumas funcionalidades como `crossOrigin` de imagens podem requerer um servidor HTTP local. Use `Live Server` (VS Code), `npx serve .` ou qualquer servidor estático.

```bash
# Exemplo com npx
npx serve .
```

---

## 📱 Compatibilidade

| Plataforma | Suporte |
|---|---|
| Chrome / Edge (desktop) | ✅ Completo |
| Firefox (desktop) | ✅ Completo |
| Safari (desktop) | ✅ Completo |
| Chrome / Safari (mobile) | ✅ Controles touch adaptativos |
| Dispositivos sem WebGL | ❌ Não suportado |

> O site detecta `backdrop-filter` e oferece fallback para navegadores que não suportam.  
> Safe area insets (`env(safe-area-inset-*)`) são respeitados para dispositivos com notch.

---

## 👤 Autor

**Pedro Garcia**  
Desenvolvedor Web Full Stack  
🌐 [pedrogarciadev.com.br](https://www.pedrogarciadev.com.br/)

---

*"Um museu onde cada prédio conta uma história de código."*
