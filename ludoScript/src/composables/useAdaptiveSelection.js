import {
  QUIZ_CATEGORIES,
  formatQuizCategoryLabel,
} from "@/utils/quizCategories";

const lsPdfQuestions = (id) => `ludoscript_pdf_questions_${id}`;
const lsPdfActiveIds = (id) => `ludoscript_pdf_active_ids_${id}`;
const lsPdfCloudSaved = (id) => `ludoscript_pdf_cloud_saved_${id}`;

import { userScopedStorageKey } from '@/utils/storageKeys'

const LS_TUTORIAL_TOPIC_STATS = "ludoscript_tutorial_topic_stats";
const LS_TUTORIAL_RECENT_IDS = "ludoscript_tutorial_recent_ids";

const WEAK_MIN_TOTAL = 5;
const STABLE_MIN_TOTAL = 8;
const RECENT_IDS_LIMIT = 30;

function fisherYates(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickRandomIds(questions, n = 15) {
  const shuffled = fisherYates(questions);
  return shuffled.slice(0, Math.min(n, shuffled.length)).map((q) => q.id);
}

function filterByIds(questions, ids) {
  const set = new Set(ids);
  return questions.filter((q) => set.has(q.id));
}

function calculateWeakCategories(stats, minTotal = WEAK_MIN_TOTAL) {
  return stats
    .filter((s) => s.total >= minTotal)
    .map((s) => ({
      category: s.category,
      errorRate: (s.total - s.correct) / s.total,
      correct: s.correct,
      total: s.total,
    }))
    .sort((a, b) => b.errorRate - a.errorRate);
}

function errorRateBadgeClass(errorRate) {
  if (errorRate >= 0.6)
    return "bg-red-500/20 border border-red-500/40 text-red-300";
  if (errorRate >= 0.35)
    return "bg-amber-500/20 border border-amber-500/40 text-amber-300";
  return "bg-indigo-500/20 border border-indigo-500/40 text-indigo-300";
}

function formatCategoryLabel(category) {
  return formatQuizCategoryLabel(category);
}

function toTopicKey(category, topic = "general") {
  return `${category}::${topic}`;
}

function readJsonFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJsonToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignorar errores de quota.
  }
}

function getTutorialTopicStatsKey() {
  return userScopedStorageKey(LS_TUTORIAL_TOPIC_STATS)
}

function getTutorialRecentIdsKey() {
  return userScopedStorageKey(LS_TUTORIAL_RECENT_IDS)
}

function readTutorialTopicStats() {
  return readJsonFromStorage(getTutorialTopicStatsKey(), {});
}

function readTutorialRecentIds() {
  return readJsonFromStorage(getTutorialRecentIdsKey(), []);
}

function writeTutorialRecentIds(ids) {
  writeJsonToStorage(
    getTutorialRecentIdsKey(),
    ids.slice(0, RECENT_IDS_LIMIT),
  );
}

function rememberTutorialQuestionIds(questionIds) {
  if (!Array.isArray(questionIds) || questionIds.length === 0) return;

  const uniqueIds = [
    ...new Set(questionIds.map((id) => Number(id)).filter(Boolean)),
  ];
  const current = readTutorialRecentIds().filter(
    (id) => !uniqueIds.includes(id),
  );
  writeTutorialRecentIds([...uniqueIds, ...current]);
}

function trackTutorialQuestionResult({
  category,
  topic = "general",
  questionId = null,
  isCorrect,
}) {
  if (!category) return;

  const key = toTopicKey(category, topic);
  const stats = readTutorialTopicStats();
  const current = stats[key] ?? { category, topic, correct: 0, total: 0 };

  current.total += 1;
  if (isCorrect) current.correct += 1;

  stats[key] = current;
  writeJsonToStorage(LS_TUTORIAL_TOPIC_STATS, stats);

  if (questionId !== null) {
    rememberTutorialQuestionIds([questionId]);
  }
}

