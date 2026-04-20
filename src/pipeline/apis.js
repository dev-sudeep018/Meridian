/**
 * Client-side external API wrappers.
 * All free APIs called directly from the browser.
 */

// Stack Overflow
export async function searchStackOverflow(query, { pageSize = 5 } = {}) {
  const params = new URLSearchParams({
    order: 'desc', sort: 'votes', site: 'stackoverflow',
    intitle: query.substring(0, 80), pagesize: pageSize, filter: 'default',
  })
  const res = await fetch(`https://api.stackexchange.com/2.3/search/advanced?${params}`)
  if (!res.ok) return []
  const data = await res.json()
  return (data.items || []).map(q => ({
    title: q.title, url: `https://stackoverflow.com/q/${q.question_id}`,
    score: q.score, answerCount: q.answer_count, isAnswered: q.is_answered,
    creationDate: new Date(q.creation_date * 1000).toISOString(),
  }))
}

// GitHub Issues
export async function searchGithubIssues(query, { perPage = 5 } = {}) {
  const res = await fetch(
    `https://api.github.com/search/issues?q=${encodeURIComponent(query + ' is:issue is:open')}&sort=comments&per_page=${perPage}`,
    { headers: { Accept: 'application/vnd.github.v3+json' } }
  )
  if (!res.ok) return []
  const data = await res.json()
  return (data.items || []).map(i => ({
    title: i.title, url: i.html_url, comments: i.comments,
    user: i.user?.login, createdAt: i.created_at, repo: i.repository_url?.split('/').slice(-2).join('/'),
  }))
}

// Hacker News (Algolia)
export async function searchHackerNews(query, { hitsPerPage = 5, tags = 'story' } = {}) {
  const res = await fetch(
    `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=${tags}&hitsPerPage=${hitsPerPage}`
  )
  if (!res.ok) return []
  const data = await res.json()
  return (data.hits || []).map(h => ({
    title: h.title || h.comment_text?.substring(0, 100),
    url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
    points: h.points, author: h.author, createdAt: h.created_at,
  }))
}

// arXiv
export async function searchArxiv(query, { maxResults = 5 } = {}) {
  const res = await fetch(
    `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&sortBy=submittedDate&sortOrder=descending&max_results=${maxResults}`
  )
  if (!res.ok) return []
  const text = await res.text()
  // Simple XML parsing for arxiv
  const entries = []
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
  let match
  while ((match = entryRegex.exec(text)) !== null) {
    const entry = match[1]
    const get = (tag) => { const m = entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`)); return m ? m[1].trim() : '' }
    entries.push({
      title: get('title').replace(/\n/g, ' '),
      summary: get('summary').substring(0, 300),
      published: get('published'),
      url: (entry.match(/href="(https:\/\/arxiv[^"]+)"/) || [])[1] || '',
    })
  }
  return entries
}

// HuggingFace
export async function searchHuggingFace(query, { limit = 5 } = {}) {
  const res = await fetch(
    `https://huggingface.co/api/models?search=${encodeURIComponent(query)}&sort=lastModified&direction=-1&limit=${limit}`
  )
  if (!res.ok) return []
  const data = await res.json()
  return data.map(m => ({
    id: m.modelId, url: `https://huggingface.co/${m.modelId}`,
    lastModified: m.lastModified, downloads: m.downloads, likes: m.likes,
  }))
}

// OpenAlex
export async function searchOpenAlex(query, { perPage = 3 } = {}) {
  const res = await fetch(
    `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=${perPage}&mailto=meridian@app.com`
  )
  if (!res.ok) return []
  const data = await res.json()
  return (data.results || []).map(w => ({
    title: w.title, url: w.doi || w.id,
    year: w.publication_year, cited: w.cited_by_count,
    abstract: w.abstract_inverted_index ? Object.keys(w.abstract_inverted_index).slice(0, 30).join(' ') : '',
  }))
}

// Semantic Scholar
export async function searchSemanticScholar(query, { limit = 3 } = {}) {
  const res = await fetch(
    `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=title,abstract,year,url`
  )
  if (!res.ok) return []
  const data = await res.json()
  return (data.data || []).map(p => ({
    title: p.title, url: p.url, year: p.year,
    abstract: p.abstract?.substring(0, 300) || '',
  }))
}

// Tavily
export async function searchTavily(query, { maxResults = 3 } = {}) {
  const apiKey = localStorage.getItem('meridian-tavily-key') || import.meta.env.VITE_TAVILY_API_KEY || ''
  if (!apiKey) return { results: [] }
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey, query, max_results: maxResults, search_depth: 'basic' }),
  })
  if (!res.ok) return { results: [] }
  return await res.json()
}
