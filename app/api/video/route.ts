import { authOptions } from "@/lib/auth.options";
import { connectToDB } from "@/lib/db";
import videoModel, { IVideo } from "@/models/video.model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDB();
    const videos = await videoModel
      .find({})
      .populate("user", "email")
      .sort({ createdAt: -1 })
      .lean();

    if (!videos || videos.length < 1) {
      return NextResponse.json([], { status: 200 });
    }
    return NextResponse.json(videos, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch Videos!" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized!" }, { status: 401 });
    }
    await connectToDB();
    const body: IVideo = await request.json();
    if (!body.title || !body.description || !body.videoUrl || !body.thumbnailUrl) {
      return NextResponse.json({ error: "Required Fields Missing!" }, { status: 400 });
    }

    // user ID and fileId from upload payload
    const videoData = {
      ...body,
      user: session.user.id,
      fileId: body.fileId,
    };

    await videoModel.create(videoData);
    return NextResponse.json({ message: "Video Uploaded!" }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to upload Video!" }, { status: 500 });
  }
}
