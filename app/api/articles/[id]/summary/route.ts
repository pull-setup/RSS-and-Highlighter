import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.1-8b-instant";
const MAX_CONTENT_CHARS = 8000;

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_CONTENT_CHARS);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: articleId } = await params;
  if (!articleId) {
    return NextResponse.json({ error: "Article id required" }, { status: 400 });
  }

  let row: { rows: Array<Record<string, unknown>> };
  try {
    row = await db.execute({
      sql: "SELECT a.id, a.title, a.content, a.summary FROM articles a JOIN feeds f ON a.feed_id = f.id WHERE a.id = ? AND f.user_id = ?",
      args: [articleId, session.user.id],
    }) as { rows: Array<Record<string, unknown>> };
  } catch (e) {
    const msg = String((e as { message?: string })?.message ?? "");
    if (!/no such column|summary/i.test(msg)) throw e;
    row = await db.execute({
      sql: "SELECT a.id, a.title, a.content FROM articles a JOIN feeds f ON a.feed_id = f.id WHERE a.id = ? AND f.user_id = ?",
      args: [articleId, session.user.id],
    }) as { rows: Array<Record<string, unknown>> };
  }
  if (row.rows.length === 0) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }
  const r = row.rows[0] as Record<string, unknown>;
  const existingSummary = r.summary != null ? String(r.summary).trim() : "";
  if (existingSummary !== "") {
    return NextResponse.json({ summary: existingSummary });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey?.trim()) {
    return NextResponse.json(
      { error: "TL;DR not configured. Set GROQ_API_KEY in environment." },
      { status: 503 }
    );
  }

  const text = stripHtml(String(r.content ?? ""));
  const title = String(r.title ?? "").trim();
  if (!text && !title) {
    return NextResponse.json(
      { error: "No content to summarize" },
      { status: 400 }
    );
  }

  const prompt = `Write a summary of this article in 120–150 words. Cover the main points and conclusions. Use clear, neutral language.\n\nTitle: ${title}\n\nContent: ${text}`;

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 280,
        temperature: 0.3,
      }),
    });
    const body = await res.text();
    if (!res.ok) {
      let errMessage = "Summary service failed";
      try {
        const errJson = JSON.parse(body) as { error?: { message?: string }; message?: string };
        errMessage = errJson?.error?.message ?? errJson?.message ?? errMessage;
      } catch {
        if (body.length < 200) errMessage = body;
      }
      console.error("Groq API error:", res.status, body);
      return NextResponse.json(
        { error: errMessage },
        { status: 502 }
      );
    }
    let data: { choices?: Array<{ message?: { content?: string | null } }> };
    try {
      data = JSON.parse(body);
    } catch {
      console.error("Groq response parse error:", body.slice(0, 300));
      return NextResponse.json(
        { error: "Invalid response from summary service" },
        { status: 502 }
      );
    }
    const raw = data.choices?.[0]?.message?.content;
    const summary = typeof raw === "string" ? raw.trim() : "";
    if (!summary) {
      return NextResponse.json(
        { error: "Empty summary from model" },
        { status: 502 }
      );
    }

    try {
      await db.execute({
        sql: "UPDATE articles SET summary = ? WHERE id = ?",
        args: [summary, articleId],
      });
    } catch (e) {
      const msg = String((e as { message?: string })?.message ?? "");
      if (!/no such column|summary/i.test(msg)) throw e;
    }

    return NextResponse.json({ summary });
  } catch (e) {
    console.error("Summary error:", e);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 502 }
    );
  }
}
