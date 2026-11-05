import { authOptions } from "@/lib/auth.options";
import { connectToDB } from "@/lib/db";
import videoModel from "@/models/video.model";
import { imagekit } from "@/lib/imagekit";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDB();

    const video = await videoModel.findById(id);
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Verify if current logged-in user owns the video
    if (video.user.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own videos" },
        { status: 403 },
      );
    }

    // 1. Delete media file directly from ImageKit CDN
    if (video.fileId) {
      await imagekit.deleteFile(video.fileId);
    } else if (video.videoUrl) {
      // Fallback for older uploads missing fileId
      const fileName = video.videoUrl.split("/").pop();
      if (fileName) {
        const files = await imagekit.listFiles({ searchQuery: `name="${fileName}"` });
        if (files && files.length > 0) {
          const firstFile = files[0];
          // Type-guard check for fileId on the returned file object
          if ("fileId" in firstFile && typeof firstFile.fileId === "string") {
            await imagekit.deleteFile(firstFile.fileId);
          }
        }
      }
    }

    // 2. Remove document from MongoDB database
    await videoModel.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Video and ImageKit file deleted successfully" },
      { status: 200 },
    );
  } catch (err: unknown) {
    console.error("Delete video error:", err);
    return NextResponse.json(
      { error: "Failed to delete video and associated file" },
      { status: 500 },
    );
  }
}
