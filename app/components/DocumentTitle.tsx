"use client";

import { useEffect } from "react";

export function DocumentTitle({ title }: { title: string }) {
  useEffect(() => {
    if (title) document.title = title;
  }, [title]);
  return null;
}
