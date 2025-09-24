// Tipos y estructuras de datos para el sistema de presupuesto operativo

// Partidas presupuestarias con valores base editables
export const PARTIDAS_PRESUPUESTARIAS = [
  {
    codigo: "60311",
    nombre: "MATERIALES PARA FUNCIONAMIENTO",
    articulos: [], // Se llenará automáticamente con todos los materiales del catálogo
    valoresBase: {
      ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, 
      jul: 0, ago: 0, set: 0, oct: 0, nov: 0, dic: 0
    }
  },
  {
    codigo: "63721", 
    nombre: "PUBLICACIONES E IMPRESIONES",
    articulos: [],
    valoresBase: {
      ene: 0, feb: 0, mar: 600, abr: 0, may: 0, jun: 0, 
      jul: 0, ago: 600, set: 0, oct: 0, nov: 0, dic: 0
    }
  },
  {
    codigo: "65311",
    nombre: "SUSCRIPCIONES Y PUBLICACIONES", 
    articulos: [],
    valoresBase: {
      ene: 0, feb: 0, mar: 3300, abr: 0, may: 0, jun: 0, 
      jul: 0, ago: 3300, set: 0, oct: 0, nov: 0, dic: 0
    }
  },
  {
    codigo: "63815",
    nombre: "SERVICIOS DE FORM. JUV. Y PRACT. PRE-PROFESIONALES",
    articulos: [],
    valoresBase: {
      ene: 0, feb: 0, mar: 1025, abr: 2050, may: 2050, jun: 2050, 
      jul: 1025, ago: 1025, set: 2050, oct: 2050, nov: 2050, dic: 1025
    }
  }
];

// Función para obtener artículos sin asignar a partidas - Ya no necesaria
export const getArticulosSinAsignar = (articulosPresupuesto) => {
  // Todos los artículos van automáticamente a "MATERIALES PARA FUNCIONAMIENTO"
  return [];
};

// Estructura para el resumen por partidas combinando valores base y artículos
export const createPartidaResumen = (partida, articulosPresupuesto, valoresEditados = null) => {
  // Para la partida de materiales (60311), incluir TODOS los artículos del presupuesto
  // Para las otras partidas, no incluir ningún artículo (solo valores base)
  const articulosDePartida = partida.codigo === "60311" 
    ? articulosPresupuesto  // Todos los artículos van a materiales
    : [];  // Las otras partidas solo tienen valores base
  
  const totalMarzoArticulos = articulosDePartida.reduce((sum, art) => sum + art.totales.marzo, 0);
  const totalAgostoArticulos = articulosDePartida.reduce((sum, art) => sum + art.totales.agosto, 0);
  
  // Usar valores editados si existen, sino usar valores base
  const valores = valoresEditados || partida.valoresBase;
  
  // Combinar valores base con cálculos de artículos para marzo y agosto
  const mesesFinales = { ...valores };
  mesesFinales.mar = valores.mar + totalMarzoArticulos;
  mesesFinales.ago = valores.ago + totalAgostoArticulos;
  
  const total = Object.values(mesesFinales).reduce((sum, val) => sum + val, 0);
                              
  return {
    codigo: partida.codigo,
    nombre: partida.nombre,
    meses: mesesFinales,
    valoresBase: valores, // Mantener referencia a valores editables
    total: total
  };
};