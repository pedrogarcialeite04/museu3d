/**
 * Metadados dos prédios — edite `url` com o deploy real de cada projeto.
 * Slugs usados: https://pedroca.dev/p/{slug}
 */
const PROJECT_BASE = 'https://pedroca.dev/p';

const SLUGS = {
  Cheques: 'cheques',
  Devero: 'devero',
  Foco: 'foco',
  PGFlow: 'pgflow',
  Posto: 'posto',
  'Robô': 'robo',
  TheGadu: 'thegadu',
  Theze: 'theze',
  Topografia: 'topografia',
  Valquíria: 'valquiria',
  Venda: 'venda',
  Pedroca: 'museu-3d',
};

/** @type {Record<string, { stack: string[], description: string, url: string }>} */
export const PROJECT_INFO = {
  Cheques: {
    stack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    description:
      'Desenvolvi o fluxo completo de emissão e compensação de cheques: API REST com validação de lotes, filas de aprovação no front e trilha de auditoria por evento. No back, normalizei regras de negócio em serviços testáveis e exportação de relatórios em PDF para o financeiro.',
    url: `${PROJECT_BASE}/${SLUGS.Cheques}`,
  },
  Devero: {
    stack: ['Next.js', 'Prisma', 'PostgreSQL', 'Redis'],
    description:
      'Construí painéis operacionais e automações de rotina com agendamento de jobs, cache de consultas pesadas e permissões por perfil. A arquitetura separa domínio de infraestrutura para facilitar novas integrações sem quebrar o core.',
    url: `${PROJECT_BASE}/${SLUGS.Devero}`,
  },
  Foco: {
    stack: ['React', 'Zustand', 'PWA', 'REST API'],
    description:
      'Implementei gestão de metas e tarefas com estado global previsível, notificações locais e modo offline básico. Priorizei feedback instantâneo na UI e endpoints enxutos para listagens com paginação cursor-based.',
    url: `${PROJECT_BASE}/${SLUGS.Foco}`,
  },
  PGFlow: {
    stack: ['Vue 3', 'Node.js', 'Webhooks', 'PostgreSQL'],
    description:
      'Modelei pipeline de pagamentos com etapas rastreáveis, webhooks idempotentes e reconciliação automática. O painel exibe status em tempo real via polling inteligente e logs estruturados para suporte.',
    url: `${PROJECT_BASE}/${SLUGS.PGFlow}`,
  },
  Posto: {
    stack: ['React Native', 'Expo', 'Firebase', 'Node.js'],
    description:
      'Entreguei app para frente de caixa e estoque com sincronização em tempo real, fechamento de turno e indicadores por bomba. No servidor, APIs versionadas e regras de desconto centralizadas.',
    url: `${PROJECT_BASE}/${SLUGS.Posto}`,
  },
  'Robô': {
    stack: ['Python', 'FastAPI', 'Celery', 'Docker'],
    description:
      'Orquestrei robôs de automação com filas de tarefas, retries configuráveis e monitoramento de execução. Cada rotina é declarada em YAML e versionada; falhas disparam alertas com stack trace sanitizado.',
    url: `${PROJECT_BASE}/${SLUGS['Robô']}`,
  },
  TheGadu: {
    stack: ['Next.js', 'Tailwind', 'Vercel', 'Analytics'],
    description:
      'Site institucional com SSR, otimização de imagens, SEO técnico e componentes reutilizáveis. Configurei CI/CD, preview por PR e métricas de Core Web Vitals no deploy.',
    url: `${PROJECT_BASE}/${SLUGS.TheGadu}`,
  },
  Theze: {
    stack: ['React', 'GraphQL', 'NestJS', 'MongoDB'],
    description:
      'Plataforma modular com schema GraphQL tipado, autenticação JWT refreshável e micro-serviços por domínio. Documentei contratos de API e testes de integração nos fluxos críticos.',
    url: `${PROJECT_BASE}/${SLUGS.Theze}`,
  },
  Topografia: {
    stack: ['Three.js', 'Leaflet', 'GeoJSON', 'Python'],
    description:
      'Ferramenta de levantamento com importação de pontos, camadas vetoriais e exportação de plantas. Processei coordenadas no back e renderizei overlays georreferenciados no cliente.',
    url: `${PROJECT_BASE}/${SLUGS.Topografia}`,
  },
  Valquíria: {
    stack: ['Figma', 'React', 'Storybook', 'Design System'],
    description:
      'Design system com tokens, componentes documentados no Storybook e handoff limpo para dev. Implementei acessibilidade (ARIA, contraste) e estados de loading/erro padronizados.',
    url: `${PROJECT_BASE}/${SLUGS.Valquíria}`,
  },
  Venda: {
    stack: ['React', 'Node.js', 'Stripe', 'PostgreSQL'],
    description:
      'CRM enxuto com funil Kanban, metas por etapa e integração de pagamentos. Webhooks do gateway atualizam status de pedido; relatórios agregados rodam em views materializadas.',
    url: `${PROJECT_BASE}/${SLUGS.Venda}`,
  },
  Pedroca: {
    stack: ['Three.js', 'WebGL', 'GSAP', 'JavaScript'],
    description:
      'Este museu 3D: galeria com hitscan, colisores AABB, navegação por scroll e fachadas texturizadas por projeto. Tudo roda no browser com loop fixo e zero alocação no frame crítico.',
    url: `${PROJECT_BASE}/${SLUGS.Pedroca}`,
  },
};

export function getProjectMeta(name) {
  const meta = PROJECT_INFO[name];
  if (meta) return meta;
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  return {
    stack: ['Web', 'API'],
    description:
      'Entrega web com front responsivo, API documentada e deploy automatizado. Ajuste a URL em src/config/project-info.js quando o link oficial estiver disponível.',
    url: `${PROJECT_BASE}/${slug}`,
  };
}
