/**
 * Client-side AI API wrappers.
 * Calls Gemini, Groq, and Tavily directly from the browser.
 * Keys are read from localStorage (set in Settings panel).
 */

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

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

  const res = await fetch(url, {
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
  if (!text) throw new Error('Gemini returned no content')

  if (jsonMode) {
    try { return JSON.parse(text) }
    catch { return JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()) }
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

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
  const text = data.choices[0].message.content

  if (jsonMode) {
    try { return JSON.parse(text) }
    catch { return JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()) }
  }
  return text
}
