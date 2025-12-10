// src/index.tsx
import { Elysia, t } from "elysia";
import { html } from "@elysiajs/html";
import type { HoYoResponse } from "./types";

// Headers required by HoYoLAB API
const BASE_HEADERS = {
  "x-rpc-app_version": "4.3.0",
  "User-Agent": "HoYoLAB/4.3.0",
};

const app = new Elysia()
  .use(html())
  .get("/", () => "HoYoLAB Embed Fixer is Running")

  // --- 1. Long Link Handler (e.g., /post?post_id=123) ---
  .get("/post", async ({ query, set }) => {
    const postId = query.post_id;
    const lang = query.lang || "en-us";

    if (!postId) {
      set.status = 400;
      return "Missing post_id";
    }

    const apiUrl = `https://bbs-api-os.hoyolab.com/community/post/wapi/getPostFull?post_id=${postId}&read=1&scene=1`;

    const response = await fetch(apiUrl, {
      headers: {
        ...BASE_HEADERS,
        "x-rpc-language": lang as string,
      },
    });

    const json = (await response.json()) as HoYoResponse;

    if (json.retcode !== 0 || !json.data?.post) {
      set.status = 404;
      return "Post not found or API error";
    }

    // Destructuring
    const { post, user, video, image_list, cover_list } = json.data.post;

    // --- PARSING LOGIC FIXED ---

    // 1. Title & Desc (Removed .post.post)
    const title = post.subject;
    const description =
      post.desc.slice(0, 200) + (post.desc.length > 200 ? "..." : "");
    const authorName = user.nickname;
    const color = "#25A0E7";

    // 2. Image Logic (Removed .post.cover_list)
    const images =
      post.cover_list && post.cover_list.length > 0
        ? post.cover_list
        : image_list;

    const mainImage = images.length > 0 ? images[0].url : "";

    // 3. Video Logic (Removed .post.view_type and added safety checks)
    let videoUrl = "";
    let isYouTube = false;

    if (post.view_type === 5 && video) {
      if (video.url.includes("youtube") || video.url.includes("youtu.be")) {
        isYouTube = true;
      } else {
        // We use ?. to safely access resolution if it exists
        videoUrl =
          video.resolution && video.resolution.length > 0
            ? video.resolution[0].url
            : video.url;
      }
    }
    // --- 3. Render HTML Meta Tags ---
    return (
      <html lang="en">
        <head lang="en">
          <meta charSet="UTF-8" />
          <title>{title}</title>

          {/* Open Graph Basic */}
          <meta property="og:site_name" content="HoYoLAB" />
          <meta
            property="og:url"
            content={`https://www.hoyolab.com/article/${postId}`}
          />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          <meta name="theme-color" content={color} />

          {/* Author (Discord supports this via 'author' field but standard OG uses article:author) */}
          <meta name="author" content={authorName} />

          {/* Image Handling */}
          {mainImage && (
            <>
              <meta property="og:image" content={mainImage} />
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:image" content={mainImage} />
            </>
          )}

          {/* Video Handling */}
          {!isYouTube && videoUrl && (
            <>
              <meta property="og:video" content={videoUrl} />
              <meta property="og:video:type" content="video/mp4" />
              <meta property="og:type" content="video.other" />
            </>
          )}
        </head>
        <body>
          {/* JavaScript Redirect to original post for real users */}
          <script>
            {`window.location.replace("https://www.hoyolab.com/article/${postId}");`}
          </script>
          <p>Redirecting to HoYoLAB...</p>
        </body>
      </html>
    );
  })

  // --- 4. Short Link Handler (e.g., /s/123) ---
  // Matches https://hoyo.link/[id]
  .get("/s/:id", async ({ params, set }) => {
    const target = `https://hoyo.link/${params.id}`;

    // Bun's fetch automatically follows redirects
    const resp = await fetch(target);
    const finalUrl = resp.url;

    // Extract post_id from "hoyolab.com/article/[id]"
    const match = finalUrl.match(/article\/(\d+)/);

    if (match) {
      set.redirect = `/post?post_id=${match[1]}`;
    } else {
      // Not a post (e.g., game download), just send them there
      set.redirect = finalUrl;
    }
  })

  // --- 5. Transit Link Handler (e.g., /transit?q=123) ---
  // Matches logic for "transit?q=" from HoYoLAB's internal shortener
  .get(
    "/transit",
    async ({ query, set }) => {
      const qId = query.q;
      if (!qId) {
        set.status = 400;
        return "Missing query ID";
      }

      // Query the transit API
      const transitApiUrl = `https://bbs-api-os.hoyolab.com/community/misc/api/transit?q=${qId}`;
      const resp = await fetch(transitApiUrl);

      if (!resp.ok) {
        set.status = resp.status;
        return `Transit API error: ${resp.statusText}`;
      }

      const data = (await resp.json()) as { data?: { redirectUrl?: string } };
      const redirectUrl = data.data?.redirectUrl;

      if (!redirectUrl) {
        set.status = 404;
        return "Redirect URL not found in transit response";
      }

      // Extract post_id from the final redirect URL
      const match = redirectUrl.match(/article\/(\d+)/);

      if (match) {
        set.redirect = `/post?post_id=${match[1]}`;
      } else {
        // Not a post (e.g., game download), just send them there
        set.redirect = redirectUrl;
      }
    },
    {
      query: t.Object({ q: t.String() }), // Validate that 'q' query parameter is present
    }
  )

  .listen(3000);

console.log(
  `🦊 HoYoLAB Fixer is running at ${app.server?.hostname}:${app.server?.port}`
);
