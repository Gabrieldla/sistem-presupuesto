# Sistema de Presupuesto - Biblioteca Virtual de Ingeniería

Sistema web moderno para la gestión de presupuestos operativos de la Biblioteca Virtual de Ingeniería de la Universidad Ricardo Palma.

## ✨ Características

- **Autenticación Supabase** - Login seguro y simple
- **Gestión de catálogo de materiales** - CRUD completo
- **Creación de presupuestos** - Agregar artículos con cantidades por mes
- **Partidas presupuestarias** - Organización automática por códigos ERP
- **Exportación a Excel** - Informes profesionales con múltiples hojas
- **Persistencia completa** - Todos los datos se guardan en tiempo real
- **Interfaz moderna** - Diseño responsive con Tailwind CSS

## 🚀 Tecnologías

- **Frontend:** React 19 + Vite 7
- **Estilos:** Tailwind CSS 4
- **Base de datos:** Supabase (PostgreSQL)
- **Autenticación:** Supabase Auth
- **Exportación:** SheetJS (xlsx)
- **Despliegue:** Vercel/Netlify ready

## 📦 Instalación

1. **Clonar el repositorio:**
```bash
git clone https://github.com/Gabrieldla/sistem-presupuesto.git
cd sistem-presupuesto
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar Supabase:**
   - Crear proyecto en [Supabase](https://supabase.com)
   - Crear archivo `.env` con:
```
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

4. **Ejecutar en desarrollo:**
```bash
npm run dev
```

## 🏗️ Estructura del proyecto

```
src/
├── components/              # Componentes React
│   ├── BudgetSystem.jsx    # Componente principal
│   ├── Login.jsx           # Sistema de autenticación
│   ├── ProtectedRoute.jsx  # Rutas protegidas
│   ├── AdminNav.jsx        # Navegación superior
│   ├── ArticuloSelector.jsx # Selector de artículos
│   ├── TablaArticulos.jsx   # Tabla de artículos
│   ├── ResumenPartidas.jsx  # Resumen por partidas
│   └── GestorMateriales.jsx # Gestión de catálogo
├── hooks/                   # Custom hooks
│   ├── useAuth.jsx         # Hook de autenticación
│   └── useSupabase.js      # Hook para BD
├── lib/                     # Configuraciones
│   └── supabase.js         # Cliente Supabase
├── types/                   # Tipos y estructuras
│   └── budget.js           # Definiciones de presupuesto
└── utils/                   # Utilidades
    └── excelExport.js      # Exportación Excel
```

## 🗄️ Base de datos

El sistema utiliza 4 tablas principales:
- `materiales` - Catálogo de materiales
- `presupuestos` - Información de presupuestos
- `presupuesto_articulos` - Artículos por presupuesto
- `partida_valores` - Valores por partida y mes

## 🔐 Autenticación

Sistema ultra simplificado:
- **Solo login** - No hay registro en la aplicación
- **Gestión manual** - Crear usuarios directamente en Supabase Auth
- **Acceso inmediato** - Usuario creado = acceso al sistema

## 🚀 Despliegue

**Build para producción:**
```bash
npm run build
```

**Preview:**
```bash
npm run preview
```

## 📄 Licencia

MIT License - Universidad Ricardo Palma

## 👨‍💻 Desarrollo

Desarrollado para la Facultad de Ingeniería - Centro de Documentación de la Universidad Ricardo Palma.
