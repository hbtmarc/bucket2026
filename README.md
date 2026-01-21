# 🧠 Bucket 2026 - Meu Segundo Cérebro

> Sistema de gerenciamento de conhecimento pessoal para aprimorar e organizar o ano de 2026.

## 🎯 Visão Geral

Este repositório funciona como um **segundo cérebro** - um sistema organizado para capturar, organizar e recuperar informações importantes, gerenciar projetos, acompanhar metas e manter o foco no que realmente importa em 2026.

## 📚 Estrutura do Sistema

O sistema é baseado no **método PARA** (Projects, Areas, Resources, Archive):

```
bucket2026/
├── 📁 projects/          # Projetos ativos com prazo definido
├── 📁 areas/             # Áreas de responsabilidade contínua
├── 📁 resources/         # Materiais de referência e aprendizado
├── 📁 archive/           # Projetos e materiais concluídos
├── 📁 daily-notes/       # Notas diárias
├── 📁 weekly-reviews/    # Revisões semanais
└── 📁 templates/         # Templates reutilizáveis
```

### 🚀 Projetos
Objetivos com prazo definido e resultado específico.
- [Metas 2026](projects/metas-2026/projeto.md) 🟢
- [Adicionar novo projeto...](templates/project-template.md)

### 🎯 Áreas da Vida
Responsabilidades contínuas que requerem manutenção.
- [Desenvolvimento Pessoal](areas/desenvolvimento-pessoal.md) 🟢
- [Adicionar nova área...](templates/goal-template.md)

### 📖 Recursos
- [Ver todos os recursos](resources/README.md)

### 📝 Notas Recentes
- [2026-01-21](daily-notes/2026-01/2026-01-21.md) - Configuração inicial do sistema

## 🚀 Como Usar

> 📖 **Novo aqui?** Comece com o [Guia de Início Rápido](QUICKSTART.md) (5 minutos)

### Início Rápido

1. **Capture diariamente**: Use notas diárias para registrar pensamentos e tarefas
   ```bash
   # Crie a pasta do mês e copie o template
   mkdir -p daily-notes/2026-01
   cp templates/daily-note-template.md daily-notes/2026-01/$(date +%Y-%m-%d).md
   ```

2. **Revise semanalmente**: Toda semana, faça uma revisão usando o template
   ```bash
   # Copie o template
   cp templates/weekly-review-template.md weekly-reviews/2026-Semana-$(date +%V).md
   ```

3. **Organize projetos**: Mantenha 5-7 projetos ativos no máximo
   - Use `templates/project-template.md` para novos projetos
   - Mova projetos concluídos para `archive/`

4. **Mantenha áreas**: Revise suas áreas de vida regularmente
   - Use `templates/goal-template.md` para definir metas

### Fluxo de Trabalho Recomendado

**Diariamente** (5-10 minutos):
- Crie/atualize sua nota diária
- Capture pensamentos e tarefas
- Reflita sobre o dia

**Semanalmente** (30-60 minutos):
- Revisão semanal completa
- Atualizar progresso em projetos
- Planejar próxima semana
- Processar notas da semana

**Mensalmente** (1-2 horas):
- Revisar áreas de vida
- Avaliar progresso em metas
- Ajustar prioridades
- Arquivar projetos concluídos

## 📋 Templates Disponíveis

- [Nota Diária](templates/daily-note-template.md)
- [Revisão Semanal](templates/weekly-review-template.md)
- [Projeto](templates/project-template.md)
- [Meta](templates/goal-template.md)

## 💡 Princípios

1. **Simplicidade**: Um sistema simples e usado é melhor que um complexo e abandonado
2. **Consistência**: Pequenas ações diárias criam grandes resultados
3. **Progresso > Perfeição**: Foco em melhorias contínuas, não perfeição
4. **Revisão Regular**: O sistema só funciona se for revisado regularmente
5. **Capture Tudo**: Confie no sistema, não na sua memória

## 🎓 Recursos Educacionais

- [Método PARA](https://fortelabs.com/blog/para/) - Sistema de organização
- [Building a Second Brain](https://www.buildingasecondbrain.com/) - Metodologia base
- [Getting Things Done (GTD)](https://gettingthingsdone.com/) - Gestão de tarefas

## 📊 Status do Sistema

**Última atualização:** 2026-01-21  
**Projetos ativos:** 1  
**Áreas monitoradas:** 1  
**Status geral:** 🟢 Sistema funcional e em uso

---

**✨ Comece hoje mesmo! Copie um template e inicie sua jornada de organização para 2026.**
