/**
 * OpenAlex API wrapper.
 * Searches academic works across all fields.
 * No auth required; polite pool available with mailto.
 */
async function searchOpenAlex(query, options = {}) {
  const { perPage = 5, mailto = "meridian@example.com" } = options;

  const params = new URLSearchParams({
    search: query,
    per_page: String(perPage),
    sort: "cited_by_count:desc",
    mailto,
  });

  const url = `https://api.openalex.org/works?${params}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`OpenAlex API error: ${response.status}`);
  }

  const data = await response.json();

  return (data.results || []).map((work) => ({
    id: work.id,
    title: work.title,
    doi: work.doi,
    publicationDate: work.publication_date,
    citedByCount: work.cited_by_count,
    openAccessUrl: work.open_access?.oa_url || null,
    abstract: work.abstract_inverted_index
      ? reconstructAbstract(work.abstract_inverted_index)
      : null,
    concepts: (work.concepts || [])
      .slice(0, 5)
      .map((c) => ({ name: c.display_name, score: c.score })),
    authorships: (work.authorships || []).slice(0, 3).map((a) => ({
      name: a.author?.display_name,
      institution: a.institutions?.[0]?.display_name,
    })),
  }));
}

function reconstructAbstract(invertedIndex) {
  if (!invertedIndex) return null;
  const words = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) {
      words[pos] = word;
    }
  }
  return words.join(" ").substring(0, 500);
}

module.exports = { searchOpenAlex };
