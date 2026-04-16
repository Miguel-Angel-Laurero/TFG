import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const OUTPUT_PATH = resolve(
  "d:/FP/2º DAW/TFG/ludoScript/public/quizQuestions.json",
);

const CATEGORY_BANK = [
  {
    category: "fundamentos-js",
    concepts: [
      {
        topic: "fundamentos-basicos",
        title: "una variable en JavaScript",
        correct:
          "Es un contenedor con nombre que almacena un valor y puede usarse o modificarse durante la ejecucion",
        distractors: [
          "Es una funcion sin argumentos que ejecuta codigo automaticamente al llamarla",
          "Es un archivo especial que el navegador lee solo una vez al cargar la pagina",
          "Es una instruccion que detiene temporalmente la ejecucion del programa",
        ],
        explanation:
          "Las variables son la unidad basica de almacenamiento. Con let y const las declaramos en JS moderno.",
      },
      {
        topic: "fundamentos-basicos",
        title: "como declarar una variable con let",
        correct:
          "Escribiendo la palabra clave let seguida del nombre y opcionalmente un valor con el operador =",
        distractors: [
          "Usando la palabra clave new seguida del nombre de la variable",
          "Colocando un simbolo # delante del nombre para hacerla local al bloque",
          "Llamando a la funcion declare() con el nombre como argumento",
        ],
        explanation:
          "La sintaxis basica es: let nombre = valor; El valor inicial es opcional al declarar.",
      },
      {
        topic: "fundamentos-basicos",
        title: "para que sirve console.log",
        correct:
          "Para mostrar un valor o mensaje en la consola del navegador o de Node.js durante el desarrollo",
        distractors: [
          "Para guardar datos de forma permanente en el servidor de la aplicacion",
          "Para enviar un mensaje al usuario final dentro de un cuadro emergente",
          "Para detener la ejecucion del programa y registrar un error critico",
        ],
        explanation:
          "console.log es la herramienta basica de depuracion. Imprime cualquier valor para inspeccionarlo.",
      },
      {
        topic: "fundamentos-basicos",
        title: "la diferencia principal entre un number y un string",
        correct:
          "number es un valor numerico con el que se puede operar matematicamente; string es texto entre comillas",
        distractors: [
          "Son el mismo tipo porque JavaScript convierte uno en otro de forma completamente transparente",
          "string almacena numeros grandes y number almacena numeros pequenos",
          "number va entre comillas dobles y string va sin comillas",
        ],
        explanation:
          "Sumar 1 + 1 da 2 (number). Concatenar '1' + '1' da '11' (string). El tipo importa para operar.",
      },
      {
        topic: "tipos-coercion",
        title: "la diferencia entre == y ===",
        correct:
          "=== compara valor y tipo sin coercion, == puede convertir tipos antes de comparar",
        distractors: [
          "== y === son equivalentes en JavaScript moderno",
          "== es mas estricto que === porque no convierte tipos",
          "=== solo se usa con numeros y == con strings",
        ],
        explanation:
          "=== evita conversiones implicitas. Es la comparacion recomendada para no mezclar tipos sin querer.",
      },
      {
        topic: "tipos-coercion",
        title: "el resultado de typeof null",
        correct:
          "typeof null devuelve 'object' por un comportamiento historico del lenguaje",
        distractors: [
          "typeof null devuelve 'null' porque null es su propio tipo textual",
          "typeof null devuelve 'undefined' porque no tiene valor",
          "typeof null lanza un error porque null no tiene propiedades",
        ],
        explanation:
          "typeof null devuelve 'object' por compatibilidad historica. Para comprobar null se usa valor === null.",
      },
      {
        topic: "tipos-coercion",
        title: "los valores falsy en JavaScript",
        correct:
          "Valores como false, 0, '', null, undefined y NaN se consideran falsy",
        distractors: [
          "Cualquier string no vacio y cualquier array son falsy",
          "Solo false y null son falsy; el resto son truthy",
          "NaN es truthy porque es un valor numerico especial",
        ],
        explanation:
          "Falsy significa que al convertir a booleano el resultado es false. Muchos bugs vienen de olvidar este detalle.",
      },
      {
        topic: "sintaxis-es6",
        title: "el operador spread en arrays",
        correct:
          "Spread crea un nuevo array expandiendo los elementos del iterable",
        distractors: [
          "Spread modifica siempre el array original para ahorrar memoria",
          "Spread solo funciona con strings, no con arrays",
          "Spread convierte automaticamente todos los elementos a string",
        ],
        explanation:
          "Con [...a, nuevo] obtienes una copia con elementos adicionales. No muta el array original.",
      },
      {
        topic: "sintaxis-es6",
        title: "las template literals",
        correct:
          "Permiten interpolar expresiones con ${...} y escribir strings multilinea con backticks",
        distractors: [
          "Sustituyen a JSON y solo sirven para serializar objetos",
          "Solo aceptan variables simples, no expresiones",
          "Obligan a escapar siempre las comillas dobles y simples",
        ],
        explanation:
          "Las template literals mejoran la legibilidad al construir mensajes y fragmentos de texto dinamicos.",
      },
      {
        topic: "sintaxis-es6",
        title: "lo que garantiza const",
        correct:
          "Impide reasignar la variable, pero no vuelve inmutable el objeto almacenado",
        distractors: [
          "Impide cambiar tanto la referencia como las propiedades internas del objeto",
          "Se puede reasignar dentro de un if porque const tiene scope especial",
          "Solo sirve para declarar numeros y strings",
        ],
        explanation:
          "const protege la referencia. Si quieres inmutabilidad profunda necesitas otras tecnicas o convenciones.",
      },
      {
        topic: "operadores-condicionales",
        title: "el operador ternario",
        correct: "Permite elegir entre dos expresiones segun una condicion",
        distractors: [
          "Sirve para declarar tres variables en una sola linea",
          "Solo puede usarse dentro de un bucle for",
          "Es equivalente a un switch con tres casos obligatorios",
        ],
        explanation:
          "condicion ? valorSiTrue : valorSiFalse es util para decisiones breves y expresivas.",
      },
      {
        topic: "operadores-condicionales",
        title: "el short circuit con ||",
        correct:
          "Devuelve el primer valor truthy o, si no existe, el ultimo valor evaluado",
        distractors: [
          "Devuelve siempre true o false, nunca otro valor",
          "Ejecuta siempre ambas expresiones antes de decidir",
          "Convierte todos los operandos a numero antes de compararlos",
        ],
        explanation:
          "|| se usa mucho para defaults, aunque para null o undefined suele ser mas preciso usar ??.",
      },
      {
        topic: "operadores-condicionales",
        title: "los parametros por defecto",
        correct: "Solo se aplican cuando el argumento recibido es undefined",
        distractors: [
          "Tambien se aplican si el argumento es null, 0 o ''",
          "No funcionan con funciones flecha",
          "Sobrescriben siempre cualquier argumento enviado",
        ],
        explanation:
          "null no activa el valor por defecto. Ese matiz es importante al disenar APIs y helpers.",
      },
      {
        topic: "operadores-condicionales",
        title: "el operador nullish coalescing ??",
        correct:
          "Usa el valor de la derecha solo cuando la izquierda es null o undefined",
        distractors: [
          "Actua igual que || y trata 0 y '' como ausentes",
          "Solo se puede usar con booleanos",
          "Convierte la expresion en string si el valor es null",
        ],
        explanation:
          "?? evita perder valores validos como 0 o ''. Es preferible a || cuando quieres distinguir ausencia real.",
      },
    ],
  },
  {
    category: "arrays-colecciones",
    concepts: [
      {
        topic: "arrays-basicos",
        title: "que es un array",
        correct:
          "Es una lista ordenada de elementos accesibles por su posicion numerica empezando por 0",
        distractors: [
          "Es un tipo especial de objeto que solo puede almacenar texto",
          "Es una funcion que genera una secuencia de numeros automaticamente",
          "Es una variable que solo puede guardar un unico valor a la vez",
        ],
        explanation:
          "Los arrays agrupan varios valores bajo un mismo nombre y permiten acceder a ellos por indice.",
      },
      {
        topic: "arrays-basicos",
        title: "como acceder al primer elemento de un array",
        correct:
          "Usando el indice 0 entre corchetes: array[0], porque los indices empiezan en cero",
        distractors: [
          "Usando el indice 1 entre corchetes porque los arrays empiezan a contar en 1",
          "Llamando al metodo array.first() que devuelve el primer elemento",
          "Usando la propiedad array.start para obtener el primer elemento",
        ],
        explanation:
          "Los indices de un array empiezan en 0. El primero es array[0] y el ultimo es array[array.length - 1].",
      },
      {
        topic: "arrays-basicos",
        title: "para que sirve la propiedad length de un array",
        correct:
          "Devuelve el numero total de elementos que contiene el array en ese momento",
        distractors: [
          "Devuelve el indice del ultimo elemento que fue insertado en el array",
          "Limita cuantos elementos puede tener el array como maximo",
          "Comprueba si el array esta vacio y devuelve true o false",
        ],
        explanation:
          "array.length es util para saber cuantos elementos hay y para iterar con bucles sin pasarse.",
      },
      {
        topic: "arrays-basicos",
        title: "como anadir un elemento al final de un array con push",
        correct:
          "Llamando a array.push(nuevoElemento), que muta el array original y devuelve la nueva longitud",
        distractors: [
          "Usando array.add(nuevoElemento), que crea un array nuevo sin modificar el original",
          "Asignando directamente array.last = nuevoElemento para colocarlo al final",
          "Usando array.append(nuevoElemento) como en otros lenguajes de programacion",
        ],
        explanation:
          "push muta el array original. Si necesitas inmutabilidad, usa [...array, nuevoElemento] con spread.",
      },
      {
        topic: "arrays-metodos",
        title: "el metodo map",
        correct:
          "Devuelve un nuevo array transformando cada elemento sin mutar el original",
        distractors: [
          "Filtra elementos y acorta el array segun una condicion",
          "Busca el primer elemento que cumpla una condicion",
          "Ordena automaticamente el array de menor a mayor",
        ],
        explanation:
          "map es ideal cuando quieres mantener el mismo numero de elementos pero transformados.",
      },
      {
        topic: "arrays-metodos",
        title: "el metodo filter",
        correct:
          "Devuelve un nuevo array con los elementos que cumplen la condicion",
        distractors: [
          "Devuelve un booleano indicando si todos cumplen la condicion",
          "Devuelve solo el primer elemento que cumple la condicion",
          "Reduce el array a un unico valor acumulado",
        ],
        explanation:
          "filter no modifica el array original. Crea una coleccion nueva con un subconjunto.",
      },
      {
        topic: "arrays-metodos",
        title: "el metodo find",
        correct:
          "Devuelve el primer elemento que cumple la condicion o undefined",
        distractors: [
          "Devuelve todos los elementos que cumplen la condicion",
          "Devuelve el indice y el valor en una tupla",
          "Siempre devuelve true o false",
        ],
        explanation:
          "Si necesitas todos los elementos usa filter. find se queda con la primera coincidencia.",
      },
      {
        topic: "arrays-metodos",
        title: "el metodo reduce",
        correct:
          "Permite acumular los elementos de un array en un unico resultado",
        distractors: [
          "Solo sirve para reducir el tamano del array borrando elementos",
          "Se usa unicamente para arrays numericos",
          "Devuelve siempre otro array del mismo tamano",
        ],
        explanation:
          "reduce puede producir numeros, objetos, arrays u otras estructuras segun el acumulador.",
      },
      {
        topic: "inmutabilidad",
        title: "la diferencia entre slice y splice",
        correct:
          "slice copia una porcion sin mutar; splice inserta o elimina mutando el array",
        distractors: [
          "Ambos copian una porcion y ninguno muta el array",
          "splice solo se usa para strings y slice solo para arrays",
          "slice muta y splice nunca muta",
        ],
        explanation:
          "Confundir slice y splice es un error clasico. La letra p de splice ayuda a recordar que toca el original.",
      },
      {
        topic: "inmutabilidad",
        title: "los metodos push y pop",
        correct:
          "Mutan el array original al anadir o quitar elementos del final",
        distractors: [
          "Siempre devuelven un array nuevo sin tocar el original",
          "Solo funcionan en arrays vacios",
          "Son equivalentes a shift y unshift en cualquier posicion",
        ],
        explanation:
          "push y pop son mutables. Si buscas inmutabilidad, combina spread o slice con nuevas referencias.",
      },
      {
        topic: "iteracion",
        title: "la diferencia entre some y every",
        correct:
          "some comprueba si al menos uno cumple; every comprueba si todos cumplen",
        distractors: [
          "some devuelve un array y every un booleano",
          "some y every hacen exactamente lo mismo con nombres distintos",
          "every encuentra el primer elemento y some el ultimo",
        ],
        explanation:
          "Ambos devuelven booleanos. Cambia el criterio: existencia frente a cumplimiento total.",
      },
      {
        topic: "iteracion",
        title: "el valor de retorno de forEach",
        correct:
          "forEach devuelve undefined porque se usa para efectos laterales, no para transformar",
        distractors: [
          "forEach devuelve un array nuevo con los resultados del callback",
          "forEach devuelve el numero de iteraciones realizadas",
          "forEach devuelve el ultimo elemento visitado",
        ],
        explanation:
          "Si necesitas transformar datos usa map. forEach es para ejecutar acciones por elemento.",
      },
      {
        topic: "iteracion",
        title: "Array.from",
        correct:
          "Crea un array a partir de un iterable o de un objeto array-like",
        distractors: [
          "Solo convierte objetos JSON validos en arrays",
          "Ordena automaticamente los elementos al convertirlos",
          "Solo funciona con arrays ya existentes",
        ],
        explanation:
          "Array.from es util con strings, Sets, NodeLists y estructuras parecidas a arrays.",
      },
      {
        topic: "inmutabilidad",
        title: "el uso de Set para eliminar duplicados",
        correct:
          "new Set(array) conserva valores unicos y luego puede convertirse a array con spread",
        distractors: [
          "Set ordena y elimina duplicados mutando el array original",
          "Set solo funciona con numeros enteros",
          "Set reemplaza siempre a Map porque guarda claves y valores",
        ],
        explanation:
          "Set guarda valores unicos. Para volver a array puedes usar [...new Set(array)].",
      },
    ],
  },
  {
    category: "funciones-scope",
    concepts: [
      {
        topic: "funciones-basicas",
        title: "que es una funcion en JavaScript",
        correct:
          "Es un bloque de codigo reutilizable que se puede invocar cuantas veces se quiera con diferentes datos",
        distractors: [
          "Es un tipo de variable que solo puede almacenar valores numericos",
          "Es una instruccion especial que solo se ejecuta una vez al cargar la pagina",
          "Es una palabra reservada para definir la estructura de un objeto",
        ],
        explanation:
          "Las funciones encapsulan logica reutilizable. Se definen una vez y se pueden llamar muchas veces.",
      },
      {
        topic: "funciones-basicas",
        title: "como se llama a una funcion",
        correct:
          "Escribiendo su nombre seguido de parentesis: nombreFuncion(), con los argumentos dentro si los necesita",
        distractors: [
          "Usando la palabra clave call seguida del nombre de la funcion",
          "Escribiendo solo el nombre sin parentesis para que el motor la ejecute",
          "Usando run(nombreFuncion) para indicar que debe ejecutarse",
        ],
        explanation:
          "Los parentesis son los que ejecutan la funcion. Sin parentesis obtienes solo una referencia a ella.",
      },
      {
        topic: "funciones-basicas",
        title: "para que sirve return en una funcion",
        correct:
          "Para devolver un valor al punto donde se llamo la funcion y terminar su ejecucion en ese momento",
        distractors: [
          "Para imprimir el resultado en la consola automaticamente al terminar",
          "Para repetir la ejecucion de la funcion desde el principio",
          "Para pasar el control a la siguiente funcion definida en el archivo",
        ],
        explanation:
          "Sin return la funcion devuelve undefined. Con return puedes usar el resultado en otras expresiones.",
      },
      {
        topic: "funciones-basicas",
        title: "que es un parametro de una funcion",
        correct:
          "Es una variable local de la funcion que recibe el valor que se le pasa al invocarla",
        distractors: [
          "Es el nombre obligatorio que toda funcion debe tener para poder llamarse",
          "Es el resultado que la funcion calcula y devuelve al terminar",
          "Es una opcion de configuracion que se establece en los ajustes del navegador",
        ],
        explanation:
          "Los parametros actuan como variables locales. Al llamar la funcion les asignas los argumentos.",
      },
      {
        topic: "scope-variables",
        title: "la diferencia entre let y var",
        correct:
          "let tiene scope de bloque; var tiene scope de funcion y se hoistea de forma distinta",
        distractors: [
          "var tiene scope de bloque y let de funcion",
          "let no puede reasignarse y var si",
          "No existe diferencia real entre let y var en ES6",
        ],
        explanation:
          "let y const evitan muchos problemas heredados de var, sobre todo en bloques y bucles.",
      },
      {
        topic: "closures-hoisting",
        title: "el hoisting",
        correct:
          "Es el registro previo de declaraciones antes de ejecutar el codigo",
        distractors: [
          "Es una tecnica para ordenar arrays por referencia",
          "Es la conversion automatica de tipos al comparar valores",
          "Es el cierre automatico de variables fuera de una funcion",
        ],
        explanation:
          "Las declaraciones se procesan antes de la ejecucion. En let y const aparece la zona temporal muerta.",
      },
      {
        topic: "closures-hoisting",
        title: "un closure",
        correct:
          "Es una funcion que conserva acceso a variables de su entorno lexico aunque ese entorno haya terminado",
        distractors: [
          "Es una funcion que solo puede ejecutarse una vez",
          "Es un bloque catch especializado en errores de alcance",
          "Es la clausula final obligatoria de una clase",
        ],
        explanation:
          "Los closures permiten encapsular estado y son la base de muchos patrones en JavaScript.",
      },
      {
        topic: "funciones",
        title: "las funciones flecha y this",
        correct:
          "Las arrow functions no tienen su propio this; capturan el this lexico exterior",
        distractors: [
          "Las arrow functions crean un this nuevo en cada llamada",
          "this siempre apunta al archivo actual dentro de una arrow function",
          "Las arrow functions no pueden usar parametros",
        ],
        explanation:
          "Este comportamiento las hace utiles en callbacks, pero no para metodos que necesitan su propio this.",
      },
      {
        topic: "funciones",
        title: "los parametros rest",
        correct: "Permiten agrupar argumentos sobrantes en un array real",
        distractors: [
          "Convierten automaticamente cualquier parametro en objeto",
          "Solo funcionan si la funcion no recibe argumentos normales",
          "Sirven para pausar la funcion antes del return",
        ],
        explanation:
          "rest usa ...nombre y debe ir al final de la lista de parametros.",
      },
      {
        topic: "funciones",
        title: "una funcion callback",
        correct:
          "Es una funcion que se pasa como argumento para ejecutarla mas tarde o en otro contexto",
        distractors: [
          "Es una funcion que siempre devuelve otra funcion",
          "Es una funcion privada solo visible dentro de una clase",
          "Es un metodo reservado para llamadas HTTP",
        ],
        explanation:
          "Los callbacks aparecen en eventos, temporizadores y muchas APIs asincronas.",
      },
      {
        topic: "scope-variables",
        title: "el scope lexico",
        correct:
          "Depende de donde se declara una funcion o variable en el codigo, no de donde se invoca",
        distractors: [
          "Depende exclusivamente del orden de las llamadas en tiempo de ejecucion",
          "Solo existe en funciones flecha",
          "Es una caracteristica propia de los arrays",
        ],
        explanation:
          "JavaScript usa alcance lexico. El entorno viene definido por la estructura del codigo fuente.",
      },
      {
        topic: "scope-variables",
        title: "la temporal dead zone",
        correct:
          "Es el periodo previo a la declaracion de let o const en el que no puede accederse a la variable",
        distractors: [
          "Es una zona de memoria reservada para variables globales",
          "Es el tiempo maximo antes de que una promise expire",
          "Es un error exclusivo de las funciones tradicionales",
        ],
        explanation:
          "Aunque la variable exista durante el parseo, no puede leerse antes de su declaracion.",
      },
      {
        topic: "funciones",
        title: "usar destructuring en parametros",
        correct:
          "Permite extraer propiedades de un objeto directamente en la firma de la funcion",
        distractors: [
          "Obliga a pasar los argumentos en orden alfabetico",
          "Convierte cualquier objeto en array automaticamente",
          "Solo se puede usar en funciones async",
        ],
        explanation:
          "Es util para parametros con nombre y para dejar claro que propiedades usa la funcion.",
      },
      {
        topic: "funciones",
        title: "una funcion pura",
        correct:
          "Siempre devuelve el mismo resultado para los mismos argumentos y no produce efectos laterales",
        distractors: [
          "Es una funcion que solo acepta tipos primitivos",
          "Es una funcion declarada con function y no con arrow",
          "Es una funcion que no puede llamar a otras funciones",
        ],
        explanation:
          "La pureza facilita pruebas, refactorizacion y razonamiento sobre el comportamiento del codigo.",
      },
    ],
  },
  {
    category: "objetos",
    concepts: [
      {
        topic: "objetos-basicos",
        title: "que es un objeto en JavaScript",
        correct:
          "Es una coleccion de pares clave-valor que agrupa datos y comportamientos relacionados bajo un mismo nombre",
        distractors: [
          "Es un array que solo acepta strings como elementos en lugar de numeros",
          "Es una funcion especial que siempre devuelve otro objeto al llamarla",
          "Es una variable de solo lectura que no puede modificarse una vez creada",
        ],
        explanation:
          "Los objetos son la estructura de datos principal en JS. Casi todo en el lenguaje es un objeto.",
      },
      {
        topic: "objetos-basicos",
        title: "como crear un objeto con la notacion literal",
        correct:
          "Usando llaves con pares clave: valor separados por comas: { nombre: 'Ana', edad: 20 }",
        distractors: [
          "Usando corchetes con los valores separados por comas como si fuera un array",
          "Llamando siempre a new Object() y luego asignando cada propiedad por separado",
          "Usando la palabra clave struct seguida del nombre y las propiedades entre parentesis",
        ],
        explanation:
          "La notacion literal con llaves es la forma mas comun y directa de crear objetos en JavaScript.",
      },
      {
        topic: "objetos-basicos",
        title: "como acceder a una propiedad con la notacion de punto",
        correct:
          "Escribiendo el nombre del objeto seguido de un punto y el nombre de la propiedad: objeto.propiedad",
        distractors: [
          "Usando objeto->propiedad con una flecha, igual que en PHP o C",
          "Llamando a objeto.get('propiedad') para leer el valor de esa clave",
          "Usando objeto[0] con el indice numerico de la propiedad en el objeto",
        ],
        explanation:
          "La notacion de punto es la mas legible. Usa corchetes cuando la clave es dinamica o contiene caracteres especiales.",
      },
      {
        topic: "objetos",
        title: "Object.keys",
        correct:
          "Devuelve un array con las claves propias y enumerables del objeto",
        distractors: [
          "Devuelve un objeto nuevo con las claves ordenadas",
          "Devuelve solo los valores numericos del objeto",
          "Devuelve pares [clave, valor] en lugar de claves",
        ],
        explanation:
          "Para obtener valores usa Object.values y para pares usa Object.entries.",
      },
      {
        topic: "objetos",
        title: "el acceso con punto y con corchetes",
        correct:
          "Los corchetes permiten usar claves dinamicas; el punto requiere un nombre literal valido",
        distractors: [
          "Ambos solo sirven con arrays, no con objetos",
          "El punto permite claves dinamicas y los corchetes no",
          "Los corchetes convierten siempre el valor en string",
        ],
        explanation:
          "obj[prop] es imprescindible cuando la clave viene en una variable o contiene caracteres especiales.",
      },
      {
        topic: "desestructuracion",
        title: "la desestructuracion de objetos",
        correct:
          "Permite extraer propiedades en variables con una sintaxis declarativa",
        distractors: [
          "Borra del objeto original las propiedades extraidas",
          "Solo funciona en arrays, no en objetos",
          "Convierte el objeto a JSON automaticamente",
        ],
        explanation:
          "Puedes incluso renombrar propiedades y asignar valores por defecto al desestructurar.",
      },
      {
        topic: "desestructuracion",
        title: "el spread en objetos",
        correct:
          "Crea una copia superficial del objeto y permite sobrescribir propiedades",
        distractors: [
          "Realiza una copia profunda de cualquier nivel anidado",
          "Modifica siempre el objeto original antes de devolverlo",
          "Solo puede usarse si el objeto tiene menos de 10 propiedades",
        ],
        explanation:
          "La copia es superficial. Si hay objetos anidados, sus referencias siguen compartiendose.",
      },
      {
        topic: "clases-prototipos",
        title: "la relacion entre class y prototipos",
        correct:
          "class es azucar sintactico sobre el sistema de prototipos de JavaScript",
        distractors: [
          "class crea un modelo totalmente distinto y separado de los prototipos",
          "Los prototipos dejaron de existir al aparecer class",
          "class solo puede heredar de arrays y strings",
        ],
        explanation:
          "Detras de class sigue estando la cadena de prototipos. La sintaxis solo es mas comoda.",
      },
      {
        topic: "clases-prototipos",
        title: "Object.assign",
        correct:
          "Copia propiedades enumerables de uno o varios objetos fuente a un objeto destino",
        distractors: [
          "Clona funciones con su scope lexico completo",
          "Copia recursivamente cualquier objeto anidado",
          "Solo sirve para comparar objetos por referencia",
        ],
        explanation:
          "Tambien es una copia superficial. Se usa mucho para merges simples de configuracion.",
      },
      {
        topic: "clases-prototipos",
        title: "la cadena de prototipos",
        correct:
          "Cuando una propiedad no existe en el objeto actual, JavaScript la busca en su prototipo",
        distractors: [
          "Solo se usa para arrays, no para objetos normales",
          "Se recorre de abajo arriba solo en clases abstractas",
          "Impide redefinir propiedades en objetos hijos",
        ],
        explanation:
          "La herencia prototipica permite compartir comportamiento entre instancias sin duplicar metodos.",
      },
      {
        topic: "objetos",
        title: "JSON.stringify y JSON.parse",
        correct:
          "Sirven para serializar y deserializar datos JSON, pero no preservan funciones ni ciertas estructuras especiales",
        distractors: [
          "Permiten clonar cualquier objeto de forma profunda sin limitaciones",
          "Guardan referencias y metodos exactamente igual que el objeto original",
          "Solo funcionan con arrays y no con objetos",
        ],
        explanation:
          "Es util para datos simples, pero no para funciones, Map, Set o fechas sin tratamiento adicional.",
      },
      {
        topic: "objetos",
        title: "optional chaining",
        correct:
          "Permite acceder a propiedades o llamar metodos de forma segura cuando un valor puede ser null o undefined",
        distractors: [
          "Convierte automaticamente el valor ausente en un objeto vacio",
          "Reemplaza siempre a ?? para asignar valores por defecto",
          "Solo funciona dentro de clases",
        ],
        explanation:
          "obj?.prop evita errores de acceso a propiedades sobre valores nulos o indefinidos.",
      },
      {
        topic: "objetos",
        title: "Object.entries",
        correct:
          "Devuelve pares [clave, valor] de las propiedades propias y enumerables",
        distractors: [
          "Devuelve un objeto nuevo con los valores invertidos",
          "Devuelve solo las claves del objeto, no los valores",
          "Convierte el objeto en un Set",
        ],
        explanation:
          "Es util para iterar con for...of, transformar objetos o reconstruirlos despues.",
      },
    ],
  },
  {
    category: "asincronia",
    concepts: [
      {
        topic: "asincronia-basica",
        title: "que significa que una operacion es asincrona",
        correct:
          "Que no bloquea el hilo principal y su resultado llega en el futuro mientras el resto del codigo sigue ejecutandose",
        distractors: [
          "Que se ejecuta en un orden aleatorio diferente cada vez que se invoca",
          "Que solo puede ejecutarse una vez y luego se elimina automaticamente de memoria",
          "Que ocurre exactamente al mismo tiempo que todas las demas operaciones del programa",
        ],
        explanation:
          "Fetch, setTimeout y accesos a BD son asincronos. El programa no se congela esperando el resultado.",
      },
      {
        topic: "asincronia-basica",
        title: "para que sirve setTimeout",
        correct:
          "Para ejecutar una funcion callback despues de un tiempo minimo indicado en milisegundos",
        distractors: [
          "Para medir cuanto tarda en ejecutarse un bloque de codigo y mostrar el resultado",
          "Para repetir una funcion exactamente cada X milisegundos de forma continua",
          "Para pausar completamente el programa durante el tiempo indicado",
        ],
        explanation:
          "setTimeout(fn, 1000) ejecuta fn al menos despues de 1 segundo. setInterval repite en bucle.",
      },
      {
        topic: "asincronia-basica",
        title: "que hace la palabra clave async en una funcion",
        correct:
          "Indica que la funcion es asincrona y garantiza que siempre devolvera una Promise",
        distractors: [
          "Hace que la funcion se ejecute en un hilo paralelo separado del motor de JavaScript",
          "Convierte la funcion en una clase especial gestionada por el motor del navegador",
          "Obliga a la funcion a devolver un array en lugar de un valor simple",
        ],
        explanation:
          "Una funcion async siempre retorna una Promise. Dentro de ella puedes usar await para esperar.",
      },
      {
        topic: "promesas",
        title: "los estados de una Promise",
        correct: "Una Promise puede estar pending, fulfilled o rejected",
        distractors: [
          "Solo puede estar en true o false",
          "Sus estados son created, running y finished",
          "Una Promise no tiene estados; siempre resuelve al instante",
        ],
        explanation:
          "Hasta que no se resuelve o rechaza, la Promise permanece pendiente.",
      },
      {
        topic: "async-await",
        title: "lo que devuelve una funcion async",
        correct:
          "Siempre devuelve una Promise, incluso si retornas un valor simple",
        distractors: [
          "Devuelve undefined salvo que uses await",
          "Devuelve un callback interno creado por el motor",
          "Solo devuelve Promise si dentro hay una llamada fetch",
        ],
        explanation:
          "async envuelve automaticamente el valor de retorno en una Promise resuelta.",
      },
      {
        topic: "async-await",
        title: "el efecto de await",
        correct:
          "Pausa la ejecucion de la funcion async actual hasta que la Promise se resuelve o rechaza",
        distractors: [
          "Bloquea todo el hilo de JavaScript y congela la interfaz",
          "Solo funciona con setTimeout, no con Promises",
          "Convierte la Promise en un callback",
        ],
        explanation:
          "await no bloquea todo el programa; solo suspende esa funcion async.",
      },
      {
        topic: "promesas",
        title: "Promise.all",
        correct:
          "Resuelve cuando todas las Promises resuelven y rechaza en cuanto una falla",
        distractors: [
          "Ejecuta las Promises una por una en secuencia obligatoria",
          "Ignora los rechazos y devuelve solo las resueltas",
          "Solo acepta dos Promises como maximo",
        ],
        explanation:
          "Promise.all es muy util para tareas paralelas, pero conviene recordar su comportamiento fail-fast.",
      },
      {
        topic: "event-loop-fetch",
        title: "setTimeout y la cola de tareas",
        correct:
          "El callback de setTimeout entra en la cola y solo se ejecuta cuando el call stack queda libre",
        distractors: [
          "Interrumpe inmediatamente el codigo actual en cuanto expira el tiempo",
          "Siempre se ejecuta exactamente al milisegundo indicado",
          "Se procesa antes que las microtareas de Promise",
        ],
        explanation:
          "El tiempo indicado es un minimo, no una garantia exacta de ejecucion inmediata.",
      },
      {
        topic: "event-loop-fetch",
        title: "fetch y los errores HTTP",
        correct:
          "fetch rechaza por errores de red; respuestas como 404 o 500 siguen resolviendo y deben comprobarse con response.ok",
        distractors: [
          "fetch rechaza automaticamente cualquier 4xx o 5xx",
          "fetch nunca puede fallar porque el navegador reintenta siempre",
          "fetch devuelve directamente el JSON parseado",
        ],
        explanation:
          "Con fetch hay que comprobar el estado de la respuesta. Un 404 no entra en catch por si solo.",
      },
      {
        topic: "event-loop-fetch",
        title: "microtareas y promesas",
        correct:
          "Los callbacks de Promise.then se ejecutan en la cola de microtareas y suelen ir antes que setTimeout",
        distractors: [
          "Siempre van despues de cualquier setTimeout",
          "Se ejecutan en un hilo separado del navegador",
          "Solo existen cuando usas async/await",
        ],
        explanation:
          "Entender microtareas y macrotareas ayuda a explicar el orden real de ejecucion en JS.",
      },
      {
        topic: "async-await",
        title: "try/catch con await",
        correct:
          "Permite capturar de forma natural los rechazos de Promises dentro de funciones async",
        distractors: [
          "Solo captura errores de sintaxis, no rechazos de Promise",
          "Obliga a usar Promise.all internamente",
          "Deja de funcionar si la funcion retorna un valor simple",
        ],
        explanation:
          "Con await, el manejo de errores puede leerse casi igual que el codigo sincrono.",
      },
      {
        topic: "promesas",
        title: "Promise.prototype.finally",
        correct:
          "finally se ejecuta tanto si la Promise se resuelve como si se rechaza",
        distractors: [
          "finally solo se ejecuta en caso de exito",
          "finally reemplaza siempre el valor resuelto por undefined",
          "finally solo existe en fetch y no en Promises normales",
        ],
        explanation:
          "finally es util para limpieza comun, como detener spinners o liberar recursos.",
      },
      {
        topic: "async-await",
        title: "await secuencial frente a Promise.all",
        correct:
          "Si haces await uno a uno, las tareas se esperan en serie; Promise.all permite esperar varias en paralelo",
        distractors: [
          "await uno a uno y Promise.all siempre tardan lo mismo",
          "Promise.all obliga a que cada tarea use el mismo endpoint",
          "await en serie es mas paralelo que Promise.all",
        ],
        explanation:
          "La diferencia de rendimiento puede ser notable cuando las tareas no dependen entre si.",
      },
    ],
  },
];

