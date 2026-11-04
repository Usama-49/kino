"use client";

import React, { useState } from "react";
import { upload } from "@imagekit/next";
import { Video, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import axios from "axios";

interface VideoUploadProps {
  onSuccess?: (res: { filePath: string; url: string }) => void;
}

export default function VideoUpload({ onSuccess }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // 1. Fetch authentication parameters from your API route via Axios
      const { data, status } = await axios.get("/api/auth/imagekit-auth");
      if (status !== 200) throw new Error("Failed to authenticate upload");

      const authParams = data.authParams;
      const publicKey = data.publicKey || process.env.NEXT_PUBLIC_PUBLIC_KEY;

      if (!authParams?.token || !authParams?.signature || !authParams?.expire || !publicKey) {
        throw new Error("Invalid authentication parameters received.");
      }
      // 2. Perform upload via @imagekit/next helper
      const result = await upload({
        file,
        fileName: file.name,
        folder: "/videos",
        publicKey,
        token: authParams.token,
        signature: authParams.signature,
        expire: authParams.expire,
        onProgress: (evt) => {
          if (evt.total && evt.loaded) {
            const percent = Math.round((evt.loaded / evt.total) * 100);
            setProgress(percent);
          }
        },
      });

      // 3. Narrow type safety: ensure properties exist before assigning
      if (!result.url || !result.filePath) {
        throw new Error("Upload succeeded, but no URL or file path was returned.");
      }

      setUploading(false);
      setProgress(100);
      setVideoUrl(result.url);

      if (onSuccess) {
        onSuccess({ filePath: result.filePath, url: result.url });
      }
    } catch (err: unknown) {
      setUploading(false);
      const message = err instanceof Error ? err.message : "Video upload failed!";
      setError(message);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-xl">
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
        Upload Video
      </label>

      <div
        className="relative flex min-h-40 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-800 bg-slate-950/80 p-6 text-center transition-all duration-200
       hover:border-indigo-500/50 hover:bg-slate-950"
      >
        {videoUrl ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle className="h-10 w-10 text-emerald-400" />
            <p className="text-sm font-medium text-slate-200">Video Uploaded Successfully!</p>
            <button
              type="button"
              onClick={() => setVideoUrl(null)}
              className="mt-1 text-xs text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              Upload another video
            </button>
          </div>
        ) : uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            <p className="text-xs font-medium text-slate-300">Uploading... {progress}%</p>
            <div className="h-1.5 w-48 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-linear-to-r from-blue-500 to-indigo-500 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600/10 text-indigo-400 ring-1 ring-indigo-500/20">
              <Video className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-slate-300">
              Click to browse or drop your video here
            </p>
            <p className="mt-1 text-xs text-slate-500">MP4, WebM or MOV files</p>

            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-xs text-rose-400">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
