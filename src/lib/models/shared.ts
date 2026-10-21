import { Schema } from "mongoose";

/** Image metadata only. Binaries live in Cloudinary (or wherever the URL points). */
export const ImageSchema = new Schema(
  {
    url: { type: String, required: true, trim: true, maxlength: 2048 },
    alt: { type: String, default: "", trim: true, maxlength: 300 },
    caption: { type: String, default: "", trim: true, maxlength: 500 },
    width: Number,
    height: Number,
  },
  { _id: false },
);

export const SeoSchema = new Schema(
  {
    title: { type: String, default: "", maxlength: 120 },
    description: { type: String, default: "", maxlength: 320 },
    ogImage: { type: String, default: "", maxlength: 2048 },
  },
  { _id: false },
);
