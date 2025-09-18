# Sistema de Presupuesto - Biblioteca Virtual de Ingeniería

Sistema web moderno para la gestión de presupuestos operativos de la Biblioteca Virtual de Ingeniería de la Universidad Ricardo Palma.

## Características

- **Gestión de catálogo de materiales** - CRUD completo
- **Creación de presupuestos** - Agregar artículos con cantidades por mes
- **Partidas presupuestarias** - Organización automática por códigos ERP
- **Exportación a Excel** - Informes profesionales con múltiples hojas
- **Persistencia completa** - Todos los datos se guardan en tiempo real
- **Interfaz moderna** - Diseño responsive con Tailwind CSS
- **Gestión de catálogo de materiales** - CRUD completo
- **Creación de presupuestos** - Agregar artículos con cantidades por mes
- **Partidas presupuestarias** - Organización automática por códigos ERP
- **Exportación a Excel** - Informes profesionales con múltiples hojas
- **Persistencia completa** - Todos los datos se guardan en tiempo real
- **Interfaz moderna** - Diseño responsive con Tailwind CSS

## Tecnologías
## Tecnologías

- **Frontend:** React 19 + Vite 7
- **Estilos:** Tailwind CSS 4
- **Base de datos:** Supabase (PostgreSQL)
- **Exportación:** SheetJS (xlsx)
- **Despliegue:** Vercel/Netlify ready

## Instalación
## Instalación

1. **Clonar el repositorio:**
```bash
git clone https://github.com/tu-usuario/sistem-presupuesto.git
cd sistem-presupuesto
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar Supabase:**
   - Crear proyecto en [Supabase](https://supabase.com)
   - Ejecutar el script `supabase-setup.sql` en el SQL Editor
   - Crear archivo `.env` con:
```
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

4. **Ejecutar en desarrollo:**
```bash
npm run dev
```

## Estructura del proyecto
## Estructura del proyecto

```
src/
├── components/          # Componentes React
│   ├── BudgetSystem.jsx    # Componente principal
│   ├── ArticuloSelector.jsx # Selector de artículos
│   ├── TablaArticulos.jsx   # Tabla de artículos
│   ├── ResumenPartidas.jsx  # Resumen por partidas
│   └── GestorMateriales.jsx # Gestión de catálogo
├── hooks/               # Custom hooks
│   └── useSupabase.js      # Hook para BD
├── lib/                 # Configuraciones
│   └── supabase.js         # Cliente Supabase
├── types/               # Tipos y estructuras
│   └── budget.js           # Definiciones de presupuesto
└── utils/               # Utilidades
    └── excelExport.js      # Exportación Excel
```

## Base de datos

El sistema utiliza 4 tablas principales:
- `materiales` - Catálogo de materiales
- `presupuestos` - Información de presupuestos
- `presupuesto_articulos` - Artículos por presupuesto
- `partida_valores` - Valores por partida y mes

## Despliegue

**Build para producción:**
```bash
npm run build
```

**Preview:**
```bash
npm run preview
```

## Licencia
## Licencia

MIT License - Universidad Ricardo Palma

## Desarrollo
## Desarrollo

Desarrollado para la Facultad de Ingeniería - Centro de Documentación de la Universidad Ricardo Palma.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
