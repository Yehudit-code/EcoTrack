"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

interface Props {
  onPostIdDetected: (postId: string) => void;
}

export default function SocialSharingClient({ onPostIdDetected }: Props) {
  const searchParams = useSearchParams();
  const postId = searchParams.get("post");

  useEffect(() => {
    if (postId) {
      onPostIdDetected(postId);
    }
  }, [postId, onPostIdDetected]);

  return null;
}
