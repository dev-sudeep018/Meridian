/**
 * Client-side AI wrapper — DeepSeek (primary) + Groq (fallback).
 * DeepSeek API is OpenAI-compatible.
 */

async function fetchWithRetry(url, options, retries = 3) {
  let lastError = null
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options)
      if (res.status === 429 || res.status === 503) {
        const delay = 5000 * (i + 1)
        console.warn(`[AI] ${res.status}, waiting ${delay / 1000}s (retry ${i + 1}/${retries})...`)
        if (i === retries) throw new Error(`Rate limited after ${retries} retries. Wait 60s and try again.`)
        await new Promise(r => setTimeout(r, delay))
        continue
      }
      return res
    } catch (err) {
      lastError = err
      if (i === retries) throw err
      console.warn(`[AI] Error, retry ${i + 1}/${retries}:`, err.message)
      await new Promise(r => setTimeout(r, 3000 * (i + 1)))
    }
  }
  throw lastError || new Error('All retries exhausted')
}

// ——— DeepSeek (primary) ———
export async function callDeepSeek(prompt, options = {}) {
  const {
    temperature = 0.4,
    maxTokens = 2048,
    jsonMode = false,
    parseJson = false,
    systemPrompt = null,
    apiKey = localStorage.getItem('meridian-deepseek-key') || import.meta.env.VITE_DEEPSEEK_API_KEY || '',
  } = options

  if (!apiKey) throw new Error('DeepSeek API key not set')

  const useStrictJson = jsonMode && !parseJson
  const messages = []
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt })
  messages.push({ role: 'user', content: prompt })

  const body = {
    model: 'deepseek-chat',
    messages,
    temperature,
    max_tokens: maxTokens,
    ...(useStrictJson && { response_format: { type: 'json_object' } }),
  }

  const res = await fetchWithRetry('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`DeepSeek ${res.status}: ${err.substring(0, 300)}`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content

  if (!text) {
    console.warn('[DeepSeek] No content:', JSON.stringify(data).substring(0, 300))
    throw new Error('DeepSeek returned no content')
  }

  if (jsonMode || parseJson) return extractJson(text)
  return text
}

// ——— Groq (fallback) ———
export async function callGroq(prompt, options = {}) {
  const {
    temperature = 0.4,
    maxTokens = 2048,
    jsonMode = false,
    parseJson = false,
    systemPrompt = null,
    apiKey = localStorage.getItem('meridian-groq-key') || import.meta.env.VITE_GROQ_API_KEY || '',
  } = options

  if (!apiKey) throw new Error('Groq API key not set')

  const useStrictJson = jsonMode && !parseJson
  const messages = []
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt })
  messages.push({ role: 'user', content: prompt })

  const body = {
    model: 'llama-3.3-70b-versatile',
    messages,
    temperature,
    max_tokens: maxTokens,
    ...(useStrictJson && { response_format: { type: 'json_object' } }),
  }

  const res = await fetchWithRetry('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq ${res.status}: ${err.substring(0, 200)}`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content

  if (!text) throw new Error('Groq returned no content')

  if (jsonMode || parseJson) return extractJson(text)
  return text
}

// ——— Smart router: try DeepSeek first, fallback to Groq ———
export async function callAI(prompt, options = {}) {
  const deepseekKey = localStorage.getItem('meridian-deepseek-key') || import.meta.env.VITE_DEEPSEEK_API_KEY
  const groqKey = localStorage.getItem('meridian-groq-key') || import.meta.env.VITE_GROQ_API_KEY

  if (deepseekKey) {
    try {
      return await callDeepSeek(prompt, { ...options, apiKey: deepseekKey })
    } catch (err) {
      console.warn('[AI] DeepSeek failed, trying Groq:', err.message)
      if (groqKey) return await callGroq(prompt, { ...options, apiKey: groqKey })
      throw err
    }
  }

  if (groqKey) return await callGroq(prompt, options)

  throw new Error('No AI API key set. Add DeepSeek or Groq key in Settings.')
}

// ——— Chat completion with message history ———
export async function chatCompletion(messages, options = {}) {
  const {
    temperature = 0.6,
    maxTokens = 1024,
    jsonMode = false,
    parseJson = false,
  } = options

  const deepseekKey = localStorage.getItem('meridian-deepseek-key') || import.meta.env.VITE_DEEPSEEK_API_KEY
  const groqKey = localStorage.getItem('meridian-groq-key') || import.meta.env.VITE_GROQ_API_KEY

  const apiKey = deepseekKey || groqKey
  if (!apiKey) throw new Error('No AI API key set')

  const isDeepSeek = !!deepseekKey
  const url = isDeepSeek ? 'https://api.deepseek.com/chat/completions' : 'https://api.groq.com/openai/v1/chat/completions'
  const model = isDeepSeek ? 'deepseek-chat' : 'llama-3.3-70b-versatile'

  const useStrictJson = jsonMode && !parseJson

  const body = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
    ...(useStrictJson && { response_format: { type: 'json_object' } }),
  }

  const res = await fetchWithRetry(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`${isDeepSeek ? 'DeepSeek' : 'Groq'} ${res.status}: ${err.substring(0, 200)}`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error('AI returned no content')

  if (jsonMode || parseJson) return extractJson(text)
  return text
}

// Robust JSON extraction
function extractJson(text) {
  try { return JSON.parse(text) } catch {}
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  try { return JSON.parse(cleaned) } catch {}
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[0]) } catch {}
  }
  console.error('[AI] Could not extract JSON:', text.substring(0, 500))
  throw new Error('Could not extract JSON from response')
}

// Legacy exports
export const callGemini = callAI
