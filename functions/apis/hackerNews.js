/**
 * Algolia HN (Hacker News) API wrapper.
 * Searches HN stories, comments, and polls.
 * No auth required; no rate limit published.
 */
async function searchHackerNews(query, options = {}) {
  const { hitsPerPage = 5, tags = "" } = options;

  const params = new URLSearchParams({
    query,
    hitsPerPage: String(hitsPerPage),
  });

  if (tags) params.set("tags", tags);

  const url = `https://hn.algolia.com/api/v1/search?${params}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HN Algolia API error: ${response.status}`);
  }

  const data = await response.json();

  return (data.hits || []).map((hit) => ({
    title: hit.title || hit.story_title || "",
    url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
    author: hit.author,
    points: hit.points,
    numComments: hit.num_comments,
    createdAt: hit.created_at,
    text: (hit.comment_text || hit.story_text || "").substring(0, 500),
    objectID: hit.objectID,
  }));
}

module.exports = { searchHackerNews };
