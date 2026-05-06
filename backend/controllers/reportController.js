import Report from "../models/Report.js";
import { cloudinary } from "../config/cloudinary.js";

// POST /api/reports
export const createReport = async (req, res, next) => {
  try {
    const { type = "pothole", photo, location, remarks, ward_no } = req.body;

    // Validate required fields
    if (!location?.lat || !location?.lng) {
      return res.status(400).json({ success: false, error: "Location (lat, lng) is required." });
    }

    let photo_url = "";
    let photo_public_id = "";

    // Upload to Cloudinary if photo is provided and Cloudinary is configured
    if (photo && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== "your_cloud_name") {
      const uploadResult = await cloudinary.uploader.upload(photo, {
        folder: "akm_reports",
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      });
      photo_url = uploadResult.secure_url;
      photo_public_id = uploadResult.public_id;
    }

    const report = await Report.create({
      type,
      photo_url,
      photo_public_id,
      location,
      remarks,
      ward_no: ward_no ?? null,
    });

    res.status(201).json({ success: true, message: "Report submitted successfully.", data: report });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports
export const getAllReports = async (req, res, next) => {
  try {
    const { status, ward_no, type, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (ward_no) filter.ward_no = Number(ward_no);
    if (type) filter.type = type;

    const skip = (Number(page) - 1) * Number(limit);

    const [reports, total] = await Promise.all([
      Report.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Report.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: reports,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/:id
export const getReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id).lean();
    if (!report) {
      return res.status(404).json({ success: false, error: "Report not found." });
    }
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/reports/:id/status
export const updateReportStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "in_progress", "resolved"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, error: `Status must be one of: ${allowed.join(", ")}` });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).lean();

    if (!report) {
      return res.status(404).json({ success: false, error: "Report not found." });
    }

    res.json({ success: true, message: "Status updated.", data: report });
  } catch (error) {
    next(error);
  }
};
