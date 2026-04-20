/**
 * Client-side AI API wrappers.
 * Calls Gemini and Groq directly from the browser with retry logic.
 */

const MAX_RETRIES = 2
const RETRY_DELAY = 3000

async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options)
      if (res.status === 429 || res.status === 503) {
        // Rate limited — wait and retry
        const delay = RETRY_DELAY * (i + 1)
        console.warn(`Rate limited (${res.status}), retrying in ${delay}ms...`)
        await new Promise(r => setTimeout(r, delay))
        continue
      }
      return res
    } catch (err) {
      if (i === retries) throw err
      console.warn(`Fetch failed, retry ${i + 1}/${retries}:`, err.message)
      await new Promise(r => setTimeout(r, RETRY_DELAY))
    }
  }
}

export async function callGemini(prompt, options = {}) {
  const {
    temperature = 0.3,
    maxOutputTokens = 4096,
    jsonMode = false,
    apiKey = localStorage.getItem('meridian-gemini-key') || import.meta.env.VITE_GEMINI_API_KEY || '',
  } = options

  if (!apiKey) throw new Error('Gemini API key not set — add it in Settings')

  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature,
      maxOutputTokens,
      ...(jsonMode && { responseMimeType: 'application/json' }),
    },
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

  const res = await fetchWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini ${res.status}: ${err.substring(0, 200)}`)
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    console.warn('Gemini response:', JSON.stringify(data).substring(0, 300))
    throw new Error('Gemini returned no content')
  }

  if (jsonMode) {
    try { return JSON.parse(text) }
    catch {
      // Try cleaning markdown code fences
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      try { return JSON.parse(cleaned) }
      catch (e2) {
        console.error('Failed to parse Gemini JSON:', text.substring(0, 500))
        throw new Error('Gemini returned invalid JSON')
      }
    }
  }
  return text
}

export async function callGroq(prompt, options = {}) {
  const {
    temperature = 0.4,
    maxTokens = 2048,
    jsonMode = false,
    apiKey = localStorage.getItem('meridian-groq-key') || import.meta.env.VITE_GROQ_API_KEY || '',
  } = options

  if (!apiKey) throw new Error('Groq API key not set — add it in Settings')

  const body = {
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature,
    max_tokens: maxTokens,
    ...(jsonMode && { response_format: { type: 'json_object' } }),
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

  if (!text) {
    console.warn('Groq response:', JSON.stringify(data).substring(0, 300))
    throw new Error('Groq returned no content')
  }

  if (jsonMode) {
    try { return JSON.parse(text) }
    catch {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      try { return JSON.parse(cleaned) }
      catch (e2) {
        console.error('Failed to parse Groq JSON:', text.substring(0, 500))
        throw new Error('Groq returned invalid JSON')
      }
    }
  }
  return text
}
