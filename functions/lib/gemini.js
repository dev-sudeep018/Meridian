/**
 * Gemini 2.5 Flash API wrapper for Firebase Cloud Functions.
 * Uses native fetch (Node.js 20+).
 */
async function callGemini(prompt, options = {}) {
  const {
    temperature = 0.3,
    maxOutputTokens = 4096,
    jsonMode = false,
    apiKey = process.env.GEMINI_API_KEY,
  } = options;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature,
      maxOutputTokens,
      ...(jsonMode && { responseMimeType: "application/json" }),
    },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errText}`);
  }

  const data = await response.json();

  if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
    throw new Error("Gemini returned no content");
  }

  const text = data.candidates[0].content.parts[0].text;

  if (jsonMode) {
    try {
      return JSON.parse(text);
    } catch {
      // Sometimes the model wraps JSON in markdown code blocks
      const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleaned);
    }
  }

  return text;
}

module.exports = { callGemini };
