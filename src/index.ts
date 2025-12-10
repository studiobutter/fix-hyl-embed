import { Elysia } from "elysia";

// Type definitions
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

// Utility: Extract post ID or pre-post ID from various URL formats
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

// Utility: Follow redirects to get final URL
async function followRedirects(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
    });
    return response.url;
  } catch (e) {
    console.error("Error following redirects:", e);
    return url;
  }
}

// Utility: Resolve short link with ?q= parameter
async function resolveShortQuery(queryId: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://bbs-api-os.hoyolab.com/community/misc/api/transit?q=${queryId}`
    );
    let finalUrl = response.url;
    
    // Check if it's a social_sea_share redirect URL
    if (finalUrl.includes('social_sea_share/redirectUrl')) {
      // Extract the encoded URL parameter
      const urlMatch = finalUrl.match(/[?&]url=([^&]+)/);
      if (urlMatch) {
        // Decode the URL parameter
        const decodedUrl = decodeURIComponent(urlMatch[1]);
        finalUrl = decodedUrl;
      }
    }
    
    return finalUrl;
  } catch (e) {
    console.error("Error resolving query:", e);
    return null;
  }
}

// Utility: Get actual post ID from pre-post ID
async function getActualPostId(prePostId: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://bbs-api-os.hoyolab.com/community/post/wapi/getPostID?id=${prePostId}`
    );
    const data: any = await response.json();
    return data.data?.post_id || null;
  } catch (e) {
    console.error("Error getting actual post ID:", e);
    return null;
  }
}

// Utility: Fetch post data from HoYoLAB API
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
    const data: PostAPIResponse = await response.json();
    
    if (data.retcode !== 0) {
      console.error("API returned error:", data.message);
      return null;
    }
    
    return data.data.post;
  } catch (e) {
    console.error("Error fetching post data:", e);
    return null;
  }
}

// Generate Discord embed JSON
function generateEmbed(post: HoYoLabPost, postUrl: string) {
  const { post: postData, user, image_list, cover_list, video, game, ugc_module } = post;
  
  // Determine color from game
  const color = parseInt(game.color.replace("#", ""), 16);
  
  // Choose images: cover_list if has_cover, otherwise image_list
  const images = postData.has_cover ? cover_list : image_list;
  
  const embeds: any[] = [];
  
  // Main embed
  const mainEmbed: any = {
    author: {
      name: user.nickname,
      icon_url: user.avatar_url,
    },
    title: postData.subject,
    description: postData.desc,
    url: postUrl,
    color: color,
  };
  
  // Handle Video Posts (view_type = 5)
  if (postData.view_type === 5 && video) {
    if (video.sub_type === 0) {
      // YouTube video - use cover image
      mainEmbed.image = { url: video.cover };
    } else {
      // HoYoLAB CDN video - could link to video
      mainEmbed.image = { url: video.cover };
    }
  } else if (images && images.length > 0) {
    // Regular posts with images
    mainEmbed.image = { url: images[0].url };
  }
  
  // Handle Genius Column (Wonderland levels)
  if (ugc_module && ugc_module.ugc_levels && ugc_module.ugc_levels.length > 0) {
    const level = ugc_module.ugc_levels[0].level;
    mainEmbed.fields = [
      {
        name: level.level_name,
        value: `- [Open in Genshin](https://link.studiobutter.io.vn/ugc/wonderland?ugc_id=${level.level_id}&server=${level.region})\n- [View Level](https://act.hoyolab.com/ys/ugc_community/mx/#/pages/level-detail/index?id=${level.level_id}&region=${level.region})`,
      },
    ];
  }
  
  embeds.push(mainEmbed);
  
  // Additional image embeds (for posts with multiple images)
  if (images && images.length > 1) {
    for (let i = 1; i < images.length && i < 4; i++) {
      embeds.push({
        url: postUrl,
        image: { url: images[i].url },
      });
    }
  }
  
  return { embeds };
}

// Generate oEmbed response
function generateOEmbed(post: HoYoLabPost, postUrl: string) {
  const { post: postData, user } = post;
  
  return {
    version: "1.0",
    type: "link",
    author_name: user.nickname,
    author_url: postUrl,
    provider_name: "HoYoLAB",
    provider_url: "https://www.hoyolab.com",
    title: postData.subject,
    description: postData.desc,
  };
}

