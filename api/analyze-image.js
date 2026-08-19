const MAX_IMAGE_BYTES = 300 * 1024;
const TAG_GROUPS = ['人物', '服饰', '场景', '摄影风格', '动作', '情感'];

function sendJson(res, status, body) {
  res.status(status).json(body);
}

function parseDataUrl(image) {
  const match = String(image || '').match(/^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return null;
  return { mediaType: match[1], base64: match[2], bytes: Buffer.byteLength(match[2], 'base64') };
}

function normalizeTags(value) {
  const tags = [];
  const seen = new Set();
  for (const group of TAG_GROUPS) {
    const values = Array.isArray(value?.[group]) ? value[group] : [];
    for (const item of values) {
      const tag = String(item || '').trim().replace(/^[人物服饰场景摄影风格动作情感]+[：:]\s*/, '');
      const key = tag.toLowerCase();
      if (tag && tag.length <= 24 && !seen.has(key)) {
        seen.add(key);
        tags.push(tag);
      }
    }
  }
  return tags.slice(0, 36);
}

function extractJson(text) {
  const clean = String(text || '').replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('INVALID_MODEL_RESPONSE');
  return JSON.parse(clean.slice(start, end + 1));
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'METHOD_NOT_ALLOWED' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return sendJson(res, 503, { error: 'VISION_NOT_CONFIGURED' });

  const parsed = parseDataUrl(req.body?.image);
  if (!parsed) return sendJson(res, 400, { error: 'INVALID_IMAGE' });
  if (parsed.bytes > MAX_IMAGE_BYTES) return sendJson(res, 413, { error: 'IMAGE_TOO_LARGE' });

  const prompt = `分析这张图片，为图库搜索生成简洁、客观、可检索的中文标签。必须严格按照以下六个维度返回 JSON，不要输出 markdown 或其他文字：\n{
  "人物": ["人数、性别呈现、年龄段、发型等可见特征"],
  "服饰": ["服装品类、颜色、材质、风格、配饰"],
  "场景": ["地点、背景、时间或环境"],
  "摄影风格": ["景别、构图、光线、色调、媒介风格"],
  "动作": ["姿势、朝向、互动"],
  "情感": ["表情、氛围、情绪"]
}\n每个维度 1-5 个短标签；看不清或不适用则返回空数组；不要猜测身份、族裔、健康、宗教等敏感属性；不要在标签前重复维度名称。`;

  try {
    const model = process.env.GEMINI_VISION_MODEL || 'gemini-2.5-flash';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: parsed.mediaType, data: parsed.base64 } }] }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      console.error('Gemini image analysis failed', response.status, payload?.error?.message || payload);
      return sendJson(res, 502, { error: 'VISION_REQUEST_FAILED' });
    }
    const text = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '';
    const groups = extractJson(text);
    return sendJson(res, 200, { groups, tags: normalizeTags(groups) });
  } catch (error) {
    console.error('Image analysis failed', error);
    return sendJson(res, 500, { error: 'VISION_ANALYSIS_FAILED' });
  }
};
