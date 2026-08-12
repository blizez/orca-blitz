# Proveedores de IA

En **Settings → AI Providers** configuras que inteligencia artificial usa la app para automatizar tareas.

## Proveedores disponibles

| Proveedor | Que es |
|-----------|--------|
| **OpenAI** | ChatGPT y otros modelos de OpenAI |
| **Anthropic** | Claude, el asistente de Anthropic |
| **Google AI** | Modelos de Google (Gemini, etc.) |
| **DeepSeek** | Modelos de DeepSeek |
| **Ollama** | IA que corre en tu propia computadora |

---

## Como conectar un proveedor

1. Ve a **Settings → AI Providers**
2. Haz click en **Configure** al lado del proveedor que quieras
3. Se abre una ventana donde pones tu llave de acceso (API key)
4. Pega tu llave en el cuadro de texto
5. Haz click en **Save**

Cada proveedor tiene su propio formato de llave. Por ejemplo:
- OpenAI empieza con `sk-...`
- Anthropic empieza cons `sk-ant-...`
- Google AI empieza con `AI...`

---

## Ollama (IA local)

Ollama es especial porque no necesita internet ni API key. Corre directamente en tu computadora:

1. Instala Ollama desde [ollama.com](https://ollama.com)
2. Descarga un modelo (ejemplo: `ollama pull llama3`)
3. En orca-blitz, ve a **Settings → AI Providers**
4. Haz click en **Configure** al lado de Ollama
5. La direccion por defecto es `http://localhost:11434`
6. Haz click en **Save**

---

## Consejos

- Si no tienes una API key, necesitas crear una cuenta en el sitio del proveedor
- Ollama es gratis pero requiere una computadora con buen rendimiento
- Puedes configurar varios proveedores al mismo tiempo
- Las llaves se guardan de forma segura en tu computadora
