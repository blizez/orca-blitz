import { describe, expect, it } from 'vitest'
import type { proto } from 'baileys'
import { normalizeMessage } from './message-normalizer'

function msg(partial: {
  remoteJid?: string
  id?: string
  fromMe?: boolean
  pushName?: string
  messageTimestamp?: number
  message?: Record<string, unknown>
}): proto.IWebMessageInfo {
  return {
    key: { remoteJid: partial.remoteJid, id: partial.id, fromMe: partial.fromMe },
    pushName: partial.pushName,
    messageTimestamp: partial.messageTimestamp,
    message: partial.message as proto.IMessage,
  }
}

describe('normalizeMessage', () => {
  it('descarta mensajes sin jid', () => {
    const result = normalizeMessage(msg({ message: { conversation: 'hola' } }), 'biz1')
    expect(result).toBeNull()
  })

  it('descarta mensajes sin contenido', () => {
    const result = normalizeMessage(msg({ remoteJid: '123@s.whatsapp.net' }), 'biz1')
    expect(result).toBeNull()
  })

  it('descarta estados y newsletters', () => {
    expect(normalizeMessage(msg({ remoteJid: 'status@broadcast', message: { conversation: 'x' } }), 'biz1')).toBeNull()
    expect(normalizeMessage(msg({ remoteJid: '123@newsletter', message: { conversation: 'x' } }), 'biz1')).toBeNull()
  })

  it('normaliza texto simple', () => {
    const result = normalizeMessage(
      msg({
        remoteJid: '123@s.whatsapp.net',
        id: 'ABC123',
        messageTimestamp: 1700000000,
        pushName: 'Lux',
        message: { conversation: 'hola' },
      }),
      'biz1',
    )
    expect(result).toEqual({
      id: 'ABC123',
      businessId: 'biz1',
      channel: 'whatsapp',
      chatJid: '123@s.whatsapp.net',
      fromMe: false,
      senderName: 'Lux',
      type: 'text',
      body: 'hola',
      timestamp: 1700000000000,
      status: 'received',
    })
  })

  it('usa extendedTextMessage como cuerpo', () => {
    const result = normalizeMessage(
      msg({ remoteJid: '123@s.whatsapp.net', message: { extendedTextMessage: { text: 'respuesta' } } }),
      'biz1',
    )
    expect(result?.type).toBe('text')
    expect(result?.body).toBe('respuesta')
  })

  it('clasifica imagen y usa el caption como cuerpo', () => {
    const result = normalizeMessage(
      msg({ remoteJid: '123@s.whatsapp.net', message: { imageMessage: { caption: 'foto' } } }),
      'biz1',
    )
    expect(result?.type).toBe('image')
    expect(result?.body).toBe('foto')
  })

  it('clasifica documento y usa el fileName como cuerpo', () => {
    const result = normalizeMessage(
      msg({ remoteJid: '123@s.whatsapp.net', message: { documentMessage: { fileName: 'cv.pdf' } } }),
      'biz1',
    )
    expect(result?.type).toBe('document')
    expect(result?.body).toBe('cv.pdf')
  })

  it('clasifica video, audio y sticker', () => {
    const base = { remoteJid: '123@s.whatsapp.net' }
    expect(normalizeMessage(msg({ ...base, message: { videoMessage: {} } }), 'biz1')?.type).toBe('video')
    expect(normalizeMessage(msg({ ...base, message: { audioMessage: {} } }), 'biz1')?.type).toBe('audio')
    expect(normalizeMessage(msg({ ...base, message: { stickerMessage: {} } }), 'biz1')?.type).toBe('sticker')
  })

  it('retorna type "other" con body vacío para contenido desconocido', () => {
    const result = normalizeMessage(msg({ remoteJid: '123@s.whatsapp.net', message: { contactMessage: {} } }), 'biz1')
    expect(result?.type).toBe('other')
    expect(result?.body).toBe('')
  })

  it('marca mensajes propios como sent', () => {
    const result = normalizeMessage(
      msg({ remoteJid: '123@s.whatsapp.net', fromMe: true, message: { conversation: 'yo' } }),
      'biz1',
    )
    expect(result?.fromMe).toBe(true)
    expect(result?.status).toBe('sent')
  })

  it('genera id de respaldo jid-timestamp si falta key.id', () => {
    const raw = msg({ remoteJid: '123@s.whatsapp.net', messageTimestamp: 42, message: { conversation: 'x' } })
    raw.key!.id = undefined
    const result = normalizeMessage(raw, 'biz1')
    expect(result?.id).toBe('123@s.whatsapp.net-42000')
  })

  it('usa Date.now() cuando no hay timestamp', () => {
    const before = Date.now()
    const result = normalizeMessage(msg({ remoteJid: '123@s.whatsapp.net', message: { conversation: 'x' } }), 'biz1')
    expect(result!.timestamp).toBeGreaterThanOrEqual(before)
  })

  it('respeta el canal indicado', () => {
    const result = normalizeMessage(
      msg({ remoteJid: '123@telegram', message: { conversation: 'x' } }),
      'biz1',
      'telegram',
    )
    expect(result?.channel).toBe('telegram')
  })
})
