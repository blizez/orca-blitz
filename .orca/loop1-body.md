## Contexto del Proyecto

orca-blitz es una plataforma empresarial open source para automatizar negocios. Actualmente en fase temprana (~15% implementado). La app desktop tiene sidebar, settings, CRUD de negocios, y 3 features por negocio: Social Media, Content y Campaigns.

## Sistema i18n Existente

El paquete `packages/i18n/` ya está configurado con i18next, react-i18next y detección automática de idioma. Tiene locales completos para `en` y `es` en 6 namespaces: common, sidebar, settings, providers, business, modals.

## Problema Detectado

Las páginas **Content** (`apps/desktop/src/renderer/components/business/content-page.tsx`) y **Campaigns** (`apps/desktop/src/renderer/components/business/campaigns-page.tsx`) tienen TODOS sus strings hardcoded en inglés:

**content-page.tsx:**
- `<h1>Content</h1>` (línea 78)
- `New Post` button (línea 85)
- `No content yet` (línea 96)
- `Create your first post to start building your content pipeline.` (línea 98)
- `Create your first post` (línea 103)
- `New Post` modal title (línea 159)
- `Draft a post for one of your business channels.` (línea 161)
- Labels: Title, Channel, Status, Publish date, Content, Cancel, Save Post

**campaigns-page.tsx:**
- `<h1>Campaigns</h1>` (línea 85)
- `New Campaign` button (línea 91)
- `No campaigns yet` (línea 101)
- `Launch your first campaign to start driving engagement for this business.` (línea 103)
- `Create your first campaign` (línea 109)
- `New Campaign` modal title (línea 160)
- `Define a campaign for one of your business channels.` (línea 162)
- Labels: Name, Channel, Status, Start date, End date, Description, Cancel, Save Campaign

En cambio, `business-overview.tsx` YA usa `useTranslation('business')` correctamente.

## Solución Propuesta

Conectar ambos componentes al namespace `business` del i18n que ya tiene las claves definidas:

**Claves existentes en `business.json` (en/es):**
- `content.title`, `content.description`, `content.newPost`, `content.noContent`, `content.createFirst`
- `content.status.draft`, `content.status.scheduled`, `content.status.published`
- `campaigns.title`, `campaigns.description`, `campaigns.newCampaign`, `campaigns.noCampaigns`, `campaigns.createFirst`
- `campaigns.status.draft`, `campaigns.status.active`, `campaigns.status.paused`, `campaigns.status.completed`

**Cambios:**
1. Agregar `useTranslation('business')` a `content-page.tsx`
2. Reemplazar ~12 strings hardcoded por `t('content.*')`
3. Agregar `useTranslation('business')` a `campaigns-page.tsx`
4. Reemplazar ~12 strings hardcoded por `t('campaigns.*')`
5. Agregar claves faltantes a `business.json` (labels de formulario: title, channel, status, dates, etc.) en ambos idiomas

## Archivos Afectados

- `apps/desktop/src/renderer/components/business/content-page.tsx` — agregar i18n
- `apps/desktop/src/renderer/components/business/campaigns-page.tsx` — agregar i18n
- `packages/i18n/src/locales/en/business.json` — agregar keys de formulario
- `packages/i18n/src/locales/es/business.json` — agregar keys de formulario

## Beneficios

- Consistencia: todas las páginas de negocio usan i18n uniformemente
- Preparación: el español funcionará correctamente cuando el usuario cambie idioma
- Sin dependencias nuevas: aprovecha infraestructura i18n existente
- Bajo riesgo: solo reemplaza strings por traducciones, sin lógica nueva

## Complejidad Estimada

**1-2 días.** 2 archivos de componentes + 2 archivos de locales. Cambios mecánicos, sin lógica nueva.

## Criterios de Aceptación

- [ ] `content-page.tsx` usa `useTranslation('business')` para todos los strings visibles
- [ ] `campaigns-page.tsx` usa `useTranslation('business')` para todos los strings visibles
- [ ] Las claves faltantes (form labels) están en ambos `business.json` (en/es)
- [ ] La app compila sin errores de TypeScript
