export const QUIZ_CATEGORIES = [
  { key: "fundamentos-js", label: "Fundamentos JS" },
  { key: "arrays-colecciones", label: "Arrays y Colecciones" },
  { key: "funciones-scope", label: "Funciones y Scope" },
  { key: "objetos", label: "Objetos" },
  { key: "asincronia", label: "Asincronia" },
];

export const QUIZ_CATEGORY_MAP = Object.fromEntries(
  QUIZ_CATEGORIES.map((category) => [category.key, category]),
);

export function getQuizCategoryLabel(categoryKey) {
  return QUIZ_CATEGORY_MAP[categoryKey]?.label ?? categoryKey;
}

export function formatQuizSlug(slug) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatQuizCategoryLabel(categoryKey) {
  return getQuizCategoryLabel(categoryKey) ?? formatQuizSlug(categoryKey);
}
