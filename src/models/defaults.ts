import { nanoid } from 'nanoid'
import type { Goal, Theme, ChecklistItem } from './types'

interface SeedData {
  themes: Record<string, Theme>
  goals: Record<string, Goal>
  checklists: Record<string, Record<string, ChecklistItem>>
}

const themePalette = [
  { title: 'Tecnologia', color: '#6366f1', icon: '🧠' },
  { title: 'Projetos Pessoais', color: '#14b8a6', icon: '🧩' },
  { title: 'Finanças', color: '#f59e0b', icon: '💰' },
  { title: 'Estabilidade', color: '#f97316', icon: '🛡️' },
  { title: 'Casa/Mudança', color: '#8b5cf6', icon: '🏠' },
  { title: 'Cultura', color: '#0ea5e9', icon: '🎭' },
  { title: 'Entretenimento', color: '#22c55e', icon: '🎉' },
  { title: 'Aventura/Natureza', color: '#16a34a', icon: '🌿' },
  { title: 'Saúde, Produtividade', color: '#ef4444', icon: '❤️' },
  { title: 'Vida a Dois', color: '#ec4899', icon: '💞' },
]

const now = Date.now()

const createTheme = (index: number): Theme => {
  const item = themePalette[index]
  const id = nanoid()
  return {
    id,
    title: item.title,
    description: '',
    icon: item.icon,
    color: item.color,
    order: index + 1,
    createdAt: now + index,
    updatedAt: now + index,
  }
}

const createGoal = (themeId: string, order: number, input: Partial<Goal>): Goal => {
  const id = nanoid()
  return {
    id,
    themeId,
    title: input.title ?? 'Nova meta',
    description: input.description ?? '',
    status: input.status ?? 'planned',
    targetType: input.targetType ?? 'none',
    targetValue: input.targetValue ?? null,
    currentValue: input.currentValue ?? 0,
    priority: input.priority ?? 2,
    budgetPlanned: input.budgetPlanned ?? null,
    quarterHint: input.quarterHint ?? null,
    dueDate: input.dueDate ?? null,
    notesMarkdown: input.notesMarkdown ?? '',
    order,
    createdAt: now + order,
    updatedAt: now + order,
    doneAt: input.doneAt ?? null,
  }
}

