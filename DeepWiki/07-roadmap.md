# 07 — Roadmap

## Estado

```
Implementado:  ~30%
Scaffolding:   ~70%
```

---

## Lo que falta

### Paquetes (todos vacios)

| Package                    | Proposito                                     |
| -------------------------- | --------------------------------------------- |
| `packages/core/`           | Entidades, use cases, servicios, repositorios |
| `packages/features/`       | CRM, Automation, Analytics, Marketing, etc.   |
| `packages/ai/`             | Contratos IA, memoria, prompts                |
| `packages/plugins/`        | Plugin manager, loader, sandbox               |
| `packages/sdk/`            | API publica para desarrolladores              |
| `packages/shared/`         | Types, events, constants compartidos          |
| `packages/infrastructure/` | Database adapters, external services          |

### Backend

| Componente | Proposito                |
| ---------- | ------------------------ |
| `server/`  | Fastify/Hono + WebSocket |
| `relay/`   | Desktop ↔ Mobile ↔ CLI   |

### Plugins

| Plugin    | Proposito                  |
| --------- | -------------------------- |
| WhatsApp  | Integracion mensajeria     |
| Instagram | Integracion redes sociales |
| Email     | Integracion correo         |
| Payments  | Integracion pagos          |

### Apps

| App            | Proposito                   |
| -------------- | --------------------------- |
| `apps/web/`    | React + Vite para navegador |
| `apps/mobile/` | React Native + Expo         |

### Main Process (por implementar)

| Modulo          | Proposito                 |
| --------------- | ------------------------- |
| IPC handlers    | CRUD real de datos        |
| Persistence     | Guardar en disco          |
| Runtime         | Orca runtime + RPC        |
| Plugin host     | Ejecutar plugins          |
| Browser manager | Navegador integrado       |
| Notifications   | Notificaciones nativas    |
| Updater         | Auto-actualizacion        |
| Daemon          | Servicio en segundo plano |

### Renderer (por implementar)

| Modulo                | Proposito               |
| --------------------- | ----------------------- |
| Zustand store         | State management global |
| CRM components        | UI de clientes          |
| Automation components | UI de workflows         |
| Chat components       | UI de chat              |
| Hooks                 | useIpcEvents, etc.      |

---

## Prioridad

1. Core — Entidades y reglas de negocio
2. Persistence — Guardar datos en disco
3. IPC handlers — Comunicacion real
4. CRM — Primera feature completa
5. Zustand store — State management
6. Server — Backend para cloud
