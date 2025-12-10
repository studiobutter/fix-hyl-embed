import { Elysia } from "elysia";

/* ============================================================================
   Interfaces
============================================================================ */

interface HoYoLabPost {
  post: {
    post_id: string;
    subject: string;
    desc: string;
    view_type: number;
    has_cover: boolean;
    lang: string;
    game_id: number;
  };
  user: {
    nickname: string;
    avatar_url: string;
  };
  image_list: Array<{ url: string }>;
  cover_list: Array<{ url: string }>;
  video?: {
    cover: string;
    url: string;
    sub_type: number;
  };
  game: {
    color: string;
  };
  ugc_module?: {
    ugc_levels: Array<{
      level_id: string;
      level: {
        level_id: string;
        region: string;
        level_name: string;
      };
    }>;
  };
}

interface PostAPIResponse {
  retcode: number;
  message: string;
  data: {
    post: HoYoLabPost;
  };
}

/* ============================================================================
   Utilities
============================================================================ */

function extractPostId(url: string): { id: string; isPrePost: boolean } | null {
  const patterns = [
    { regex: /hoyolab\.com\/article_pre\/(\d+)/, isPrePost: true },
    { regex: /hoyolab\.com\/article\/(\d+)/, isPrePost: false },
    { regex: /hoyolab\.com\/#\/article\/(\d+)/, isPrePost: false },
    { regex: /m\.hoyolab\.com\/#\/article\/(\d+)/, isPrePost: false },
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern.regex);
    if (match) {
      return { id: match[1], isPrePost: pattern.isPrePost };
    }
  }
  return null;
}

// Follow redirects (works in Cloudflare Workers)
async function followRedirects(url: string): Promise<string> {
  try {
    const response = await fetch(url, { method: "GET", redirect: "follow" });
    return response.url;
  } catch {
    return url;
  }
}

// Resolve short ?q= links
async function resolveShortQuery(queryId: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://bbs-api-os.hoyolab.com/community/misc/api/transit?q=${queryId}`
    );

    let finalUrl = response.url;

    if (finalUrl.includes("social_sea_share/redirectUrl")) {
      const urlMatch = finalUrl.match(/[?&]url=([^&]+)/);
      if (urlMatch) finalUrl = decodeURIComponent(urlMatch[1]);
    }

    return finalUrl;
  } catch {
    return null;
  }
}

// Convert article_pre → real post ID
async function getActualPostId(prePostId: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://bbs-api-os.hoyolab.com/community/post/wapi/getPostID?id=${prePostId}`
    );
    const data = (await response.json()) as { data?: { post_id?: string } };
    return data.data?.post_id || null;
  } catch {
    return null;
  }
}

// Fetch post data
async function fetchPostData(
  postId: string,
  lang: string = "en-us"
): Promise<HoYoLabPost | null> {
  try {
    const response = await fetch(
      `https://bbs-api-os.hoyolab.com/community/post/wapi/getPostFull?post_id=${postId}&read=1&scene=1`,
      {
        headers: {
          "x-rpc-app_version": "4.0.0",
          "x-rpc-language": lang,
        },
      }
    );
    const data = (await response.json()) as PostAPIResponse;

    if (data.retcode !== 0) return null;

    return data.data.post;
  } catch {
    return null;
  }
}

/* ============================================================================
   HTML Embed Generator
============================================================================ */

function generateEmbedHTML(post: HoYoLabPost, postUrl: string): string {
  const { post: postData, user, image_list, cover_list, video, game } = post;

  const images = postData.has_cover ? cover_list : image_list;
  const mainImage = images?.[0]?.url ?? "";

  let embedImage = mainImage;
  if (postData.view_type === 5 && video) embedImage = video.cover;

  const cleanDesc = postData.desc.replace(/<[^>]*>/g, "");

  const themeColor = game.color;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">

<meta property="og:type" content="article">
<meta property="og:url" content="${postUrl}">
<meta property="og:title" content="${postData.subject}">
<meta property="og:description" content="${cleanDesc}">
${embedImage ? `<meta property="og:image" content="${embedImage}">` : ""}
<meta property="og:site_name" content="HoYoLAB">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${postData.subject}">
<meta name="twitter:description" content="${cleanDesc}">
${embedImage ? `<meta name="twitter:image" content="${embedImage}">` : ""}

<meta name="theme-color" content="${themeColor}">
<meta name="author" content="${user.nickname}">

<title>${postData.subject} - HoYoLAB</title>

<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
    max-width: 800px; margin: 40px auto; padding: 20px; background: #f5f5f5;
  }
  .container {
    background: white; border-radius: 12px; padding: 30px;
    box-shadow: 0 2px 8px rgba(0,0,0,.1);
  }
  .author { display:flex; align-items:center; gap:12px; margin-bottom:20px; }
  .author img { width:48px; height:48px; border-radius:50%; }
  h1 { margin:0 0 16px 0; }
  .image-gallery {
    display:grid; grid-template-columns:repeat(auto-fit,minmax(250px,1fr));
    gap:12px; margin-top:20px;
  }
  .image-gallery img { width:100%; border-radius:8px; }
  .redirect-btn {
    display:inline-block; background:${themeColor}; color:white;
    padding:12px 24px; border-radius:8px; margin-top:20px;
    text-decoration:none; font-weight:600;
  }
