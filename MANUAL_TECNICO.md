# Manual Técnico — Sistema de Presupuesto e Inventario

Este documento describe la arquitectura, configuración, componentes y operación técnica del proyecto para desarrollo, mantenimiento y despliegue.

## Objetivos
- Gestionar presupuestos y materiales con autenticación.
- Integrar con Supabase (Auth, Postgres, Storage).
- Exportar datos a Excel y manejar inventario.

## Arquitectura
- Frontend: React + Vite.
- Estilos: CSS (archivo principal `src/index.css`).
- Integración: Supabase JS SDK.
- Build y desarrollo: Vite.

## Requisitos
- Node.js 18+ y npm.
- Cuenta/projecto en Supabase con URL y anon key.
- Windows (desarrollo), compatible con otros SO.

## Instalación
1. Clonar o abrir el workspace.
2. Instalar dependencias:
   ```bash
   npm install
   ```

## Configuración
- Variables de entorno (recomendado crear `.env`):
  ```env
  VITE_SUPABASE_URL=https://<project>.supabase.co
  VITE_SUPABASE_ANON_KEY=<anon-key>
  ```
- Carga de config: `src/lib/supabase.js` lee `import.meta.env.VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
- Autenticación: hooks en `src/hooks/useAuth.jsx` y pantalla `src/components/Login.jsx`.

## Scripts (npm)
- Desarrollo:
  ```bash
  npm run dev
  ```
- Build producción:
  ```bash
  npm run build
  ```
- Previsualizar build:
  ```bash
  npm run preview
  ```

## Estructura del proyecto
- `index.html`: Entrada HTML Vite.
- `src/main.jsx`: Montaje de React y provider/es.
- `src/App.jsx`: Composición de rutas y layout principal.
- `src/index.css`: Estilos globales.
- `src/lib/supabase.js`: Cliente Supabase.
- `src/hooks/useSupabase.js`: Hook utilitario para acceso a Supabase.
- `src/hooks/useAuth.jsx`: Estado de autenticación y sesión.
- `src/components/`: UI y lógica:
  - `Login.jsx`: Inicio de sesión.
  - `ProtectedRoute.jsx`: Protección de rutas.
  - `AdminNav.jsx`: Navegación administrativa.
  - `BudgetSystem.jsx`: Núcleo de gestión de presupuestos.
  - `ResumenPartidas.jsx`: Vista resumen de partidas.
  - `GestorInventario.jsx`: Gestión de inventario (versión activa).
  - `GestorInventario_old.jsx`: Versión anterior (referencia).
  - `GestorMateriales.jsx`: Gestión de materiales.
  - `ArticuloSelector.jsx`: Selector de artículos.
  - `TablaArticulos.jsx`: Tabla/CRUD de artículos.
- `src/utils/excelExport.js`: Exportación a Excel.
- `src/types/budget.js`: Tipos y esquemas de presupuesto.
- `public/`: Assets estáticos.
- `sql/`: Scripts SQL (si aplica para Supabase).

## Componentes clave y flujo
- Autenticación:
  - `useAuth.jsx` suscribe a sesión de Supabase y expone estado.
  - `Login.jsx` usa `supabase.auth.signInWithPassword()` o proveedores OAuth.
  - `ProtectedRoute.jsx` verifica sesión para renderizar componentes protegidos.
- Presupuestos e inventario:
  - `BudgetSystem.jsx` orquesta creación/edición de partidas, cálculo de totales y acceso a materiales.
  - `GestorInventario.jsx` maneja altas/bajas y sincronización con base de datos.
  - `ResumenPartidas.jsx` presenta agregados y exportables.
- Artículos y materiales:
  - `ArticuloSelector.jsx` y `TablaArticulos.jsx` permiten búsqueda, selección y edición.
- Exportación a Excel:
  - `excelExport.js` genera archivos XLSX desde tablas o datasets.

## Integración con Supabase
- Cliente: `src/lib/supabase.js` inicializa `createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)`.
- Tablas sugeridas (ejemplo): `usuarios`, `articulos`, `materiales`, `inventario`, `presupuestos`, `partidas`.
- RLS/Policies: Habilitar Row Level Security y políticas para cada tabla según rol.
- Storage (opcional): buckets para imágenes de artículos.

## Seguridad
- Mantener `VITE_SUPABASE_ANON_KEY` solo para acceso público con políticas.
- Operaciones privilegiadas deben ir vía `service role` en backend (no incluido aquí).
- Validar entradas en componentes antes de escribir en DB.

## Estándares de código
- React con componentes funcionales y hooks.
- Mantener lógica de datos en hooks y `lib/`.
- Utilizar `types/` para contratos internos y evitar props inconsistentes.

## Despliegue
- Generar build:
  ```bash
  npm run build
  ```
- Servir `dist/` en hosting estático (Vercel, Netlify, Supabase Hosting o NGINX).
- Configurar variables de entorno en el proveedor (prefijo `VITE_`).

## Backup y migraciones
- Versionar `sql/` con cambios de esquema.
- Usar Supabase migrations para aplicar cambios entre ambientes.

## Troubleshooting
- Pantalla en blanco:
  - Verificar `.env` y que `VITE_SUPABASE_URL`/`ANON_KEY` existen.
  - Revisar consola del navegador (errores de red/autenticación).
- Error de autenticación:
  - Confirmar políticas RLS y que el usuario tenga permisos.
  - Comprobar correo y contraseña en `Login.jsx`.
- Exportación Excel falla:
  - Revisar estructura de datos y que `excelExport.js` reciba un array válido.
- API de Supabase:
  - Checar reglas CORS y URL correcta del proyecto.

## Prueba rápida (desarrollo)
```bash
npm install
npm run dev
```
Abrir la URL que Vite muestra (por defecto `http://localhost:5173`). Iniciar sesión en `Login` y navegar a las vistas de presupuesto e inventario.

## Mantenimiento
- Actualizar dependencias periódicamente (`npm outdated`, `npm update`).
- Revisar `README.md` y este manual tras cambios de arquitectura.
- Añadir tests unitarios/integración (sugerencia futura).
