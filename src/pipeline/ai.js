/**
 * Multi-Provider AI Router
 * Rotates across Gemini + Groq free tiers for ~4,500 free calls/day.
 * 
 * Provider priority:
 *   Chatbot/Overseer → Gemini 2.5 Flash (best reasoning)
 *   Pipeline agents  → Gemini 2.0 Flash → Groq DeepSeek R1 → Groq Llama 3.3
 */

// ——— Retry logic ———
async function fetchWithRetry(url, options, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options)
      if (res.status === 429 || res.status === 503) {
        if (i === retries) return res // Return the 429/503 so caller can try next provider
        const delay = 3000 * (i + 1)
        console.warn(`[AI] ${res.status}, waiting ${delay / 1000}s...`)
        await new Promise(r => setTimeout(r, delay))
        continue
      }
      return res
    } catch (err) {
      if (i === retries) throw err
      await new Promise(r => setTimeout(r, 2000 * (i + 1)))
    }
  }
}

// ——— Provider definitions ———
const PROVIDERS = {
  'gemini-25-flash': {
    name: 'Gemini 2.5 Flash',
    type: 'gemini',
    model: 'gemini-2.5-flash-preview-04-17',
    envKey: 'VITE_GEMINI_API_KEY',
    localKey: 'meridian-gemini-key',
    rpm: 10,
  },
  'gemini-20-flash': {
    name: 'Gemini 2.0 Flash',
    type: 'gemini',
    model: 'gemini-2.0-flash',
    envKey: 'VITE_GEMINI_API_KEY',
    localKey: 'meridian-gemini-key',
    rpm: 15,
  },
  'gemini-20-lite': {
    name: 'Gemini 2.0 Flash Lite',
    type: 'gemini',
    model: 'gemini-2.0-flash-lite',
    envKey: 'VITE_GEMINI_API_KEY',
    localKey: 'meridian-gemini-key',
    rpm: 30,
  },
  'groq-deepseek-r1': {
    name: 'Groq DeepSeek R1',
    type: 'groq',
    model: 'deepseek-r1-distill-llama-70b',
    envKey: 'VITE_GROQ_API_KEY',
    localKey: 'meridian-groq-key',
    rpm: 30,
  },
  'groq-llama': {
    name: 'Groq Llama 3.3',
    type: 'groq',
    model: 'llama-3.3-70b-versatile',
    envKey: 'VITE_GROQ_API_KEY',
    localKey: 'meridian-groq-key',
    rpm: 30,
  },
}

// Provider chains for different use cases
const CHAINS = {
  chat: ['gemini-25-flash', 'gemini-20-flash', 'gemini-20-lite', 'groq-llama'],
  overseer: ['gemini-25-flash', 'gemini-20-flash', 'groq-deepseek-r1'],
  agent: ['gemini-20-flash', 'gemini-20-lite', 'groq-deepseek-r1', 'groq-llama'],
  code: ['gemini-20-flash', 'groq-llama', 'gemini-20-lite'],
}

function getApiKey(provider) {
  return localStorage.getItem(provider.localKey) || import.meta.env[provider.envKey] || ''
}

// ——— Gemini API call ———
async function callGeminiProvider(provider, messages, options) {
  const apiKey = getApiKey(provider)
  if (!apiKey) return null

  const { temperature = 0.4, maxTokens = 4096, jsonMode = false, parseJson = false } = options

  // Convert messages to Gemini format
  const contents = []
  let systemText = null

  for (const msg of messages) {
    if (msg.role === 'system') { systemText = msg.content; continue }
    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })
  }

  if (systemText) {
    contents.unshift(
      { role: 'user', parts: [{ text: systemText }] },
      { role: 'model', parts: [{ text: 'Understood.' }] },
    )
  }

  const body = {
    contents,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
      ...(jsonMode && !parseJson && { responseMimeType: 'application/json' }),
    },
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${provider.model}:generateContent?key=${apiKey}`
  const res = await fetchWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) return null // Let caller try next provider

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) return null

  if (jsonMode || parseJson) return extractJson(text)
  return text
}

// ——— Groq API call ———
async function callGroqProvider(provider, messages, options) {
  const apiKey = getApiKey(provider)
  if (!apiKey) return null

  const { temperature = 0.4, maxTokens = 4096, jsonMode = false, parseJson = false } = options
  const useStrictJson = jsonMode && !parseJson

  // Clean <think> tags from DeepSeek R1 responses
  const isR1 = provider.model.includes('deepseek-r1')

  const body = {
    model: provider.model,
    messages,
    temperature,
    max_tokens: maxTokens,
    ...(useStrictJson && !isR1 && { response_format: { type: 'json_object' } }),
  }

  const res = await fetchWithRetry('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) return null

  const data = await res.json()
  let text = data.choices?.[0]?.message?.content
  if (!text) return null

  // Strip DeepSeek R1 thinking tags
  if (isR1) {
    text = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
  }

  if (jsonMode || parseJson) return extractJson(text)
  return text
}

// ——— Unified provider call ———
async function callWithProvider(providerId, messages, options) {
  const provider = PROVIDERS[providerId]
  if (!provider) return null

  if (provider.type === 'gemini') return await callGeminiProvider(provider, messages, options)
  if (provider.type === 'groq') return await callGroqProvider(provider, messages, options)
  return null
}

// ——— Chain execution: try providers in order ———
async function callChain(chain, messages, options) {
  const chainIds = CHAINS[chain] || CHAINS.agent
  const errors = []

  for (const providerId of chainIds) {
    try {
      console.log(`[AI] Trying ${PROVIDERS[providerId].name}...`)
      const result = await callWithProvider(providerId, messages, options)
      if (result !== null) {
        console.log(`[AI] ${PROVIDERS[providerId].name} succeeded`)
        return result
      }
      console.warn(`[AI] ${PROVIDERS[providerId].name} returned null, trying next...`)
    } catch (err) {
      console.warn(`[AI] ${PROVIDERS[providerId].name} failed: ${err.message}`)
      errors.push(`${PROVIDERS[providerId].name}: ${err.message}`)
    }
  }

  throw new Error(`All providers failed: ${errors.join('; ')}`)
}

// ——— Public API ———

// Single prompt call (for pipeline agents)
export async function callAI(prompt, options = {}) {
  const { systemPrompt = null, chain = 'agent', ...rest } = options
  const messages = []
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt })
  messages.push({ role: 'user', content: prompt })
  return await callChain(chain, messages, rest)
}

// Multi-turn chat (for chatbot)
export async function chatCompletion(messages, options = {}) {
  return await callChain(options.chain || 'chat', messages, options)
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