</style>

<script>
setTimeout(() => { window.location.href="${postUrl}" }, 3000);
</script>

</head>
<body>
<div class="container">
  <div class="author">
    <img src="${user.avatar_url}">
    <div>${user.nickname}</div>
  </div>
  <h1>${postData.subject}</h1>
  <div>${cleanDesc}</div>

  ${
    images && images.length > 0
      ? `<div class="image-gallery">${images
          .slice(0, 4)
          .map((i) => `<img src="${i.url}">`)
          .join("")}</div>`
      : ""
  }

  <a class="redirect-btn" href="${postUrl}">View on HoYoLAB</a>
</div>
</body>
</html>`;
}

/* ============================================================================
   oEmbed
============================================================================ */

function generateOEmbed(post: HoYoLabPost, postUrl: string) {
  const images = post.post.has_cover ? post.cover_list : post.image_list;
  const thumb = images?.[0]?.url ?? "";
  return {
    version: "1.0",
    type: "link",
    author_name: post.user.nickname,
    author_url: postUrl,
    provider_name: "HoYoLAB",
    provider_url: "https://www.hoyolab.com",
    title: post.post.subject,
    description: post.post.desc,
    thumbnail_url: thumb,
  };
}

/* ============================================================================
   Routes (same as your original)
============================================================================ */

const app = new Elysia({ aot: false })
  .get("/", () => ({
    message: "HoYoLAB Embed Fixer",
    endpoints: {
      short_query: "/q?q={query_id}&lang={lang}",
      short_redirect: "/sh?redirect={short_link_id}",
      long_link: "/post?post_id={post_id}&lang={lang}",
    },
  }))

  .get("/q", async ({ query, set }) => {
    const { q, lang = "en-us" } = query as any;
    if (!q) return (set.status = 400), { error: "Missing q parameter" };

    const finalUrl = await resolveShortQuery(q);
    if (!finalUrl) return (set.status = 500), { error: "Failed to resolve short link" };

    const extracted = extractPostId(finalUrl);
    if (!extracted)
      return (set.status = 400), {
        error: "Not a HoYoLAB post link",
        original_url: finalUrl,
      };

    let postId = extracted.id;
    if (extracted.isPrePost) {
      const actual = await getActualPostId(extracted.id);
      if (!actual) return (set.status = 500), { error: "Failed to resolve pre-post ID" };
      postId = actual;
    }

    const postData = await fetchPostData(postId, lang);
    if (!postData) return (set.status = 500), { error: "Failed to fetch post data" };

    set.headers["content-type"] = "text/html; charset=utf-8";
    return generateEmbedHTML(postData, `https://www.hoyolab.com/article/${postId}`);
  })

  .get("/sh", async ({ query, set }) => {
    const { redirect, lang = "en-us" } = query as any;
    if (!redirect) return (set.status = 400), { error: "Missing redirect parameter" };

    const finalUrl = await followRedirects(`https://hoyo.link/${redirect}`);
    const extracted = extractPostId(finalUrl);

    if (!extracted)
      return (set.status = 400), {
        error: "Not a HoYoLAB post link",
        original_url: finalUrl,
      };

    let postId = extracted.id;
    if (extracted.isPrePost) {
      const actual = await getActualPostId(extracted.id);
      if (!actual) return (set.status = 500), { error: "Failed to resolve pre-post ID" };
      postId = actual;
    }

    const postData = await fetchPostData(postId, lang);
    if (!postData) return (set.status = 500), { error: "Failed to fetch post data" };

    set.headers["content-type"] = "text/html; charset=utf-8";
    return generateEmbedHTML(postData, `https://www.hoyolab.com/article/${postId}`);
  })

  .get("/post", async ({ query, set }) => {
    const { post_id, lang = "en-us" } = query as any;
    if (!post_id) return (set.status = 400), { error: "Missing post_id" };

    let actual = post_id;
    if (post_id.length > 15) {
      const resolved = await getActualPostId(post_id);
      if (!resolved) return (set.status = 500), { error: "Failed to resolve pre-post ID" };
      actual = resolved;
    }

    const postData = await fetchPostData(actual, lang);
    if (!postData) return (set.status = 500), { error: "Failed to fetch post data" };

    set.headers["content-type"] = "text/html; charset=utf-8";
    return generateEmbedHTML(postData, `https://www.hoyolab.com/article/${actual}`);
  })

  .get("/oembed", async ({ query }) => {
    const { url, lang = "en-us" } = query as any;
    if (!url) return { error: "Missing url parameter" };

    const extracted = extractPostId(url);
    if (!extracted) return { error: "Invalid HoYoLAB URL" };

    let postId = extracted.id;
    if (extracted.isPrePost) {
      const actualId = await getActualPostId(extracted.id);
      if (!actualId) return { error: "Failed to resolve pre-post ID" };
      postId = actualId;
    }

    const postData = await fetchPostData(postId, lang);
    if (!postData) return { error: "Failed to fetch post data" };

    return generateOEmbed(postData, url);
  });

/* ============================================================================
   Cloudflare Worker Export
============================================================================ */

export default {
  fetch: (req: Request) => app.fetch(req),
};
