"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ArticleActions({
  articleId,
  isRead,
}: {
  articleId: number;
  isRead: boolean;
}) {
  const router = useRouter();
  const [read, setRead] = useState(isRead);

  async function toggle() {
    const next = !read;
    const res = await fetch(`/api/articles/${articleId}/read`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_read: next }),
    });
    if (res.ok) setRead(next);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={toggle}
        className="rounded border border-black/10 dark:border-white/10 px-4 py-2 text-sm hover:bg-black/[.02] dark:hover:bg-white/[.06]"
      >
        {read ? "Mark unread" : "Mark read"}
      </button>
    </div>
  );
}
