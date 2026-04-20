/**
 * GitHub API wrapper.
 * Searches issues and creates repositories.
 * Auth: Bearer token from GITHUB_TOKEN secret.
 */
async function searchGithubIssues(query, options = {}) {
  const { perPage = 5, token = process.env.GITHUB_TOKEN } = options;

  const params = new URLSearchParams({
    q: `${query} is:issue is:open`,
    sort: "reactions",
    order: "desc",
    per_page: String(perPage),
  });

  const headers = { Accept: "application/vnd.github.v3+json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(
    `https://api.github.com/search/issues?${params}`,
    { headers }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const data = await response.json();

  return (data.items || []).map((item) => ({
    title: item.title,
    url: item.html_url,
    reactions: item.reactions?.total_count || 0,
    comments: item.comments,
    createdAt: item.created_at,
    repository: item.repository_url?.split("/").slice(-2).join("/"),
    body: item.body?.substring(0, 500),
  }));
}

async function createGithubRepo(name, description, files, options = {}) {
  const { token = process.env.GITHUB_TOKEN } = options;

  if (!token) {
    console.warn("GITHUB_TOKEN not set, skipping repo creation");
    return { url: null, created: false };
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
  };

  // Create repo
  const createResponse = await fetch("https://api.github.com/user/repos", {
    method: "POST",
    headers,
    body: JSON.stringify({
      name,
      description,
      auto_init: true,
      private: false,
    }),
  });

  if (!createResponse.ok) {
    const err = await createResponse.text();
    throw new Error(`GitHub repo creation failed: ${err}`);
  }

  const repo = await createResponse.json();

  // Add files via Contents API
  for (const file of files) {
    await fetch(
      `https://api.github.com/repos/${repo.full_name}/contents/${file.path}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify({
          message: `Add ${file.path}`,
          content: Buffer.from(file.content).toString("base64"),
        }),
      }
    );
  }

  return { url: repo.html_url, created: true };
}

module.exports = { searchGithubIssues, createGithubRepo };
