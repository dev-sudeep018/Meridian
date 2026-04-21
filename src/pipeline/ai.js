/**
 * Client-side AI wrapper
 * Gemini (primary, free 30 RPM) → Groq (fallback)
 */

async function fetchWithRetry(url, options, retries = 3) {
  let lastError = null
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options)
      if (res.status === 429 || res.status === 503) {
        const delay = 5000 * (i + 1)
        console.warn(`[AI] ${res.status}, waiting ${delay / 1000}s (retry ${i + 1}/${retries})...`)
        if (i === retries) throw new Error(`Rate limited after ${retries} retries (${res.status}). Wait 60s.`)
        await new Promise(r => setTimeout(r, delay))
        continue
      }
      return res
    } catch (err) {
      lastError = err
      if (i === retries) throw err
      console.warn(`[AI] Fetch error, retry ${i + 1}/${retries}:`, err.message)
      await new Promise(r => setTimeout(r, 3000 * (i + 1)))
    }
  }
  throw lastError || new Error('All retries exhausted')
}

// ——— Gemini (primary) ———
async function callGeminiAPI(prompt, options = {}) {
  const {
    temperature = 0.4,
    maxOutputTokens = 4096,
    jsonMode = false,
    parseJson = false,
    systemPrompt = null,
    apiKey = localStorage.getItem('meridian-gemini-key') || import.meta.env.VITE_GEMINI_API_KEY || '',
  } = options

  if (!apiKey) throw new Error('Gemini API key not set')

  const contents = []
  if (systemPrompt) {
    contents.push({ role: 'user', parts: [{ text: systemPrompt }] })
    contents.push({ role: 'model', parts: [{ text: 'Understood. I will follow these instructions.' }] })
  }
  contents.push({ role: 'user', parts: [{ text: prompt }] })

  const body = {
    contents,
    generationConfig: {
      temperature,
      maxOutputTokens,
      ...(jsonMode && !parseJson && { responseMimeType: 'application/json' }),
    },
  }

  // Use gemini-2.0-flash-lite for 30 RPM free tier (vs 15 RPM for regular flash)
  const model = 'gemini-2.0-flash-lite'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const res = await fetchWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini ${res.status}: ${err.substring(0, 300)}`)
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    const reason = data.candidates?.[0]?.finishReason || 'unknown'
    throw new Error(`Gemini returned no content (${reason})`)
  }

  if (jsonMode || parseJson) return extractJson(text)
  return text
}

// ——— Gemini multi-turn chat ———
async function chatGemini(messages, options = {}) {
  const {
    temperature = 0.6,
    maxOutputTokens = 1024,
    jsonMode = false,
    parseJson = false,
    apiKey = localStorage.getItem('meridian-gemini-key') || import.meta.env.VITE_GEMINI_API_KEY || '',
  } = options

  if (!apiKey) throw new Error('Gemini API key not set')

  // Convert OpenAI-style messages to Gemini format
  const contents = []
  let systemInstruction = null

  for (const msg of messages) {
    if (msg.role === 'system') {
      systemInstruction = msg.content
      continue
    }
    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })
  }

  // Inject system prompt as first exchange if present
  if (systemInstruction) {
    contents.unshift(
      { role: 'user', parts: [{ text: systemInstruction }] },
      { role: 'model', parts: [{ text: 'Understood. I will follow these instructions.' }] },
    )
  }

  const body = {
    contents,
    generationConfig: {
      temperature,
      maxOutputTokens,
      ...(jsonMode && !parseJson && { responseMimeType: 'application/json' }),
    },
  }

  const model = 'gemini-2.0-flash-lite'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const res = await fetchWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini ${res.status}: ${err.substring(0, 300)}`)
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini returned no content')

  if (jsonMode || parseJson) return extractJson(text)
  return text
}

// ——— Groq (fallback) ———
async function callGroqAPI(prompt, options = {}) {
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
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
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

// ——— Smart router: Gemini first, Groq fallback ———
export async function callAI(prompt, options = {}) {
  const geminiKey = localStorage.getItem('meridian-gemini-key') || import.meta.env.VITE_GEMINI_API_KEY
  const groqKey = localStorage.getItem('meridian-groq-key') || import.meta.env.VITE_GROQ_API_KEY

  if (geminiKey) {
    try {
      return await callGeminiAPI(prompt, { ...options, apiKey: geminiKey })
    } catch (err) {
      console.warn('[AI] Gemini failed, trying Groq:', err.message)
      if (groqKey) return await callGroqAPI(prompt, { ...options, apiKey: groqKey, maxTokens: options.maxOutputTokens || options.maxTokens || 2048 })
      throw err
    }
  }

  if (groqKey) return await callGroqAPI(prompt, options)
  throw new Error('No AI API key set. Add your Gemini key in Settings.')
}

// ——— Chat completion with message history ———
export async function chatCompletion(messages, options = {}) {
  const geminiKey = localStorage.getItem('meridian-gemini-key') || import.meta.env.VITE_GEMINI_API_KEY
  const groqKey = localStorage.getItem('meridian-groq-key') || import.meta.env.VITE_GROQ_API_KEY

  if (geminiKey) {
    try {
      return await chatGemini(messages, { ...options, apiKey: geminiKey })
    } catch (err) {
      console.warn('[AI] Gemini chat failed, trying Groq:', err.message)
      if (groqKey) {
        // Convert to Groq format
        const body = {
          model: 'llama-3.3-70b-versatile',
          messages,
          temperature: options.temperature || 0.6,
          max_tokens: options.maxOutputTokens || options.maxTokens || 1024,
        }
        const res = await fetchWithRetry('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error(`Groq ${res.status}`)
        const data = await res.json()
        const text = data.choices?.[0]?.message?.content
        if (!text) throw new Error('Groq returned no content')
        if (options.jsonMode || options.parseJson) return extractJson(text)
        return text
      }
      throw err
    }
  }

  if (groqKey) {
    const body = {
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: options.temperature || 0.6,
      max_tokens: options.maxTokens || 1024,
    }
    const res = await fetchWithRetry('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`Groq ${res.status}`)
    const data = await res.json()
    return data.choices?.[0]?.message?.content || ''
  }

  throw new Error('No AI API key set.')
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
export const callGroq = callAI
export const callGemini = callAI
