import { randomBytes } from 'crypto'

const CHATGPT_API = 'https://chatgpt.com/backend-api'
const CHATGPT_MODELS = 'https://chatgpt.com/backend-api/models'

export interface ChatGPTMessage {
  id: string
  author: { role: 'user' | 'assistant' | 'system' }
  content: { content_type: 'text'; parts: string[] }
}

export interface ChatGPTRequest {
  action: 'next'
  model: string
  messages: ChatGPTMessage[]
  parent_message_id: string
}

function uuid(): string {
  return randomBytes(16).toString('hex')
}

export async function* streamChatGPT(
  accessToken: string,
  model: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
): AsyncGenerator<string, void, unknown> {
  const parentId = uuid()

  const apiMessages: ChatGPTMessage[] = messages.map((m) => ({
    id: uuid(),
    author: { role: m.role },
    content: { content_type: 'text', parts: [m.content] },
  }))

  const body: ChatGPTRequest = {
    action: 'next',
    model,
    messages: apiMessages,
    parent_message_id: parentId,
  }

  const response = await fetch(`${CHATGPT_API}/conversation`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`ChatGPT API error ${response.status}: ${error}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') return

        try {
          const parsed = JSON.parse(data)
          if (parsed.message?.content?.parts?.[0]) {
            yield parsed.message.content.parts[0]
          }
        } catch {}
      }
    }
  }
}

export async function fetchChatGPTModels(accessToken: string): Promise<string[]> {
  try {
    const response = await fetch(CHATGPT_MODELS, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      if (data.models && Array.isArray(data.models)) {
        return data.models.map((m: { slug: string }) => m.slug).filter(Boolean).sort()
      }
    }
  } catch {}

  return []
}

export async function fetchChatGPTUser(accessToken: string): Promise<{ plan?: string; email?: string } | null> {
  try {
    const response = await fetch(`${CHATGPT_API}/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    })

    if (response.ok) {
      return response.json()
    }
  } catch {}
  return null
}