// Main Elysia server
const app = new Elysia()
  .get("/", () => ({
    message: "HoYoLAB Embed Fixer",
    endpoints: {
      short_query: "/q?q={query_id}&lang={lang}",
      short_redirect: "/sh?redirect={short_link_id}",
      long_link: "/post?post_id={post_id}&lang={lang}",
    },
  }))
  
  // Handle short links with ?q= parameter
  .get("/q", async ({ query }) => {
    const { q, lang = "en-us" } = query as any;
    
    if (!q) {
      return { error: "Missing q parameter" };
    }
    
    // Resolve the query parameter to get the final URL
    const finalUrl = await resolveShortQuery(q);
    if (!finalUrl) {
      return { error: "Failed to resolve short link" };
    }
    
    const extracted = extractPostId(finalUrl);
    if (!extracted) {
      return { 
        error: "Not a HoYoLAB post link", 
        original_url: finalUrl,
        message: "This link redirects to a non-HoYoLAB page"
      };
    }
    
    // If it's a pre-post ID, resolve it to actual post ID
    let postId = extracted.id;
    if (extracted.isPrePost) {
      const actualId = await getActualPostId(extracted.id);
      if (!actualId) {
        return { error: "Failed to resolve pre-post ID" };
      }
      postId = actualId;
    }
    
    const postData = await fetchPostData(postId, lang);
    if (!postData) {
      return { error: "Failed to fetch post data" };
    }
    
    return generateEmbed(postData, `https://www.hoyolab.com/article/${postId}`);
  })
  
  // Handle short links (hoyo.link redirects)
  .get("/sh", async ({ query }) => {
    const { redirect, lang = "en-us" } = query as any;
    
    if (!redirect) {
      return { error: "Missing redirect parameter" };
    }
    
    // Handle hoyo.link redirects
    const shortUrl = `https://hoyo.link/${redirect}`;
    const finalUrl = await followRedirects(shortUrl);
    
    const extracted = extractPostId(finalUrl);
    if (!extracted) {
      return { 
        error: "Not a HoYoLAB post link", 
        original_url: finalUrl,
        message: "This short link redirects to a non-HoYoLAB page"
      };
    }
    
    // If it's a pre-post ID, resolve it to actual post ID
    let postId = extracted.id;
    if (extracted.isPrePost) {
      const actualId = await getActualPostId(extracted.id);
      if (!actualId) {
        return { error: "Failed to resolve pre-post ID" };
      }
      postId = actualId;
    }
    
    const postData = await fetchPostData(postId, lang);
    if (!postData) {
      return { error: "Failed to fetch post data" };
    }
    
    return generateEmbed(postData, `https://www.hoyolab.com/article/${postId}`);
  })
  
  // Handle long links
  .get("/post", async ({ query }) => {
    const { post_id, lang = "en-us" } = query as any;
    
    if (!post_id) {
      return { error: "Missing post_id parameter" };
    }
    
    let actualPostId = post_id;
    
    // Check if this is a very long pre_post_id (article_pre format)
    // Pre-post IDs are typically much longer (18+ digits)
    if (post_id.length > 15) {
      const resolved = await getActualPostId(post_id);
      if (resolved) {
        actualPostId = resolved;
      } else {
        return { error: "Failed to resolve pre-post ID" };
      }
    }
    
    const postData = await fetchPostData(actualPostId, lang);
    if (!postData) {
      return { error: "Failed to fetch post data" };
    }
    
    return generateEmbed(postData, `https://www.hoyolab.com/article/${actualPostId}`);
  })
  
  // oEmbed endpoint
  .get("/oembed", async ({ query }) => {
    const { url, lang = "en-us" } = query as any;
    
    if (!url) {
      return { error: "Missing url parameter" };
    }
    
    const extracted = extractPostId(url);
    if (!extracted) {
      return { error: "Invalid HoYoLAB URL" };
    }
    
    // If it's a pre-post ID, resolve it to actual post ID
    let postId = extracted.id;
    if (extracted.isPrePost) {
      const actualId = await getActualPostId(extracted.id);
      if (!actualId) {
        return { error: "Failed to resolve pre-post ID" };
      }
      postId = actualId;
    }
    
    const postData = await fetchPostData(postId, lang);
    if (!postData) {
      return { error: "Failed to fetch post data" };
    }
    
    return generateOEmbed(postData, url);
  })
  
  .listen(3000);

console.log(
  `🦊 HoYoLAB Embed Fixer is running at ${app.server?.hostname}:${app.server?.port}`
);