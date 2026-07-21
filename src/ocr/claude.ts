import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config.js";
import type { CombatRecordStats } from "./parse.js";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: config.anthropicApiKey });
  return client;
}

const EXTRACTION_PROMPT = `This is a screenshot of a Call of Duty: Black Ops (1 or 2) combat record or end-of-match screen.
Extract the stats and respond with ONLY a JSON object (no markdown fences, no prose) with exactly these keys, using null for anything not visible:
{"game": "BO1" | "BO2" | null, "kills": int|null, "deaths": int|null, "wins": int|null, "losses": int|null, "kdRatio": float|null, "winPct": float|null, "score": int|null, "accuracy": float|null, "headshots": int|null, "timePlayed": string|null}`;

type MediaType = "image/png" | "image/jpeg" | "image/webp" | "image/gif";

export function detectMediaType(buf: Buffer): MediaType {
  if (buf.length > 3 && buf[0] === 0x89 && buf[1] === 0x50) return "image/png";
  if (buf.length > 2 && buf[0] === 0xff && buf[1] === 0xd8) return "image/jpeg";
  if (buf.length > 11 && buf.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  if (buf.length > 3 && buf.toString("ascii", 0, 3) === "GIF") return "image/gif";
  return "image/png";
}

export async function extractWithClaude(image: Buffer): Promise<CombatRecordStats> {
  const response = await getClient().messages.create({
    model: config.claudeModel,
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: detectMediaType(image), data: image.toString("base64") },
          },
          { type: "text", text: EXTRACTION_PROMPT },
        ],
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("Claude declined to process this image");
  }

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Claude returned no JSON");
  const parsed = JSON.parse(jsonMatch[0]);

  return {
    game: parsed.game === "BO1" || parsed.game === "BO2" ? parsed.game : null,
    kills: numOrNull(parsed.kills),
    deaths: numOrNull(parsed.deaths),
    wins: numOrNull(parsed.wins),
    losses: numOrNull(parsed.losses),
    kdRatio: numOrNull(parsed.kdRatio),
    winPct: numOrNull(parsed.winPct),
    score: numOrNull(parsed.score),
    accuracy: numOrNull(parsed.accuracy),
    headshots: numOrNull(parsed.headshots),
    timePlayed: typeof parsed.timePlayed === "string" ? parsed.timePlayed : null,
  };
}

function numOrNull(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}
