/**
 * Groq Llama 3.3 70B API wrapper for Firebase Cloud Functions.
 * Uses native fetch (Node.js 20+).
 */
async function callGroq(prompt, options = {}) {
  const {
    temperature = 0.4,
    maxTokens = 2048,
    jsonMode = false,
    apiKey = process.env.GROQ_API_KEY,
  } = options;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set");
  }

  const body = {
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature,
    max_tokens: maxTokens,
    ...(jsonMode && { response_format: { type: "json_object" } }),
  };

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const text = data.choices[0].message.content;

  if (jsonMode) {
    try {
      return JSON.parse(text);
    } catch {
      const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleaned);
    }
  }

  return text;
}

module.exports = { callGroq };