function getTopicWeakness(topicStats, category, topic) {
  const key = toTopicKey(category, topic ?? "general");
  const current = topicStats[key];
  if (!current || current.total === 0) return 0.4;
  return (current.total - current.correct) / current.total;
}

function getCategoryProfileMap(stats = []) {
  const weakCategories = calculateWeakCategories(stats, WEAK_MIN_TOTAL);
  const weakMap = new Map(
    weakCategories.map((entry) => [entry.category, entry]),
  );

  return new Map(
    QUIZ_CATEGORIES.map(({ key }) => {
      const stat = stats.find((entry) => entry.category === key) ?? {
        category: key,
        correct: 0,
        total: 0,
      };
      const accuracy = stat.total > 0 ? stat.correct / stat.total : null;
      const isWeak = stat.total >= WEAK_MIN_TOTAL && (accuracy ?? 1) < 0.7;
      const isStable =
        stat.total >= STABLE_MIN_TOTAL && (accuracy ?? 0) >= 0.75;
      return [
        key,
        {
          category: key,
          correct: stat.correct,
          total: stat.total,
          accuracy,
          errorRate:
            weakMap.get(key)?.errorRate ??
            (accuracy === null ? 0.45 : 1 - accuracy),
          isWeak,
          isStable,
        },
      ];
    }),
  );
}

function getDifficultyWeight(questionDifficulty, profile) {
  if (profile?.isWeak) {
    // Usuario con muchos errores: priorizar niveles 1-2, casi nunca 4-5
    const weights = { 1: 20, 2: 15, 3: 6, 4: 2, 5: 1 };
    return weights[questionDifficulty] ?? 1;
  }

  if (profile?.isStable) {
    // Usuario con buenos resultados: evitar niveles 1-2, priorizar 3-4
    const weights = { 1: 2, 2: 5, 3: 14, 4: 13, 5: 9 };
    return weights[questionDifficulty] ?? 1;
  }

  // Sin datos suficientes: ligero sesgo hacia niveles 2-3
  const weights = { 1: 8, 2: 13, 3: 12, 4: 7, 5: 4 };
  return weights[questionDifficulty] ?? 1;
}

function buildAdaptiveQuestionScore(question, context) {
  const {
    categoryProfiles,
    topicStats,
    recentIds,
    selectedIds,
    bucketCategorySet,
  } = context;
  const profile = categoryProfiles.get(question.category);
  const topicWeakness = getTopicWeakness(
    topicStats,
    question.category,
    question.topic,
  );
  const isRecent = recentIds.has(question.id);

  let score = 0;
  score += bucketCategorySet.has(question.category) ? 30 : 0;
  score += (profile?.errorRate ?? 0.45) * 20;
  score += topicWeakness * 18;
  score += getDifficultyWeight(question.difficulty ?? 1, profile);
  score += isRecent ? -20 : 6;
  score += selectedIds.has(question.id) ? -1000 : 0;
  score += Math.random();

  return score;
}

function pickBucketQuestions(questions, count, context) {
  if (count <= 0) return [];

  const ranked = fisherYates(questions)
    .filter((question) => !context.selectedIds.has(question.id))
    .sort(
      (a, b) =>
        buildAdaptiveQuestionScore(b, context) -
        buildAdaptiveQuestionScore(a, context),
    );

  const picked = ranked.slice(0, Math.min(count, ranked.length));
  for (const question of picked) {
    context.selectedIds.add(question.id);
  }
  return picked;
}

function pickCategoriesByPriority(categoryProfiles) {
  return [...categoryProfiles.values()]
    .sort((a, b) => {
      if (b.errorRate !== a.errorRate) return b.errorRate - a.errorRate;
      return a.total - b.total;
    })
    .map((entry) => entry.category);
}

