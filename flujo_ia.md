┌─────────────────────────────────────────────────────────────────────┐
│ LUDOSCRIPT — ARQUITECTURA IA │
│ │
│ Fuente de verdad única: .opencode/ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ AGENTS.md (50 líneas) ←── se carga SIEMPRE │ │
│ │ ╔═══════════════════════════════════════════════════════╗ │ │
│ │ ║ • Stack + arranque ║ │ │
│ │ ║ • 6 reglas críticas (lo que más bugs causa) ║ │ │
│ │ ║ • Tabla de "qué cargar y cuándo" → rules/ ║ │ │
│ │ ║ • Zonas de alto riesgo (quiz) ║ │ │
│ │ ╚═══════════════════════════════════════════════════════╝ │ │
│ │ │ │
│ │ rules/ (7 archivos) ←── carga bajo demanda │ │
│ │ ┌──────────────────────────────────────────────────────┐ │ │
│ │ │ project-map.md → árbol, endpoints, DB, Socket │ │ │
│ │ │ backend-conventions → controllers, modelos, rutas │ │ │
│ │ │ frontend-conventions → stores, composables, vistas │ │ │
│ │ │ sockets-architecture → handlers, listeners, eventos │ │ │
│ │ │ quiz-system.md → 7 composables interdepend. │ │ │
│ │ │ decisions-log.md → por qué se decidió cada cosa │ │ │
│ │ │ agent-harness.md → guardrails de comportamiento │ │ │
│ │ └──────────────────────────────────────────────────────┘ │ │
│ │ │ │
│ │ skills/ (10 skills) ←── se invocan con / o por contexto │ │
│ │ ┌──────────────────────────────────────────────────────┐ │ │
│ │ │ backend-endpoint feature-vertical debug │ │ │
│ │ │ frontend-store frontend-composable tests │ │ │
│ │ │ socket-event ui-component │ │ │
│ │ │ design-review retrospect │ │ │
│ │ └──────────────────────────────────────────────────────┘ │ │
│ │ │ │
│ │ agents/ (1 agente) │ │
│ │ ┌──────────────────────────────────────────────────────┐ │ │
│ │ │ refactor.md → Clean Architecture, SRP │ │ │
│ │ └──────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ │
│ ▼ │
│ │
│ .github/ ──▶ Solo proxies + contenido exclusivo │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ AGENTS.md (43 líneas) ←── se carga SIEMPRE (Copilot) │ │
│ │ ┌──────────────────────────────────────────────────────┐ │ │
│ │ │ • Arranque + 6 reglas críticas │ │ │
│ │ │ • Tabla de "cargar .opencode/rules/X cuando..." │ │ │
│ │ │ • Prompts disponibles (/nueva-feature, /debug...) │ │ │
│ │ │ • Agents exclusivos (Arquitecto, Vue Refactor) │ │ │
│ │ └──────────────────────────────────────────────────────┘ │ │
│ │ │ │
│ │ skills/ (11 stubs) ──▶ cada uno redirige a .opencode/ │ │
│ │ ┌──────────────────────────────────────────────────────┐ │ │
│ │ │ new-backend-endpoint ──▶ backend-endpoint │ │ │
│ │ │ create-pinia-store ──▶ frontend-store │ │ │
│ │ │ debug-backend ──▶ debug │ │ │
│ │ │ grill-me ──▶ design-review │ │ │
│ │ │ ... (11 stubs, ~8 líneas cada uno) │ │ │
│ │ └──────────────────────────────────────────────────────┘ │ │
│ │ │ │
│ │ agents/ (2 exclusivos + 1 stub) │ │
│ │ ┌──────────────────────────────────────────────────────┐ │ │
│ │ │ arquitecto.agent.md ← exclusivo Copilot │ │ │
│ │ │ vue-refactor.agent.md ← exclusivo Copilot │ │ │
│ │ │ arquitecto-refactor.agent.md ──▶ refactor.md │ │ │
│ │ └──────────────────────────────────────────────────────┘ │ │
│ │ │ │
│ │ instructions/ (1 exclusivo + 3 stubs) │ │
│ │ ┌──────────────────────────────────────────────────────┐ │ │
│ │ │ project-architecture.md ← exclusivo Copilot │ │ │
│ │ │ backend-conventions ──▶ rules/backend-conv. │ │ │
│ │ │ frontend-conventions ──▶ rules/frontend-conv. │ │ │
│ │ │ decisions-log ──▶ rules/decisions-log │ │ │
│ │ └──────────────────────────────────────────────────────┘ │ │
│ │ │ │
│ │ prompts/ (5 prompts) ←── exclusivos Copilot, intactos │ │
│ │ ┌──────────────────────────────────────────────────────┐ │ │
│ │ │ /nueva-feature /nuevo-endpoint /debug-error │ │ │
│ │ │ /escribir-tests /planificar-arquitectura │ │ │
│ │ └──────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘

                         FLUJO DE CARGA POR SESIÓN

     ┌──────────────┐                    ┌──────────────┐
     │   OpenCode   │                    │   Copilot    │
     └──────┬───────┘                    └──────┬───────┘
            │                                   │
            ▼                                   ▼

┌─────────────────┐ ┌─────────────────┐
│ AGENTS.md (50L) │ │ AGENTS.md (43L) │
│ ~500 tokens │ │ ~430 tokens │
└────────┬────────┘ └────────┬────────┘
│ │
│ ¿Toca backend? │ ¿Toca backend?
│ ──▶ rules/backend-conv │ ──▶ instructions/stub
│ │ ──▶ .opencode/rules/
│ ¿Toca frontend? │
│ ──▶ rules/frontend-conv │ ¿Toca frontend?
│ │ ──▶ instructions/stub
│ ¿Toca quiz? │ ──▶ .opencode/rules/
│ ──▶ rules/quiz-system │
│ │ ¿Invocan /debug-error?
│ ¿Invocan skill? │ ──▶ prompt recoge datos
│ ──▶ skills/XXX (completo) │ ──▶ skill stub
│ │ ──▶ .opencode/skills/
│ │
▼ ▼
┌─────────────────┐ ┌─────────────────┐
│ Reglas + skills │ │ Prompts + stubs │
│ cargadas desde │ │ → redirigen a │
│ .opencode/ │ │ .opencode/ │
└─────────────────┘ └─────────────────┘

                    RESUMEN DE TOKENS (por sesión típica)

                    Antes              Ahora         Ahorro

┌─────────────────────────────────────────────────────────┐
│ AGENTS.md ~1,400 tokens ~500 tokens 64% │
│ Skills invocados ~800 c/u ~80 (stub) 90% │
│ Rules cargadas ~3,000 total ~1,000 t. 66% │
│ Duplicación ~6,000 tokens 0 tokens 100% │
└─────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════
│ Arquitectura: .opencode/ → fuente de verdad única │
│ .github/ → proxies mínimos + exclusivos │
│ Flujo: AGENTS.md → rule específica → skill │
│ Principio: referenciar, no duplicar │
═══════════════════════════════════════════════════════════
