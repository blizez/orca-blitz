# Como instalar y usar orca-blitz

## Requisitos

Para usar orca-blitz necesitas:

- Una computadora con Windows, Linux o macOS
- Internet (para descargar la app)

## Descargar la app

**Proximamente** estara disponible para descarga directa.

## Usar la version de desarrollo

Si eres desarrollador y quieres probar la version mas reciente:

### Paso 1: Instalar Node.js

Ve a [nodejs.org](https://nodejs.org/) y descarga la version recomendada.

### Paso 2: Instalar pnpm

Abre la terminal y escribe:

```bash
npm install -g pnpm
```

### Paso 3: Clonar el proyecto

```bash
git clone <url-del-repositorio>
cd orca-blitz
```

### Paso 4: Instalar dependencias

```bash
pnpm install
```

### Paso 5: Ejecutar la app

```bash
pnpm dev
```

Se abrira la app de orca-blitz.

## Solucion de problemas

**La app no se abre:**
- Asegurate de tener Node.js instalado
- Revisa que no haya otro programa usando el mismo puerto

**Error al instalar:**
```bash
pnpm install --force
```

**Error de Electron:**
```bash
pnpm approve-builds
```