function selectAdaptiveQuestions(
  allQuestions,
  stats = [],
  totalQuestions = 15,
) {
  if (!Array.isArray(allQuestions) || allQuestions.length === 0) {
    return { questions: [], weakCategories: [] };
  }

  const topicStats = readTutorialTopicStats();
  const recentIds = new Set(readTutorialRecentIds());
  const categoryProfiles = getCategoryProfileMap(stats);
  const orderedCategories = pickCategoriesByPriority(categoryProfiles);
  const weakest = orderedCategories.slice(0, 2);
  const middle = orderedCategories.slice(2, 4);

  const selectedIds = new Set();
  const weakBucket = pickBucketQuestions(allQuestions, 9, {
    categoryProfiles,
    topicStats,
    recentIds,
    selectedIds,
    bucketCategorySet: new Set(weakest),
  });

  const middleBucket = pickBucketQuestions(allQuestions, 4, {
    categoryProfiles,
    topicStats,
    recentIds,
    selectedIds,
    bucketCategorySet: new Set(middle),
  });

  const generalBucket = pickBucketQuestions(
    allQuestions,
    totalQuestions - weakBucket.length - middleBucket.length,
    {
      categoryProfiles,
      topicStats,
      recentIds,
      selectedIds,
      bucketCategorySet: new Set(orderedCategories),
    },
  );

  const selected = [...weakBucket, ...middleBucket, ...generalBucket].slice(
    0,
    Math.min(totalQuestions, allQuestions.length),
  );

  rememberTutorialQuestionIds(selected.map((question) => question.id));

  return {
    questions: fisherYates(selected),
    weakCategories: calculateWeakCategories(stats, WEAK_MIN_TOTAL).slice(0, 3),
  };
}

function savePdfQuestionsToStorage(pdfId, questions, flashCards) {
  try {
    const activeIds = pickRandomIds(questions, 15);
    localStorage.setItem(
      lsPdfQuestions(pdfId),
      JSON.stringify({ questions, flashCards }),
    );
    localStorage.setItem(lsPdfActiveIds(pdfId), JSON.stringify(activeIds));
    return activeIds;
  } catch {
    return [];
  }
}

function loadPdfQuestionsFromStorage(pdfId) {
  try {
    const raw = localStorage.getItem(lsPdfQuestions(pdfId));
    const idsRaw = localStorage.getItem(lsPdfActiveIds(pdfId));
    if (!raw || !idsRaw) return null;
    const { questions, flashCards } = JSON.parse(raw);
    const activeIds = JSON.parse(idsRaw);
    return { questions, flashCards, activeIds };
  } catch {
    return null;
  }
}

function removePdfFromStorage(pdfId) {
  localStorage.removeItem(lsPdfQuestions(pdfId));
  localStorage.removeItem(lsPdfActiveIds(pdfId));
  localStorage.removeItem(lsPdfCloudSaved(pdfId));
}

function hasPdfInStorage(pdfId) {
  return !!localStorage.getItem(lsPdfQuestions(pdfId));
}

function isPdfSavedToCloud(pdfId) {
  return localStorage.getItem(lsPdfCloudSaved(pdfId)) === "true";
}

function markPdfAsSavedToCloud(pdfId) {
  try {
    localStorage.setItem(lsPdfCloudSaved(pdfId), "true");
  } catch {
    // quota exceeded
  }
}

function syncPdfsFromServer(pdfs) {
  if (!Array.isArray(pdfs)) return;
  for (const pdf of pdfs) {
    if (!pdf.quizQuestions || !pdf.flashCards) continue;
    if (hasPdfInStorage(pdf.id)) continue;
    savePdfQuestionsToStorage(pdf.id, pdf.quizQuestions, pdf.flashCards);
    markPdfAsSavedToCloud(pdf.id);
  }
}

export {
  fisherYates,
  pickRandomIds,
  filterByIds,
  calculateWeakCategories,
  errorRateBadgeClass,
  formatCategoryLabel,
  selectAdaptiveQuestions,
  trackTutorialQuestionResult,
  readTutorialTopicStats,
  rememberTutorialQuestionIds,
  savePdfQuestionsToStorage,
  loadPdfQuestionsFromStorage,
  removePdfFromStorage,
  hasPdfInStorage,
  isPdfSavedToCloud,
  markPdfAsSavedToCloud,
  syncPdfsFromServer,
};
