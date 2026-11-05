"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Video as IKVideo } from "@imagekit/next";
import { Loader2, Film, User, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";

export interface IVideo {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  controls?: boolean;
  transformation?: {
    height: number;
    width: number;
    quality?: number;
  };
  user?: {
    _id: string;
    email: string;
  };
  createdAt: string;
}

export default function Videos() {
  const { data: session } = useSession();
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch("/api/video");
        if (!res.ok) {
          throw new Error("Failed to fetch videos from server");
        }
        const data: IVideo[] = await res.json();
        setVideos(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred while fetching videos.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, []);

  const handleDelete = async (videoId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this video?")) return;

    setDeletingId(videoId);
    try {
      const res = await fetch(`/api/video/${videoId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete video");
      }

      // Remove deleted video from state immediately
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Could not delete video.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <p className="text-sm font-medium text-red-400">{error}</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <Film className="h-12 w-12 text-zinc-600" />
        <h2 className="mt-4 text-lg font-semibold text-zinc-200">No videos uploaded yet</h2>
        <p className="mt-1 text-sm text-zinc-400">Be the first to publish media to Kino.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => {
        const isOwner = session?.user?.id === video.user?._id;

        return (
          <div
            key={video._id}
            className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 backdrop-blur-md transition-all hover:border-zinc-700 hover:shadow-lg hover:shadow-indigo-500/10"
          >
            <Link
              href={`/videos/${video._id}`}
              className="relative aspect-video w-full overflow-hidden rounded-lg bg-zinc-950"
            >
              <IKVideo
                urlEndpoint={process.env.NEXT_PUBLIC_URL_ENDPOINT}
                src={video.videoUrl}
                controls={false}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            <div className="mt-3 flex flex-col justify-between flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="line-clamp-1 text-base font-semibold text-zinc-100 group-hover:text-indigo-400">
                  {video.title}
                </h3>

                {isOwner && (
                  <button
                    onClick={(e) => handleDelete(video._id, e)}
                    disabled={deletingId === video._id}
                    className="p-1 text-zinc-500 hover:text-red-400 transition-colors disabled:opacity-50"
                    title="Delete video"
                  >
                    {deletingId === video._id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>

              <div className="mt-1 flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
                <User className="h-3.5 w-3.5" />
                <span className="truncate">{video.user?.email || "Unknown Uploader"}</span>
              </div>

              <p className="mt-1.5 line-clamp-2 text-sm text-zinc-400">
                {video.description || "No description provided."}
              </p>

              <span className="mt-3 text-xs text-zinc-500">
                {new Date(video.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
