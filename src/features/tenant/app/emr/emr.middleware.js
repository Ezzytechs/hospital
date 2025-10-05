import jwt from "jsonwebtoken";
import Hospital from "../models/Hospital.js";
import User from "../models/User.js";

export const extractSubdomain = (host) => {
  if (!host) return null;
  const parts = host.split(":")[0].split(".");
  if (parts.length < 3) return null; // e.g., api.docon.com => no hospital subdomain
  return parts[0]; // hospital1.docon.com
};

export const auth = async (req, res, next) => {
  try {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "No token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).lean();
    if (!user || !user.isActive) return res.status(401).json({ message: "Invalid user" });

    // Resolve hospital from subdomain (frontend) or from user (mobile/postman)
    const sub = extractSubdomain(req.headers.host);
    let hospital = null;
    if (sub) hospital = await Hospital.findOne({ subdomain: sub }).lean();
    if (!hospital) hospital = await Hospital.findById(user.hospital).lean();
    if (!hospital) return res.status(403).json({ message: "Hospital not resolved" });

    req.user = user;
    req.hospital = hospital;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized", error: err.message });
  }
};


// =============================================
// File: src/middleware/tenantMiddleware.js
// Ensures queries are always scoped to req.hospital
// =============================================
export const tenantScope = (req, _res, next) => {
  req.tenantFilter = { hospital: req.hospital._id };
  next();
};


// =============================================
// File: src/middleware/roleGuard.js
// Simple role + action-based authorization
// =============================================
const policy = {
  Encounter: {
    create: ["doctor", "admin"],
    read: ["doctor", "admin", "pharmacist", "lab", "patient"],
    update: ["doctor", "admin"],
    delete: ["admin"],
  },
  Observation: {
    create: ["doctor", "lab", "admin"],
    read: ["doctor", "admin", "lab", "patient"],
    update: ["doctor", "lab", "admin"],
    delete: ["admin"],
  },
  Condition: {
    create: ["doctor", "admin"],
    read: ["doctor", "admin", "patient"],
    update: ["doctor", "admin"],
    delete: ["admin"],
  },
  MedicationRequest: {
    create: ["doctor", "admin"],
    read: ["doctor", "admin", "pharmacist", "patient"],
    update: ["doctor", "admin"],
    delete: ["admin"],
  },
  Procedure: {
    create: ["doctor", "lab", "admin"],
    read: ["doctor", "admin", "lab", "patient"],
    update: ["doctor", "lab", "admin"],
    delete: ["admin"],
  },
  AllergyIntolerance: {
    create: ["doctor", "admin"],
    read: ["doctor", "admin", "patient"],
    update: ["doctor", "admin"],
    delete: ["admin"],
  },
  Immunization: {
    create: ["doctor", "admin"],
    read: ["doctor", "admin", "patient"],
    update: ["doctor", "admin"],
    delete: ["admin"],
  },
  DiagnosticReport: {
    create: ["lab", "doctor", "admin"],
    read: ["doctor", "admin", "lab", "patient"],
    update: ["lab", "doctor", "admin"],
    delete: ["admin"],
  },
  DocumentReference: {
    create: ["doctor", "admin", "lab"],
    read: ["doctor", "admin", "lab", "patient"],
    update: ["doctor", "admin", "lab"],
    delete: ["admin"],
  },
  CarePlan: {
    create: ["doctor", "admin"],
    read: ["doctor", "admin", "patient"],
    update: ["doctor", "admin"],
    delete: ["admin"],
  },
};

export const can = (resource, action) => (req, res, next) => {
  const allowed = policy[resource]?.[action] || [];
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({ message: `Forbidden: ${action} ${resource}` });
  }
  next();
};
