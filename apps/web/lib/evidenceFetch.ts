import "server-only";

const MAX_CHARS = 6000;
const FETCH_TIMEOUT_MS = 10_000;
const MIN_USABLE_CHARS = 40;

export interface FetchedEvidence {
  text: string;
  status: "ok" | "failed";
}

/**
 * Best-effort server-side fetch + plain-text extraction of a source URL, so the
 * evidence a GonkaRouter model reasons over is the real page text, not an
 * admin's transcription of it. This is a minimal tag-stripper, not a
 * readability-grade extractor — some sites (paywalls, bot protection,
 * JS-rendered pages) will fail here; `status: "failed"` surfaces that in the
 * admin UI so the pasted-text fallback can be used instead.
 */
export async function fetchAndExtractText(url: string): Promise<FetchedEvidence> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(url, {
        signal: controller.signal,
        redirect: "follow",
        headers: {
          "user-agent": "Mozilla/5.0 (compatible; MySteadyAidEvidenceBot/1.0)",
          accept: "text/html,application/xhtml+xml,text/plain",
        },
      });
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) return { text: "", status: "failed" };

    const contentType = res.headers.get("content-type") ?? "";
    if (!/text\/html|application\/xhtml|text\/plain|xml/i.test(contentType)) {
      return { text: "", status: "failed" };
    }

    const html = await res.text();
    const text = htmlToText(html).slice(0, MAX_CHARS);
    if (text.trim().length < MIN_USABLE_CHARS) return { text, status: "failed" };
    return { text, status: "ok" };
  } catch {
    return { text: "", status: "failed" };
  }
}

function htmlToText(html: string): string {
  let s = html;
  s = s.replace(/<script[\s\S]*?<\/script>/gi, " ");
  s = s.replace(/<style[\s\S]*?<\/style>/gi, " ");
  s = s.replace(/<!--[\s\S]*?-->/g, " ");
  // Drop whole-page chrome that isn't article content — nav/sidebar/TOC/infobox
  // markup otherwise dominates the front of the extracted text (seen on
  // Wikipedia-style pages) and can push real content past the length cap.
  s = s.replace(/<nav[\s\S]*?<\/nav>/gi, " ");
  s = s.replace(/<header[\s\S]*?<\/header>/gi, " ");
  s = s.replace(/<footer[\s\S]*?<\/footer>/gi, " ");
  s = s.replace(/<aside[\s\S]*?<\/aside>/gi, " ");
  s = s.replace(/<table[\s\S]*?<\/table>/gi, " ");
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<\/(p|div|li|h[1-6]|tr|section|article)>/gi, "\n");
  s = s.replace(/<[^>]+>/g, " ");
  s = s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'");
  s = s.replace(/[ \t]+/g, " ");
  s = s.replace(/\n[ \t]*\n+/g, "\n\n");
  return s.trim();
}
