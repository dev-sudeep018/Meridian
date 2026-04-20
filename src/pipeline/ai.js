/**
 * Client-side AI wrapper — 100% Groq only.
 * No Gemini dependency at all.
 */

async function fetchWithRetry(url, options, retries = 3) {
  let lastError = null
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options)
      if (res.status === 429 || res.status === 503) {
        const delay = 5000 * (i + 1)
        console.warn(`[Groq] ${res.status}, waiting ${delay / 1000}s (retry ${i + 1}/${retries})...`)
        if (i === retries) throw new Error(`Groq rate limited after ${retries} retries. Wait 60s and try again.`)
        await new Promise(r => setTimeout(r, delay))
        continue
      }
      return res
    } catch (err) {
      lastError = err
      if (i === retries) throw err
      console.warn(`[Groq] Error, retry ${i + 1}/${retries}:`, err.message)
      await new Promise(r => setTimeout(r, 3000 * (i + 1)))
    }
  }
  throw lastError || new Error('All retries exhausted')
}

export async function callGroq(prompt, options = {}) {
  const {
    temperature = 0.4,
    maxTokens = 2048,
    jsonMode = false,
    parseJson = false, // parse JSON from text without strict API validation
    apiKey = localStorage.getItem('meridian-groq-key') || import.meta.env.VITE_GROQ_API_KEY || '',
  } = options

  if (!apiKey) throw new Error('Groq API key not set — add it in Settings')

  // Only use strict json_object mode when jsonMode is true AND parseJson is false
  const useStrictJson = jsonMode && !parseJson

  const body = {
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
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

  if (!text) {
    console.warn('[Groq] No content:', JSON.stringify(data).substring(0, 300))
    throw new Error('Groq returned no content')
  }

  if (jsonMode || parseJson) {
    return extractJson(text)
  }
  return text
}

// Robust JSON extraction — handles code fences, leading text, etc.
function extractJson(text) {
  // Try direct parse first
  try { return JSON.parse(text) } catch {}
  // Try removing markdown code fences
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  try { return JSON.parse(cleaned) } catch {}
  // Try finding JSON object in the text
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[0]) } catch {}
  }
  console.error('[Groq] Could not extract JSON:', text.substring(0, 500))
  throw new Error('Could not extract JSON from response')
}

// Legacy export for any code that might still reference it
export const callGemini = callGroq
