"use client";

import { useEffect, useState, use, Suspense } from "react";
import { Video as IKVideo } from "@imagekit/next";
import { Loader2, ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { IVideo } from "@/app/components/Videos";

function VideoDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [video, setVideo] = useState<IVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVideo() {
      try {
        const res = await fetch(`/api/video`);
        if (!res.ok) throw new Error("Failed to fetch video list");
        const data: IVideo[] = await res.json();
        const found = data.find((v) => v._id === id);

        if (!found) throw new Error("Video not found");
        setVideo(found);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred loading the video.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchVideo();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="text-sm font-medium text-red-400">{error || "Video not found"}</p>
        <Link
          href="/"
          className="mt-4 flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Feed
        </Link>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Feed
      </Link>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl">
        <IKVideo
          urlEndpoint={process.env.NEXT_PUBLIC_URL_ENDPOINT}
          src={video.videoUrl}
          controls={video.controls ?? true}
          className="aspect-video w-full rounded-lg object-contain"
        />
      </div>

      <div className="mt-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">{video.title}</h1>

        <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-indigo-400">
          <User className="h-4 w-4" />
          <span>{video.user?.email || "Unknown Uploader"}</span>
        </div>

        <p className="mt-3 text-zinc-400">{video.description || "No description provided."}</p>

        <span className="mt-4 block text-xs text-zinc-500">
          Uploaded on{" "}
          {new Date(video.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>
    </main>
  );
}

export default function VideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    // changed: pass params promise straight into the Suspense child
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      }
    >
      <VideoDetailContent params={params} />
    </Suspense>
  );
}
