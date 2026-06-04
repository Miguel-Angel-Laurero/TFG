# Sistema de quiz adaptativo — zona de alto riesgo

> Los 7 composables del quiz son **interdependientes**. Antes de tocar cualquiera, leer `useQuizController.js` (máquina de estados principal).

## Dependencias

| Composable | Depende de |
|---|---|
| `useQuizController` | useQuizLoader, useAdaptiveSelection, useActivitySession |
| `useQuizLoader` | useCategoryStats, API questions |
| `useAdaptiveSelection` | useAdaptiveHistory, useCategoryStats |
| `useActivitySession` | session API |
| `useActivityReward` | useCategoryStats, rewards API |
| `useQuizReward` | useActivityReward, authStore |
| `useCategoryStats` | categoryStats API |

## Punto de entrada

`ludoScript/src/composables/useQuizController.js` — máquina de estados principal que orquesta los demás composables.

## Archivos relacionados

Todos en `ludoScript/src/composables/`:
- `useQuizController.js`
- `useQuizLoader.js`
- `useAdaptiveSelection.js`
- `useAdaptiveHistory.js`
- `useActivitySession.js`
- `useActivityReward.js`
- `useQuizReward.js`
- `useCategoryStats.js`
- `useQuizOptions.js`
- `useQuizStats.js`
- `useQuizHistory.js`
