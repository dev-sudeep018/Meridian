/**
 * HuggingFace Inference API wrapper.
 * Searches models and generates completions.
 * No auth required for model search; token optional for inference.
 */
async function searchHuggingFaceModels(query, options = {}) {
  const { limit = 5, sort = "downloads" } = options;

  const params = new URLSearchParams({
    search: query,
    limit: String(limit),
    sort,
    direction: "-1",
  });

  const url = `https://huggingface.co/api/models?${params}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HuggingFace API error: ${response.status}`);
  }

  const data = await response.json();

  return data.map((model) => ({
    modelId: model.modelId || model.id,
    pipeline: model.pipeline_tag,
    downloads: model.downloads,
    likes: model.likes,
    lastModified: model.lastModified,
    tags: model.tags?.slice(0, 10),
    url: `https://huggingface.co/${model.modelId || model.id}`,
  }));
}

module.exports = { searchHuggingFaceModels };