export const buildSeedData = (): SeedData => {
  const themes: Record<string, Theme> = {}
  const goals: Record<string, Goal> = {}
  const checklists: Record<string, Record<string, ChecklistItem>> = {}

  const createdThemes = themePalette.map((_, index) => createTheme(index))
  createdThemes.forEach((theme) => {
    themes[theme.id] = theme
  })

  const themeByTitle = Object.fromEntries(createdThemes.map((theme) => [theme.title, theme.id]))

  const addGoal = (themeTitle: string, order: number, input: Partial<Goal>, checklist?: string[]) => {
    const themeId = themeByTitle[themeTitle]
    const goal = createGoal(themeId, order, input)
    goals[goal.id] = goal
    if (checklist && checklist.length) {
      checklists[goal.id] = {}
      checklist.forEach((text, index) => {
        const itemId = nanoid()
        checklists[goal.id][itemId] = {
          id: itemId,
          text,
          done: false,
          order: index + 1,
          createdAt: now + index,
          updatedAt: now + index,
        }
      })
    }
  }

  // Aventura/Natureza
  addGoal('Aventura/Natureza', 1, { title: 'Viagem Airbnb na natureza', targetType: 'count', targetValue: 1 })
  addGoal('Aventura/Natureza', 2, { title: '6 micro-aventuras', targetType: 'count', targetValue: 6 })
  addGoal('Aventura/Natureza', 3, { title: 'Registro cinemático em todas', targetType: 'none', notesMarkdown: 'Lembrar de registrar momentos com captação cinemática.' })

  // Cultura
  addGoal('Cultura', 1, { title: '1 evento cultural grande', targetType: 'count', targetValue: 1 })
  addGoal('Cultura', 2, { title: 'Ler 6 livros', targetType: 'count', targetValue: 6 })

  // Entretenimento
  addGoal('Entretenimento', 1, { title: '6 programas culturais leves', targetType: 'count', targetValue: 6 })
  addGoal('Entretenimento', 2, { title: '3 saídas especiais (~R$500)', targetType: 'count', targetValue: 3, budgetPlanned: 500 })

  // Tecnologia
  addGoal('Tecnologia', 1, { title: 'Aprimorar equipamentos atuais', targetType: 'boolean' }, [
    'Mapear upgrades necessários',
    'Pesquisar custo-benefício',
    'Executar melhorias prioritárias',
  ])
  addGoal('Tecnologia', 2, { title: 'MacBook: setup profissional e templates', targetType: 'boolean' }, [
    'Instalar ferramentas essenciais',
    'Criar templates de projeto',
    'Documentar setup',
  ])

  // Projetos Pessoais
  addGoal('Projetos Pessoais', 1, { title: 'Sistema de gestão de projetos', targetType: 'boolean' }, [
    'Definir método',
    'Escolher ferramenta',
    'Organizar backlog',
  ])
  addGoal('Projetos Pessoais', 2, { title: 'Portfólio digital', targetType: 'boolean' }, [
    'Selecionar cases',
    'Criar layout',
    'Publicar versão final',
  ])
  addGoal('Projetos Pessoais', 3, { title: '12 entregas mensais de vídeo', targetType: 'count', targetValue: 12 })
  addGoal('Projetos Pessoais', 4, { title: 'Aperfeiçoar edição', targetType: 'boolean' }, [
    'Definir trilha de estudos',
    'Praticar técnicas semanais',
    'Registrar aprendizados',
  ])

  // Finanças
  addGoal('Finanças', 1, { title: 'Manter e evoluir controle financeiro', targetType: 'boolean' }, [
    'Revisar planilha mensal',
    'Comparar orçamento vs realizado',
    'Ajustar metas de gasto',
  ])
  addGoal('Finanças', 2, { title: 'Dívidas cartão: mapear e reduzir', targetType: 'boolean' }, [
    'Listar todas as dívidas',
    'Negociar taxas',
    'Planejar pagamentos',
  ])

  // Estabilidade
  addGoal('Estabilidade', 1, { title: 'Reserva de emergência: 2 meses', targetType: 'boolean' }, [
    'Definir meta mensal de aporte',
    'Criar conta separada',
    'Acompanhar evolução',
  ])
  addGoal('Estabilidade', 2, { title: 'Financiamento: acompanhar e antecipar quando possível', targetType: 'boolean' }, [
    'Organizar calendário de parcelas',
    'Simular antecipações',
    'Reservar verba extra',
  ])

  // Saúde, Produtividade
  addGoal('Saúde, Produtividade', 1, { title: 'Saúde: recuperação e prevenção', targetType: 'boolean' }, [
    'Checkups agendados',
    'Plano de recuperação',
    'Acompanhar evolução',
  ])
  addGoal('Saúde, Produtividade', 2, { title: 'Treinos: consistência + evolução JJ/Muay Thai', targetType: 'count', targetValue: 24 })
  addGoal('Saúde, Produtividade', 3, { title: 'Produtividade: quadro e rotina', targetType: 'boolean' }, [
    'Definir blocos de foco',
    'Implementar quadro semanal',
    'Revisar rotina mensal',
  ])

  // Vida a Dois
  addGoal('Vida a Dois', 1, { title: 'Relacionamento: conversa mensal com a Luiza', targetType: 'count', targetValue: 12 })

  // Casa/Mudança
  addGoal('Casa/Mudança', 1, { title: 'Casa/mudança: planejar cenários e custos', targetType: 'boolean' }, [
    'Pesquisar bairros',
    'Estimativa de custos',
    'Definir timeline',
  ])

  return { themes, goals, checklists }
}

// Update
