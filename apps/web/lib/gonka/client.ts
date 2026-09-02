import "server-only";
import { serverEnv } from "@/lib/env";

/**
 * Thin wrapper over GonkaRouter's OpenAI-compatible chat API.
 * All AI reasoning in the app routes through here (server-side only).
 * Routed models may emit a <think>…</think> preamble — `completeJson`
 * strips it and extracts the first JSON object.
 */

export interface GonkaResult<T> {
  data: T;
  requestId: string;
  model: string;
  raw: string;
}

interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  jsonObject?: boolean;
}

async function chat(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  opts: ChatOptions = {},
): Promise<{ content: string; requestId: string; model: string }> {
  const env = serverEnv();
  const res = await fetch(`${env.gonkaBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.gonkaApiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: env.gonkaModel,
      messages,
      temperature: opts.temperature ?? 0.2,
      max_tokens: opts.maxTokens ?? 900,
      ...(opts.jsonObject ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GonkaRouter ${res.status}: ${text.slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    id?: string;
    model?: string;
    choices?: { message?: { content?: string } }[];
  };
  return {
    content: json.choices?.[0]?.message?.content ?? "",
    requestId: res.headers.get("x-request-id") ?? json.id ?? "unknown",
    model: json.model ?? env.gonkaModel,
  };
}

/** Remove reasoning-model scaffolding and pull out the first balanced JSON object/array. */
export function extractJson(raw: string): string {
  let s = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  s = s.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
  const start = s.search(/[[{]/);
  if (start === -1) throw new Error("No JSON found in model output");
  const open = s[start];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }
  throw new Error("Unbalanced JSON in model output");
}

export async function completeJson<T>(
  system: string,
  user: string,
  opts?: ChatOptions,
): Promise<GonkaResult<T>> {
  const { content, requestId, model } = await chat(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { jsonObject: true, ...opts },
  );
  const data = JSON.parse(extractJson(content)) as T;
  return { data, requestId, model, raw: content };
}
