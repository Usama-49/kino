import mongoose, { Schema, model, models } from "mongoose";

export const VIDEO_DIMENSIONS = {
  width: 1080,
  height: 1920,
} as const;

export interface IVideo {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  fileId?: string; // changed: added fileId to interface
  controls?: boolean;
  transformation?: {
    height: number;
    width: number;
    quality?: number;
  };
  user?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const videoSchema = new Schema<IVideo>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    videoUrl: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    fileId: { type: String },
    controls: { type: Boolean, default: true },
    transformation: {
      type: {
        height: { type: Number, default: VIDEO_DIMENSIONS.height },
        width: { type: Number, default: VIDEO_DIMENSIONS.width },
        quality: { type: Number, min: 1, max: 100, default: 100 },
      },
      default: () => ({}),
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const videoModel = models?.Video || model<IVideo>("Video", videoSchema);
export default videoModel;
