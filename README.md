# Bitácora Digital de Actualizaciones

Aplicación personal para registrar actualizaciones de trabajo (empresa,
cliente, nota, fecha), migrada del Artifact de Claude a un proyecto
React + Vite independiente, con Supabase como base de datos externa.

Mismo diseño, misma paleta (negro + azul oscuro + cian) y las mismas
funcionalidades del Artifact original: dashboard, historial con
búsqueda y filtros, CRUD de empresas/clientes/actualizaciones, sin login.

## 1. Requisitos

- Node.js 18 o superior
- Una cuenta gratuita en [supabase.com](https://supabase.com)

## 2. Crear el proyecto en Supabase

1. Entra a [supabase.com](https://supabase.com) → **New project**.
2. Cuando esté listo, ve a **SQL Editor → New query**.
3. Abre el archivo `supabase/schema.sql` de este proyecto, copia todo
   su contenido, pégalo ahí y presiona **Run**.
   Esto crea las tablas `companies`, `clients` y `updates`, sus
   relaciones, índices y las políticas de acceso.
4. Ve a **Settings → API** y copia:
   - **Project URL**
   - **anon public key**

## 3. Configurar las variables de entorno

En la raíz del proyecto:

```bash
cp .env.example .env
```

Abre `.env` y reemplaza los valores de ejemplo:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon-publica
```

`.env` está en `.gitignore`, así que nunca se sube al repositorio.

## 4. Instalar y ejecutar localmente

```bash
npm install
npm run dev
```

Abre la URL que muestra la terminal (normalmente `http://localhost:5173`).

La primera vez que la app se conecte a la base de datos vacía, crea
automáticamente las empresas y clientes iniciales:

- **TREXDI**: FONCEL, FONTEBO, FEDEF, FONCENCOSUD, FECSA, CEOCAL
- **SCRAV**: FEDEWSP, INTEGRAL RISK, MUTUAL TRIBUTAR, SOFTSECURITY, SOL CRECIENTE

Esto solo ocurre una vez (mientras la tabla `companies` esté vacía),
así que no se duplican si recargas la página.

## 5. Compilar para producción (cuando decidas publicar)

```bash
npm run build
```

Esto genera la carpeta `dist/` lista para subir a Vercel, Netlify,
Cloudflare Pages u otro hosting gratuito. **Aún no lo hagas** — primero
confirma que todo funciona en tu máquina con `npm run dev`.

## 6. Estructura del proyecto

```
bitacora-digital-web/
├── .env.example          # Plantilla de variables de entorno
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
├── supabase/
│   └── schema.sql        # SQL para crear las tablas en Supabase
└── src/
    ├── main.jsx
    ├── index.css
    ├── App.jsx            # Componente principal, navegación y estado global
    ├── components/
    │   ├── ui.jsx          # Select, Field, Toast, ConfirmDialog, EditInline, NavItem
    │   ├── UpdateModal.jsx # Formulario Nueva/Editar actualización
    │   ├── UpdateCard.jsx  # Tarjeta de una actualización
    │   ├── InicioView.jsx  # Dashboard
    │   ├── HistorialView.jsx  # Historial con búsqueda y filtros
    │   └── ClientesView.jsx   # Administrar empresas y clientes
    ├── lib/
    │   ├── supabaseClient.js  # Cliente de Supabase (lee las variables de entorno)
    │   ├── api.js              # Todas las funciones que hablan con Supabase (CRUD)
    │   └── seedData.js         # Datos iniciales (TREXDI, SCRAV y sus clientes)
    └── utils/
        └── date.js             # Formato de fechas sin desfases de zona horaria
```

## 7. Qué archivos subir luego a GitHub

Sube **todo el proyecto excepto** lo que ya excluye `.gitignore`:

- `node_modules/` (se reinstala con `npm install`)
- `dist/` (se genera con `npm run build`)
- `.env` (tus credenciales reales — nunca debe subirse)

Es decir: sí subes `.env.example` (sin datos reales) y `supabase/schema.sql`,
pero nunca tu `.env` real.

## 8. Una diferencia importante frente al Artifact original

En el Artifact, cada actualización guardaba una "foto" del nombre de la
empresa y el cliente en ese momento. La tabla `updates` de Supabase (tal
como la definiste) no tiene esas columnas, solo `company_id` y
`client_id`. Por eso ahora el nombre se busca en tiempo real contra las
tablas `companies`/`clients` cada vez que se muestra una actualización.
Esto tiene una consecuencia práctica que vale la pena que conozcas:

- Si **renombras** una empresa o un cliente, el historial completo
  muestra automáticamente el nuevo nombre (antes, en el Artifact, el
  historial se quedaba con el nombre viejo).
- Si **eliminas un cliente** que ya tiene actualizaciones, esas
  actualizaciones se conservan (como pediste) pero aparecen con la
  etiqueta "Cliente eliminado" en vez del nombre original, porque ya
  no hay ningún registro del que tomarlo.
- Además, ahora una **empresa** no se puede eliminar si tiene clientes
  **o** actualizaciones asociadas (antes solo se revisaban los
  clientes). Es el mismo criterio que ya habías pedido en la
  especificación original, ahora aplicado de forma más completa porque
  con una base de datos real esto sí importa.

Nada de esto cambia el diseño ni quita funciones — es simplemente cómo
se comporta el mismo comportamiento que pediste, ahora con datos reales
y persistentes en vez de estar en memoria.
