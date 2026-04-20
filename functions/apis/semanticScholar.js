/**
 * Semantic Scholar API wrapper.
 * Searches academic papers with relevance scoring.
 * No auth required; 100 reqs/5min without API key.
 */
async function searchSemanticScholar(query, options = {}) {
  const { limit = 5, fields = "title,abstract,url,year,citationCount,authors,externalIds" } = options;

  const params = new URLSearchParams({
    query,
    limit: String(limit),
    fields,
  });

  const url = `https://api.semanticscholar.org/graph/v1/paper/search?${params}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Semantic Scholar API error: ${response.status}`);
  }

  const data = await response.json();

  return (data.data || []).map((paper) => ({
    paperId: paper.paperId,
    title: paper.title,
    abstract: paper.abstract?.substring(0, 500),
    year: paper.year,
    citationCount: paper.citationCount,
    url: paper.url,
    authors: (paper.authors || []).slice(0, 3).map((a) => a.name),
    doi: paper.externalIds?.DOI || null,
    arxivId: paper.externalIds?.ArXiv || null,
  }));
}

module.exports = { searchSemanticScholar };
