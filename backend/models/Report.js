import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    lat: {
      type: Number,
      required: [true, "Latitude is required"],
      min: [-90, "Latitude must be >= -90"],
      max: [90, "Latitude must be <= 90"],
    },
    lng: {
      type: Number,
      required: [true, "Longitude is required"],
      min: [-180, "Longitude must be >= -180"],
      max: [180, "Longitude must be <= 180"],
    },
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["pothole", "broken_lamp", "garbage", "drainage", "other"],
      default: "pothole",
      required: true,
    },
    photo_url: {
      type: String,
      default: "",
    },
    photo_public_id: {
      type: String,
      default: "",
    },
    location: {
      type: locationSchema,
      required: [true, "Location is required"],
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [500, "Remarks cannot exceed 500 characters"],
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved"],
      default: "pending",
    },
    ward_no: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true, // auto-creates createdAt & updatedAt
  }
);

// Index for geospatial-style queries and status filtering
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ ward_no: 1 });

const Report = mongoose.model("Report", reportSchema);

export default Report;
