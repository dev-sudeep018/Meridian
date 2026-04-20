/**
 * Tavily Search API wrapper.
 * AI-optimized web search for real-time data.
 * Auth: API key required.
 */
async function searchTavily(query, options = {}) {
  const {
    maxResults = 5,
    searchDepth = "basic",
    includeAnswer = true,
    apiKey = process.env.TAVILY_API_KEY,
  } = options;

  if (!apiKey) {
    throw new Error("TAVILY_API_KEY is not set");
  }

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: maxResults,
      search_depth: searchDepth,
      include_answer: includeAnswer,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Tavily API error: ${response.status}: ${errText}`);
  }

  const data = await response.json();

  return {
    answer: data.answer || null,
    results: (data.results || []).map((r) => ({
      title: r.title,
      url: r.url,
      content: r.content?.substring(0, 500),
      score: r.score,
      publishedDate: r.published_date,
    })),
  };
}

module.exports = { searchTavily };
