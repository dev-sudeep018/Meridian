/**
 * arXiv API wrapper.
 * Searches for recent papers using the Atom feed API.
 * No auth required; respectful rate limiting recommended.
 */
const xml2js = require("xml2js");

async function searchArxiv(query, options = {}) {
  const { maxResults = 5, sortBy = "submittedDate" } = options;

  const params = new URLSearchParams({
    search_query: `all:${query}`,
    start: "0",
    max_results: String(maxResults),
    sortBy,
    sortOrder: "descending",
  });

  const url = `http://export.arxiv.org/api/query?${params}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`arXiv API error: ${response.status}`);
  }

  const xml = await response.text();
  const parser = new xml2js.Parser({ explicitArray: false, trim: true });
  const parsed = await parser.parseStringPromise(xml);

  const entries = parsed.feed?.entry;
  if (!entries) return [];

  const items = Array.isArray(entries) ? entries : [entries];

  return items.map((entry) => {
    const links = Array.isArray(entry.link) ? entry.link : [entry.link];
    const pdfLink = links.find((l) => l?.$?.type === "application/pdf");
    const htmlLink = links.find((l) => l?.$?.rel === "alternate");

    return {
      title: entry.title?.replace(/\s+/g, " ").trim(),
      summary: entry.summary?.replace(/\s+/g, " ").trim().substring(0, 500),
      authors: Array.isArray(entry.author)
        ? entry.author.map((a) => a.name)
        : [entry.author?.name],
      published: entry.published,
      updated: entry.updated,
      pdfUrl: pdfLink?.$?.href || null,
      htmlUrl: htmlLink?.$?.href || null,
      categories: Array.isArray(entry.category)
        ? entry.category.map((c) => c.$?.term)
        : [entry.category?.$?.term],
    };
  });
}

module.exports = { searchArxiv };
