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

// Include metadata from user
// Client Device Name, Public IP, screen dimensions, 
// 1. Client Device & EnvironmentOperating System: Detection of Android, iOS, Windows, macOS, Linux, etc..Browser Information: Name (Chrome, Safari, Firefox), version, and rendering engine.Device Type: Differentiation between mobile, tablet, and desktop/PC.Device Model & Capabilities: In some cases, specific models (e.g., "iPhone 13", "Pixel 7").System Language/Locale: The user’s preferred language setting.Battery Level & Status: Using the Battery Status API, websites can check if a device is charging, its charge level, and remaining time.Installed Fonts: Used for browser fingerprinting.2. Screen & Display MetadataScreen Resolution: Total screen width and height (e.g., \(1920 \times 1080\)).Viewport Dimensions: The usable screen area within the browser, excluding browser toolbars.Device Pixel Ratio (DPI): High-density (Retina) vs. standard displays.Color Depth: Bit depth of the screen.3. Network & Connection MetadataIP Address: Used to determine approximate geolocation (country, city), ISP, and IP type (residential, cellular).Connection Type: Whether the user is on Wi-Fi, 4G, or cellular.Network Latency (RTT): Round-trip time data.4. Browser & User BehaviorHTTP Referrer: The URL of the previous page the user visited.Timezone & Time Zone Offset: Local time information.Navigation Timing: How long page elements take to load.Engagement Data: Clicks, scroll depth, mouse movement, and time spent on page.Performance Metrics: Frame rate and loading time.5. Advanced FingerprintingBrowser Fingerprint: By combining all the above data points, trackers can create a unique "fingerprint" for a device, allowing them to track users even if cookies are cleared.Canvas Fingerprinting: Drawing invisible images to determine how a browser handles graphics, which differs between devices.Audio Fingerprinting: Identifying device characteristics through differences in audio processing.

// Index for geospatial-style queries and status filtering
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ ward_no: 1 });

const Report = mongoose.model("Report", reportSchema);

export default Report;
