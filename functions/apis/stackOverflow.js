/**
 * Stack Overflow API wrapper.
 * Searches for questions related to developer frustrations.
 * Endpoint: /2.3/search/advanced (no auth required, 300 reqs/day)
 */
async function searchStackOverflow(query, options = {}) {
  const { pageSize = 5, sort = "votes", tagged = "" } = options;

  const params = new URLSearchParams({
    order: "desc",
    sort,
    q: query,
    site: "stackoverflow",
    pagesize: String(pageSize),
    filter: "withbody",
  });

  if (tagged) params.set("tagged", tagged);

  const url = `https://api.stackexchange.com/2.3/search/advanced?${params}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`StackOverflow API error: ${response.status}`);
  }

  const data = await response.json();

  return (data.items || []).map((item) => ({
    title: item.title,
    link: item.link,
    score: item.score,
    answerCount: item.answer_count,
    isAnswered: item.is_answered,
    viewCount: item.view_count,
    creationDate: item.creation_date,
    tags: item.tags,
    body: item.body?.substring(0, 500),
  }));
}

module.exports = { searchStackOverflow };
