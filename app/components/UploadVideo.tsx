"use client";

import React, { useState } from "react";
import { upload } from "@imagekit/next";
import { Video, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import axios from "axios";

interface VideoUploadProps {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  onSuccess?: (res: unknown) => void;
}

// 50 MB limit in bytes
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export default function UploadVideo({
  title,
  description,
  thumbnailUrl,
  onSuccess,
}: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setStatusMessage("");

    // 1. File Size Validation (Max 50MB)
    if (file.size > MAX_FILE_SIZE) {
      setError("Video size must be smaller than 50mb");
      e.target.value = "";
      return;
    }

    // 2. MIME Type Validation
    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file.");
      e.target.value = "";
      return;
    }

    setUploading(true);
    setProgress(0);
    setStatusMessage("Authenticating upload...");

    try {
      // 3. Step 1: Get ImageKit Authentication Parameters
      const { data, status } = await axios.get("/api/auth/imagekit-auth");
      if (status !== 200) throw new Error("Failed to authenticate upload request.");

      const authParams = data.authParams;
      const publicKey = data.publicKey || process.env.NEXT_PUBLIC_PUBLIC_KEY;

      if (!authParams?.token || !authParams?.signature || !authParams?.expire || !publicKey) {
        throw new Error("Invalid authentication parameters received from server.");
      }

      setStatusMessage("Uploading video to CDN...");

      // 4. Step 2: Upload Video File to ImageKit
      const result = await upload({
        file,
        fileName: file.name,
        folder: "/kino",
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

      if (!result.url || !result.filePath) {
        throw new Error("Upload completed, but valid URL or file path was missing.");
      }

      setVideoUrl(result.url);
      setStatusMessage("Saving video details to database...");

      // 5. Step 3: POST directly to /api/video MongoDB route
      const dbResponse = await axios.post("/api/video", {
        title: title || file.name,
        description: description || "Uploaded via Kino Video Uploader",
        videoUrl: result.url,
        thumbnailUrl: thumbnailUrl || result.thumbnailUrl || result.url,
        fileId: result.fileId, // fileId from ImageKit upload result
      });

      setUploading(false);
      setProgress(100);
      setStatusMessage("Video uploaded & saved successfully!");

      if (onSuccess) {
        onSuccess(dbResponse.data);
      }
    } catch (err: unknown) {
      setUploading(false);
      const message =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : err instanceof Error
            ? err.message
            : "Video upload or database save failed!";
      setError(message);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-xl">
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
        Upload Video
      </label>

      <div className="relative flex min-h-40 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-800 bg-slate-950/80 p-6 text-center transition-all duration-200 hover:border-indigo-500/50 hover:bg-slate-950">
        {videoUrl && !uploading ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle className="h-10 w-10 text-emerald-400" />
            <p className="text-sm font-medium text-slate-200">
              {statusMessage || "Video Uploaded & Saved to Database!"}
            </p>
            <button
              type="button"
              onClick={() => {
                setVideoUrl(null);
                setError(null);
                setStatusMessage("");
              }}
              className="mt-1 text-xs text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
            >
              Upload another video
            </button>
          </div>
        ) : uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            <p className="text-xs font-medium text-slate-300">
              {statusMessage} ({progress}%)
            </p>
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
            <p className="mt-1 text-xs text-slate-500">MP4, WebM or MOV (Max 50MB)</p>

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
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-500/10 p-3 text-xs text-rose-400 border border-rose-500/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
