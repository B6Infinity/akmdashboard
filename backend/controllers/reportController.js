import prisma from "../config/db.js";
import { cloudinary } from "../config/cloudinary.js";

// Helper to format pg report row to match Mongoose API contract
const formatReport = (report) => {
  if (!report) return null;
  
  // Create a copy of the report to modify
  const formatted = { ...report };
  
  // Reconstruct location object from the lat/lng we selected
  if (formatted.lat !== undefined && formatted.lng !== undefined) {
    formatted.location = {
      lat: Number(formatted.lat),
      lng: Number(formatted.lng),
    };
    delete formatted.lat;
    delete formatted.lng;
  }
  
  return formatted;
};

const formatReports = (reports) => {
  return reports.map((r) => formatReport(r));
};

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

    const rows = await prisma.$queryRawUnsafe(`
      INSERT INTO reports (type, photo_url, photo_public_id, location, remarks, ward_no)
      VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), $6, $7)
      RETURNING id::text, status, created_at, remarks, photo_url, photo_public_id, updated_at, type, ward_no, ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng;
    `, type, photo_url, photo_public_id, location.lng, location.lat, remarks || "", ward_no != null ? Number(ward_no) : null);

    const report = rows[0];

    const formattedReport = formatReport(report);

    res.status(201).json({ success: true, message: "Report submitted successfully.", data: formattedReport });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports
export const getAllReports = async (req, res, next) => {
  try {
    const { status, ward_no, type, page = 1, limit = 20 } = req.query;

    let queryStr = `SELECT id::text, status, created_at, remarks, photo_url, photo_public_id, updated_at, type, ward_no, ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng, COUNT(*) OVER()::int as full_count FROM reports WHERE 1=1`;
    const values = [];
    let paramIndex = 1;

    if (status) {
      queryStr += ` AND status = $${paramIndex++}`;
      values.push(status);
    }
    if (ward_no) {
      queryStr += ` AND ward_no = $${paramIndex++}`;
      values.push(Number(ward_no));
    }
    if (type) {
      queryStr += ` AND type = $${paramIndex++}`;
      values.push(type);
    }

    queryStr += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    
    const limitNum = Number(limit);
    const offsetNum = (Number(page) - 1) * limitNum;
    values.push(limitNum, offsetNum);

    const rows = await prisma.$queryRawUnsafe(queryStr, ...values);

    const count = rows.length > 0 ? Number(rows[0].full_count) : 0;
    
    // Remove the full_count from each row object before returning
    const cleanedRows = rows.map(r => {
      const copy = { ...r };
      delete copy.full_count;
      return copy;
    });

    res.json({
      success: true,
      data: formatReports(cleanedRows),
      pagination: {
        total: count,
        page: Number(page),
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/:id
export const getReportById = async (req, res, next) => {
  try {
    const rows = await prisma.$queryRawUnsafe(`SELECT id::text, status, created_at, remarks, photo_url, photo_public_id, updated_at, type, ward_no, ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng FROM reports WHERE id = $1`, Number(req.params.id));

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Report not found." });
    }

    res.json({ success: true, data: formatReport(rows[0]) });
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

    const query = `UPDATE reports SET status = $1 WHERE id = $2 RETURNING id::text, status, created_at, remarks, photo_url, photo_public_id, updated_at, type, ward_no, ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng`;
    const rows = await prisma.$queryRawUnsafe(query, status, Number(req.params.id));

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Report not found." });
    }

    res.json({ success: true, message: "Status updated.", data: formatReport(rows[0]) });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/reports/:id
export const deleteReport = async (req, res, next) => {
  try {
     const selectQuery = `SELECT id::text, photo_public_id FROM reports WHERE id = $1`;
     const rows = await prisma.$queryRawUnsafe(selectQuery, Number(req.params.id));

     if (rows.length === 0) {
        return res.status(404).json({ success: false, error: "Report not found." });
     }
     
     const report = rows[0];

     if (report.photo_public_id && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== "your_cloud_name") {
        await cloudinary.uploader.destroy(report.photo_public_id);
     }

     const deleteQuery = `DELETE FROM reports WHERE id = $1`;
     await prisma.$queryRawUnsafe(deleteQuery, Number(req.params.id));

     res.json({ success: true, message: "Report deleted successfully." });
    
  } catch (error) {
    next(error);
  }
};
