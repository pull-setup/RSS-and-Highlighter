import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const INDIAN_NEWS_QUERY = `What are the most important and widely discussed news stories today, with a focus on India, covering:  
- breaking news and major **developments**,  
- viral stories getting significant attention,  
- notable events affecting large numbers of people, and  
- surprising or unusual stories that are gaining traction?  

- Please present the answer in short paragraphs with bullet points, and include links or references to relevant sources wherever needed. In long format.`;

const GLOBAL_NEWS_QUERY = `What are the most important and widely discussed news stories today, with a focus on USA & Global, covering:  
- breaking news and major **developments**,  
- viral stories getting significant attention,  
- notable events affecting large numbers of people, and  
- surprising or unusual stories that are gaining traction?  

- Please present the answer in short paragraphs with bullet points, and include links or references to relevant sources wherever needed. In long format.`;

async function fetchNewsFromGroq(query: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a news aggregator. Provide well-formatted HTML content with proper paragraphs, bullet points, and links. Use <p> tags for paragraphs, <ul> and <li> for lists, and <a> tags for links with href attributes.",
        },
        {
          role: "user",
          content: query,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text().catch(() => "Unknown error");
    throw new Error(`Groq API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("No content received from Groq API");
  }

  return content;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type } = await params;
  if (type !== "indian" && type !== "global") {
    return NextResponse.json({ error: "Invalid news type" }, { status: 400 });
  }

  try {
    const query = type === "indian" ? INDIAN_NEWS_QUERY : GLOBAL_NEWS_QUERY;
    const content = await fetchNewsFromGroq(query);

    return NextResponse.json({
      content,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch news. Please try again later.",
      },
      { status: 500 }
    );
  }
}
