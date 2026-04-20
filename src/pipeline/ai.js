/**
 * Client-side AI API wrappers.
 * Calls Gemini and Groq directly from the browser with retry logic.
 */

async function fetchWithRetry(url, options, retries = 3) {
  let lastError = null
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options)
      if (res.status === 429 || res.status === 503) {
        // Rate limited — wait longer each retry
        const delay = 5000 * (i + 1) // 5s, 10s, 15s, 20s
        console.warn(`[AI] Rate limited (${res.status}), waiting ${delay / 1000}s before retry ${i + 1}/${retries}...`)
        if (i === retries) {
          // Final attempt failed — throw descriptive error
          throw new Error(`API rate limit exceeded after ${retries} retries. Please wait 60 seconds and try again.`)
        }
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

  // Use gemini-2.0-flash-lite for higher rate limits (30 RPM vs 15 RPM)
  const model = 'gemini-2.0-flash-lite'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

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
    const blockReason = data.candidates?.[0]?.finishReason
    console.warn('[Gemini] No content. Finish reason:', blockReason, 'Full response:', JSON.stringify(data).substring(0, 500))
    throw new Error(`Gemini returned no content (${blockReason || 'unknown reason'})`)
  }

  if (jsonMode) {
    try { return JSON.parse(text) }
    catch {
      // Try cleaning markdown code fences
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      try { return JSON.parse(cleaned) }
      catch (e2) {
        console.error('[Gemini] Invalid JSON:', text.substring(0, 500))
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
    console.warn('[Groq] No content. Response:', JSON.stringify(data).substring(0, 300))
    throw new Error('Groq returned no content')
  }

  if (jsonMode) {
    try { return JSON.parse(text) }
    catch {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      try { return JSON.parse(cleaned) }
      catch (e2) {
        console.error('[Groq] Invalid JSON:', text.substring(0, 500))
        throw new Error('Groq returned invalid JSON')
      }
    }
  }
  return text
}
