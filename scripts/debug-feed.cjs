"use strict";
// Usage: node scripts/debug-feed.cjs <feed-url>
// Prints what rss-parser returns for the first 3 items.

const url = process.argv[2];
if (!url) {
  console.error("Usage: node scripts/debug-feed.cjs <feed-url>");
  process.exit(1);
}

const Parser = require("rss-parser");
const parser = new Parser({
  customFields: { item: [["content:encoded", "contentEncoded"]] },
});

(async () => {
  console.log("Fetching:", url, "\n");
  const feed = await parser.parseURL(url);
  console.log("Feed title:", feed.title);
  console.log("Items:", feed.items.length, "\n");

  for (const item of feed.items.slice(0, 3)) {
    const i = item;
    console.log("---");
    console.log("title         :", i.title);
    console.log("link          :", i.link);
    console.log("enclosure     :", i.enclosure ?? "(none)");
    console.log("content len   :", (i.content ?? "").length, "chars");
    console.log("contentEncoded:", (i.contentEncoded ?? "(missing)").slice(0, 120));
    console.log("contentSnippet:", (i.contentSnippet ?? "").slice(0, 120));
    const imgMatch = (i.contentEncoded ?? i.content ?? "").match(/<img[^>]+?(?:src|data-src)=["']([^"']+)["']/i);
    console.log("first img src :", imgMatch?.[1] ?? "(none)");
    console.log();
  }
})().catch((e) => { console.error(e.message); process.exit(1); });