const VARIANTS = [
  {
    // Nivel 1 — Reconocimiento directo: respuesta correcta clara, distractores obvios
    difficulty: 1,
    rotate: 0,
    stem: (title) => `Que afirmacion describe mejor ${title}?`,
  },
  {
    // Nivel 2 — Comprension basica: todos los distractores son plausibles pero uno es claramente mejor
    difficulty: 2,
    rotate: 1,
    stem: (title) =>
      `Si repasas ${title}, con que idea basica deberias quedarte?`,
  },
  {
    // Nivel 3 — Aplicacion en contexto: requiere entender el concepto, no solo recordarlo
    difficulty: 3,
    rotate: 2,
    stem: (title) =>
      `En una revision de codigo, que conviene recordar sobre ${title}?`,
  },
  {
    // Nivel 4 — Precision tecnica: distractores tecnicamente cercanos, requiere conocimiento solido
    difficulty: 4,
    rotate: 3,
    stem: (title) =>
      `Para evitar errores frecuentes, que afirmacion sobre ${title} es la mas precisa?`,
  },
  {
    // Nivel 5 — Dominio experto: matices del spec, casos edge, formulacion mas tecnica
    difficulty: 5,
    rotate: 1,
    stem: (title) =>
      `Cual es la opcion tecnica mas precisa cuando se habla de ${title}?`,
  },
];

