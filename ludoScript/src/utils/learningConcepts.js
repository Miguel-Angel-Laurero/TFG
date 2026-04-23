/**
 * Conceptos básicos de programación para el Área de aprendizaje.
 * Cada objeto incluye textos explicativos (llano + técnico)
 * y el nombre del componente visual interactivo asociado.
 *
 * Las clases de acento usan valores completos para que Tailwind JIT
 * las detecte al escanear este archivo.
 */
export const CONCEPTS = [
  {
    id: "variables",
    title: "Variables",
    emoji: "📦",
    badgeTech: "let · const · var",
    accentBg: "bg-blue-500/20",
    accentBorder: "border-blue-500/40",
    accentText: "text-blue-400",
    accentBadge: "bg-blue-500/30 text-blue-300 border border-blue-500/30",
    accentActive: "bg-blue-600/30 border-blue-500/60",
    accentHighlight: "bg-blue-600",
    textPlain:
      'Imagina que tienes una caja con una etiqueta pegada. Dentro metes un número, un nombre… lo que quieras. Si lo que hay dentro cambia, la etiqueta sigue siendo la misma.\n\nEso es exactamente una variable: una caja etiquetada que guarda información. Y "const" es esa misma caja, pero con candado — una vez llena, no se puede cambiar.',
    textTech:
      "Una variable es un identificador vinculado a una dirección de memoria que almacena un valor. En JavaScript, `let` permite reasignación en el mismo scope, `const` crea una referencia inmutable (aunque el objeto apuntado puede mutar), y `var` tiene ámbito de función con hoisting.\n\nEl motor V8 asigna el tipo dinámicamente en runtime: JavaScript usa tipado dinámico débil.",
    visualComponent: "VariableVisual",
  },
  {
    id: "data-types",
    title: "Tipos de datos",
    emoji: "🎨",
    badgeTech: "Primitivos · Reference Types",
    accentBg: "bg-emerald-500/20",
    accentBorder: "border-emerald-500/40",
    accentText: "text-emerald-400",
    accentBadge:
      "bg-emerald-500/30 text-emerald-300 border border-emerald-500/30",
    accentActive: "bg-emerald-600/30 border-emerald-500/60",
    accentHighlight: "bg-emerald-600",
    textPlain:
      'Los datos no son todos iguales. Un número no es lo mismo que un texto, y un sí/no es distinto a una lista. Cada "tipo" de dato tiene sus propias reglas sobre qué puedes hacer con él.\n\nEs como saber si tienes en la mano una pelota o un cuchillo: según el tipo, sabes con qué cuidado manejarlo y para qué sirve.',
    textTech:
      'JavaScript tiene 7 tipos primitivos: `number`, `string`, `boolean`, `null`, `undefined`, `symbol` y `bigint`. Los tipos de referencia (object, array, function) viven en el heap y se acceden por referencia, no por valor — lo que explica comportamientos "extraños" al copiarlos.\n\n`typeof` devuelve el tipo en runtime, con la famosa excepción: `typeof null === "object"`.',
    visualComponent: "DataTypesVisual",
  },
  {
    id: "conditionals",
    title: "Condicionales",
    emoji: "🔀",
    badgeTech: "if · else · switch",
    accentBg: "bg-yellow-500/20",
    accentBorder: "border-yellow-500/40",
    accentText: "text-yellow-400",
    accentBadge: "bg-yellow-500/30 text-yellow-300 border border-yellow-500/30",
    accentActive: "bg-yellow-600/30 border-yellow-500/60",
    accentHighlight: "bg-yellow-500",
    textPlain:
      'Un condicional es una bifurcación en el camino. Tu programa llega a un punto y decide: "¿es esto verdad? Si sí, hago esto; si no, hago lo otro."\n\nComo un semáforo: verde = sigues, rojo = paras. Sin condicionales, un programa haría siempre lo mismo sin importar lo que ocurra.',
    textTech:
      "Las estructuras condicionales evalúan una expresión booleana y alteran el flujo de ejecución. `if/else` gestiona ramas binarias; `else if` encadena múltiples condiciones; `switch` compara por igualdad estricta.\n\nEl operador ternario `condition ? a : b` colapsa un if/else a una línea. El short-circuit con `&&` / `||` permite evaluación condicional compacta.",
    visualComponent: "ConditionalsVisual",
  },
  {
    id: "loops",
    title: "Bucles",
    emoji: "🔄",
    badgeTech: "for · while · forEach",
    accentBg: "bg-purple-500/20",
    accentBorder: "border-purple-500/40",
    accentText: "text-purple-400",
    accentBadge: "bg-purple-500/30 text-purple-300 border border-purple-500/30",
    accentActive: "bg-purple-600/30 border-purple-500/60",
    accentHighlight: "bg-purple-600",
    textPlain:
      'Un bucle es decirle al ordenador: "repite esto N veces". Como cuando lavas los platos: coges uno, lo lavas, lo pones a secar. Y así con cada plato hasta que no queda ninguno.\n\nSin bucles, tendrías que copiar el mismo código una vez por cada plato. Con bucles, lo escribes una vez y él solo cuenta.',
    textTech:
      "Los bucles son estructuras de control iterativas. `for` es determinista (número de iteraciones conocido de antemano), `while` es indeterminista (itera mientras la condición sea truthy), y `do...while` garantiza al menos una ejecución.\n\nPara arrays se prefiere `forEach`, `map` o `for...of` por ser más expresivos y componibles con programación funcional.",
    visualComponent: "LoopsVisual",
  },
  {
    id: "functions",
    title: "Funciones",
    emoji: "⚙️",
    badgeTech: "function · parámetros · return",
    accentBg: "bg-orange-500/20",
    accentBorder: "border-orange-500/40",
    accentText: "text-orange-400",
    accentBadge: "bg-orange-500/30 text-orange-300 border border-orange-500/30",
    accentActive: "bg-orange-600/30 border-orange-500/60",
    accentHighlight: "bg-orange-600",
    textPlain:
      "Una función es una máquina: le metes algo por la izquierda (parámetros), hace su trabajo interno, y te devuelve algo por la derecha (resultado). La gracia está en que defines la receta una sola vez y la usas todas las veces que quieras, sin repetir código.",
    textTech:
      "Una función es un bloque de código encapsulado con su propio scope léxico. Recibe parámetros y puede devolver un valor con `return`. En JavaScript las funciones son ciudadanos de primera clase: se pasan como argumentos (callbacks), se almacenan en variables y se devuelven desde otras funciones (higher-order functions).\n\nLas arrow functions `() => {}` capturan el `this` del scope léxico externo.",
    visualComponent: "FunctionsVisual",
  },
  {
    id: "arrays",
    title: "Arrays",
    emoji: "📋",
    badgeTech: "Array · índices · métodos",
    accentBg: "bg-cyan-500/20",
    accentBorder: "border-cyan-500/40",
    accentText: "text-cyan-400",
    accentBadge: "bg-cyan-500/30 text-cyan-300 border border-cyan-500/30",
    accentActive: "bg-cyan-600/30 border-cyan-500/60",
    accentHighlight: "bg-cyan-600",
    textPlain:
      "Un array es una lista ordenada. Imagina una estantería con huecos numerados: el 0, el 1, el 2… En cada hueco puedes guardar lo que quieras. Puedes añadir cosas al final, quitar la primera, buscar en un hueco concreto.\n\nEs la estructura de datos que más vas a usar en tu vida como programador.",
    textTech:
      "Un array es una colección dinámica indexada (base 0) que implementa la interfaz iterable. Internamente es un objeto especial con la propiedad `length` autogestionada.\n\nLos métodos mutables (`push`, `pop`, `splice`) modifican el array original; los inmutables (`map`, `filter`, `reduce`) devuelven uno nuevo sin tocar el original. El spread `[...arr]` crea una copia superficial.",
    visualComponent: "ArraysVisual",
  },
  {
    id: "objects",
    title: "Objetos",
    emoji: "🗂️",
    badgeTech: "Object · clave : valor",
    accentBg: "bg-pink-500/20",
    accentBorder: "border-pink-500/40",
    accentText: "text-pink-400",
    accentBadge: "bg-pink-500/30 text-pink-300 border border-pink-500/30",
    accentActive: "bg-pink-600/30 border-pink-500/60",
    accentHighlight: "bg-pink-600",
    textPlain:
      'Un objeto es como un formulario: tiene campos (nombre, edad, ciudad) y cada campo tiene un valor. En vez de tener mil variables sueltas sin relación, las agrupas todas bajo una misma entidad. Un "persona" tiene nombre, edad y email — todo junto y ordenado.',
    textTech:
      'Un objeto es una colección de pares clave-valor donde las claves son strings (o símbolos) y los valores pueden ser de cualquier tipo, incluyendo funciones (métodos). Se accede con notación de punto `obj.key` o corchetes `obj["key"]`.\n\nToda la herencia en JavaScript está basada en prototipos. `Object.keys()`, `Object.entries()` y la desestructuración `const { a, b } = obj` son patrones idiomáticos del lenguaje.',
    visualComponent: "ObjectsVisual",
  },
];