function rotateOptions(options, positions) {
  const normalized = positions % options.length;
  return options.slice(normalized).concat(options.slice(0, normalized));
}

function buildQuestion(id, category, concept, variant) {
  const baseOptions = [concept.correct, ...concept.distractors];
  const options = rotateOptions(baseOptions, variant.rotate);
  return {
    id,
    category,
    topic: concept.topic,
    difficulty: variant.difficulty,
    question: variant.stem(concept.title),
    options,
    correct: options.indexOf(concept.correct),
    explanation: concept.explanation,
  };
}

function generateBank() {
  const questions = [];
  let id = 1;

  for (const block of CATEGORY_BANK) {
    for (const concept of block.concepts) {
      for (const variant of VARIANTS) {
        questions.push(buildQuestion(id, block.category, concept, variant));
        id += 1;
      }
    }
  }

  return questions;
}

const questions = generateBank();
const categoryCounts = questions.reduce((acc, question) => {
  acc[question.category] = (acc[question.category] ?? 0) + 1;
  return acc;
}, {});

for (const [category, count] of Object.entries(categoryCounts)) {
  // 5 variantes x ~10 conceptos base = 50 minimo. Con conceptos beginner deberia superar 60.
  if (count < 50) {
    throw new Error(
      `La categoria ${category} tiene menos de 50 preguntas (tiene ${count}).`,
    );
  }
}

mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log(`Generadas ${questions.length} preguntas en ${OUTPUT_PATH}`);
