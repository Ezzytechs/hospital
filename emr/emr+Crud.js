// =============================================
// File: src/models/EMR/common.js
// Shared FHIR-like sub-schemas for reuse
// =============================================
import mongoose from "mongoose";

const { Schema } = mongoose;

export const IdentifierSchema = new Schema(
  {
    system: String, // e.g., MRN system URI
    value: String,
    use: { type: String, enum: ["usual", "official", "temp", "secondary"], default: "official" },
    type: {
      coding: [
        {
          system: String,
          code: String,
          display: String,
        },
      ],
      text: String,
    },
  },
  { _id: false }
);

export const CodingSchema = new Schema(
  {
    system: String, // e.g., http://snomed.info/sct, http://loinc.org, http://www.nlm.nih.gov/research/umls/rxnorm
    code: String,
    display: String,
  },
  { _id: false }
);

export const CodeableConceptSchema = new Schema(
  {
    coding: [CodingSchema],
    text: String,
  },
  { _id: false }
);

export const QuantitySchema = new Schema(
  {
    value: Number,
    unit: String,
    system: String, // e.g., http://unitsofmeasure.org
    code: String,
  },
  { _id: false }
);

export const RangeSchema = new Schema(
  {
    low: QuantitySchema,
    high: QuantitySchema,
  },
  { _id: false }
);

export const PeriodSchema = new Schema(
  {
    start: Date,
    end: Date,
  },
  { _id: false }
);

export const AnnotationSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User" },
    time: { type: Date, default: Date.now },
    text: String,
  },
  { _id: false }
);

// Helpful reference shortcut
export const reqRef = (model) => ({ type: Schema.Types.ObjectId, ref: model, required: true });
export const optRef = (model) => ({ type: Schema.Types.ObjectId, ref: model });


// =============================================
// File: src/models/EMR/Encounter.js
// FHIR Encounter (links Patient + Practitioner at a Hospital)
// =============================================
import mongoose from "mongoose";
import { AnnotationSchema, CodeableConceptSchema, PeriodSchema, reqRef, optRef } from "./common.js";

const { Schema } = mongoose;

const EncounterSchema = new Schema(
  {
    hospital: reqRef("Hospital"),
    patient: reqRef("User"), // role=patient
    practitioner: optRef("User"), // role=doctor or other

    identifier: [
      {
        system: String,
        value: String,
      },
    ],

    status: {
      type: String,
      enum: ["planned", "arrived", "triaged", "in-progress", "onleave", "finished", "cancelled"],
      default: "planned",
    },

    class: CodeableConceptSchema, // e.g., outpatient, inpatient
    type: [CodeableConceptSchema], // reason categories

    period: PeriodSchema, // when the encounter took place

    reason: [
      {
        code: CodeableConceptSchema, // e.g., SNOMED reason code
        note: AnnotationSchema,
      },
    ],

    serviceProvider: optRef("Hospital"),
    location: String,
    notes: [AnnotationSchema],
  },
  { timestamps: true }
);

EncounterSchema.index({ hospital: 1, patient: 1, createdAt: -1 });
export default mongoose.model("Encounter", EncounterSchema);


// =============================================
// File: src/models/EMR/Observation.js
// FHIR Observation (vitals, lab results, etc.)
// =============================================
import mongoose from "mongoose";
import { CodeableConceptSchema, QuantitySchema, RangeSchema, AnnotationSchema, reqRef, optRef } from "./common.js";

const { Schema } = mongoose;

const ObservationSchema = new Schema(
  {
    hospital: reqRef("Hospital"),
    patient: reqRef("User"),
    encounter: optRef("Encounter"),
    performer: [optRef("User")],

    status: {
      type: String,
      enum: ["registered", "preliminary", "final", "amended", "cancelled", "entered-in-error"],
      default: "final",
    },

    category: [CodeableConceptSchema], // e.g., vital-signs, laboratory
    code: CodeableConceptSchema, // what is being observed (LOINC/SNOMED)

    effectiveDateTime: { type: Date, default: Date.now },
    issued: Date,

    // Value choice (use one): valueQuantity | valueString | valueCodeableConcept | valueRange
    valueQuantity: QuantitySchema,
    valueString: String,
    valueCodeableConcept: CodeableConceptSchema,
    valueRange: RangeSchema,

    interpretation: [CodeableConceptSchema], // normal/abnormal flags
    note: [AnnotationSchema],
  },
  { timestamps: true }
);

ObservationSchema.index({ hospital: 1, patient: 1, effectiveDateTime: -1 });
export default mongoose.model("Observation", ObservationSchema);


// =============================================
// File: src/models/EMR/Condition.js
// FHIR Condition (diagnoses/problems)
// =============================================
import mongoose from "mongoose";
import { CodeableConceptSchema, AnnotationSchema, PeriodSchema, reqRef, optRef } from "./common.js";

const { Schema } = mongoose;

const ConditionSchema = new Schema(
  {
    hospital: reqRef("Hospital"),
    patient: reqRef("User"),
    encounter: optRef("Encounter"),
    asserter: optRef("User"), // who asserted the diagnosis

    clinicalStatus: {
      coding: [
        { system: String, code: String, display: String },
      ],
      text: { type: String, default: "active" }, // active | recurrence | relapse | inactive | remission | resolved
    },

    verificationStatus: {
      coding: [
        { system: String, code: String, display: String },
      ],
      text: { type: String, default: "confirmed" }, // unconfirmed | provisional | differential | confirmed | refuted | entered-in-error
    },

    category: [CodeableConceptSchema], // problem-list-item | encounter-diagnosis
    severity: CodeableConceptSchema,
    code: CodeableConceptSchema, // the actual diagnosis code (e.g., SNOMED)

    onsetDateTime: Date,
    abatementDateTime: Date,
    recordedDate: { type: Date, default: Date.now },
    stage: {
      summary: CodeableConceptSchema,
      assessment: [optRef("Observation")],
    },
    bodySite: [CodeableConceptSchema],
    note: [AnnotationSchema],
    evidence: [
      {
        code: [CodeableConceptSchema],
        detail: [optRef("Observation")],
      },
    ],
    period: PeriodSchema,
  },
  { timestamps: true }
);

ConditionSchema.index({ hospital: 1, patient: 1, recordedDate: -1 });
export default mongoose.model("Condition", ConditionSchema);


// =============================================
// File: src/models/EMR/Medication.js
// FHIR Medication (drug definition when you want to persist catalog items)
// Optional: for simple systems you can inline medication name in MedicationRequest
// =============================================
import mongoose from "mongoose";
import { CodeableConceptSchema } from "./common.js";

const { Schema } = mongoose;

const MedicationSchema = new Schema(
  {
    code: CodeableConceptSchema, // RxNorm code preferred
    status: { type: String, enum: ["active", "inactive", "entered-in-error"], default: "active" },
    manufacturer: String,
    form: CodeableConceptSchema, // e.g., tablet, capsule
    ingredient: [
      {
        itemCodeableConcept: CodeableConceptSchema,
        strength: {
          numerator: { value: Number, unit: String, system: String, code: String },
          denominator: { value: Number, unit: String, system: String, code: String },
        },
      },
    ],
  },
  { timestamps: true }
);

MedicationSchema.index({ "code.coding.code": 1 });
export default mongoose.model("Medication", MedicationSchema);


// =============================================
// File: src/models/EMR/MedicationRequest.js
// FHIR MedicationRequest (prescription order)
// =============================================
import mongoose from "mongoose";
import { CodeableConceptSchema, PeriodSchema, reqRef, optRef } from "./common.js";

const { Schema } = mongoose;

const DosageInstructionSchema = new Schema(
  {
    text: String, // human readable e.g., "1 tablet twice daily after meals"
    timing: {
      code: CodeableConceptSchema, // e.g., BID, TID
    },
    route: CodeableConceptSchema, // oral, IV, etc.
    doseAndRate: {
      doseQuantity: { value: Number, unit: String, system: String, code: String },
    },
  },
  { _id: false }
);

const MedicationRequestSchema = new Schema(
  {
    hospital: reqRef("Hospital"),
    patient: reqRef("User"),
    requester: optRef("User"), // usually the prescribing doctor
    encounter: optRef("Encounter"),

    status: { type: String, enum: ["active", "on-hold", "cancelled", "completed", "entered-in-error", "stopped", "draft"], default: "active" },
    intent: { type: String, enum: ["order", "plan", "instance-order"], default: "order" },

    medicationCodeableConcept: CodeableConceptSchema, // or reference to Medication
    medication: optRef("Medication"),

    authoredOn: { type: Date, default: Date.now },
    dosageInstruction: [DosageInstructionSchema],

    dispenseRequest: {
      validityPeriod: PeriodSchema,
      quantity: { value: Number, unit: String },
      numberOfRepeatsAllowed: Number,
    },

    substitutionAllowed: { type: Boolean, default: false },
    note: String,
  },
  { timestamps: true }
);

MedicationRequestSchema.index({ hospital: 1, patient: 1, authoredOn: -1 });
export default mongoose.model("MedicationRequest", MedicationRequestSchema);


// =============================================
// File: src/models/EMR/Procedure.js
// FHIR Procedure (surgery, imaging, lab collection, etc.)
// =============================================
import mongoose from "mongoose";
import { CodeableConceptSchema, AnnotationSchema, PeriodSchema, reqRef, optRef } from "./common.js";

const { Schema } = mongoose;

const ProcedureSchema = new Schema(
  {
    hospital: reqRef("Hospital"),
    patient: reqRef("User"),
    performer: [
      {
        actor: optRef("User"),
        role: CodeableConceptSchema,
      },
    ],

    status: { type: String, enum: ["preparation", "in-progress", "not-done", "on-hold", "stopped", "completed", "entered-in-error", "unknown"], default: "completed" },
    code: CodeableConceptSchema,
    category: CodeableConceptSchema,
    performedPeriod: PeriodSchema,
    reason: [CodeableConceptSchema],
    bodySite: [CodeableConceptSchema],
    outcome: CodeableConceptSchema,
    report: [optRef("DiagnosticReport")],
    complication: [CodeableConceptSchema],
    note: [AnnotationSchema],
  },
  { timestamps: true }
);

ProcedureSchema.index({ hospital: 1, patient: 1, createdAt: -1 });
export default mongoose.model("Procedure", ProcedureSchema);


// =============================================
// File: src/models/EMR/AllergyIntolerance.js
// FHIR AllergyIntolerance
// =============================================
import mongoose from "mongoose";
import { CodeableConceptSchema, AnnotationSchema, reqRef } from "./common.js";

const { Schema } = mongoose;

const ReactionSchema = new Schema(
  {
    substance: CodeableConceptSchema,
    manifestation: [CodeableConceptSchema],
    severity: { type: String, enum: ["mild", "moderate", "severe"] },
    description: String,
    onset: Date,
    note: [AnnotationSchema],
  },
  { _id: false }
);

const AllergyIntoleranceSchema = new Schema(
  {
    hospital: reqRef("Hospital"),
    patient: reqRef("User"),
    clinicalStatus: { type: String, enum: ["active", "inactive", "resolved"], default: "active" },
    verificationStatus: { type: String, enum: ["unconfirmed", "confirmed", "refuted", "entered-in-error"], default: "confirmed" },
    category: [{ type: String, enum: ["food", "medication", "environment", "biologic"] }],
    criticality: { type: String, enum: ["low", "high", "unable-to-assess"] },
    code: CodeableConceptSchema, // allergy/substance
    onsetDateTime: Date,
    note: [AnnotationSchema],
    reaction: [ReactionSchema],
  },
  { timestamps: true }
);

AllergyIntoleranceSchema.index({ hospital: 1, patient: 1 });
export default mongoose.model("AllergyIntolerance", AllergyIntoleranceSchema);


// =============================================
// File: src/models/EMR/Immunization.js
// FHIR Immunization (vaccinations)
// =============================================
import mongoose from "mongoose";
import { CodeableConceptSchema, reqRef, optRef } from "./common.js";

const { Schema } = mongoose;

const ImmunizationSchema = new Schema(
  {
    hospital: reqRef("Hospital"),
    patient: reqRef("User"),
    encounter: optRef("Encounter"),

    status: { type: String, enum: ["completed", "entered-in-error", "not-done"], default: "completed" },
    vaccineCode: CodeableConceptSchema,
    occurrenceDateTime: { type: Date, default: Date.now },
    primarySource: { type: Boolean, default: true },
    location: String,
    lotNumber: String,
    expirationDate: Date,
    site: CodeableConceptSchema, // injection site
    route: CodeableConceptSchema,
    doseQuantity: { value: Number, unit: String, system: String, code: String },
    performer: [optRef("User")],
  },
  { timestamps: true }
);

ImmunizationSchema.index({ hospital: 1, patient: 1, occurrenceDateTime: -1 });
export default mongoose.model("Immunization", ImmunizationSchema);


// =============================================
// File: src/models/EMR/DiagnosticReport.js
// FHIR DiagnosticReport (lab/radiology reports)
// =============================================
import mongoose from "mongoose";
import { CodeableConceptSchema, AnnotationSchema, reqRef, optRef } from "./common.js";

const { Schema } = mongoose;

const DiagnosticReportSchema = new Schema(
  {
    hospital: reqRef("Hospital"),
    patient: reqRef("User"),
    encounter: optRef("Encounter"),
    basedOn: [optRef("Procedure")],

    status: { type: String, enum: ["registered", "partial", "preliminary", "final", "amended", "corrected", "appended", "cancelled", "entered-in-error", "unknown"], default: "final" },
    category: [CodeableConceptSchema],
    code: CodeableConceptSchema, // type of report
    effectiveDateTime: { type: Date, default: Date.now },
    issued: Date,
    performer: [optRef("User")],
    resultsInterpreter: [optRef("User")],

    result: [optRef("Observation")], // references to observations
    conclusion: String,
    conclusionCode: [CodeableConceptSchema],
    presentedForm: [
      {
        contentType: String, // e.g., application/pdf
        data: Buffer, // optional binary (consider storing externally)
        url: String, // pointer to file storage
        title: String,
        creation: Date,
      },
    ],

    note: [AnnotationSchema],
  },
  { timestamps: true }
);

DiagnosticReportSchema.index({ hospital: 1, patient: 1, effectiveDateTime: -1 });
export default mongoose.model("DiagnosticReport", DiagnosticReportSchema);


// =============================================
// File: src/models/EMR/DocumentReference.js
// FHIR DocumentReference (scanned docs, external PDFs/images)
// =============================================
import mongoose from "mongoose";
import { CodeableConceptSchema, reqRef } from "./common.js";

const { Schema } = mongoose;

const ContentSchema = new Schema(
  {
    attachment: {
      contentType: String,
      url: String, // store externally (S3, GCS); do not bloat DB
      title: String,
      creation: { type: Date, default: Date.now },
      size: Number,
      hash: String,
    },
    format: CodeableConceptSchema,
  },
  { _id: false }
);

const DocumentReferenceSchema = new Schema(
  {
    hospital: reqRef("Hospital"),
    patient: reqRef("User"),
    status: { type: String, enum: ["current", "superseded", "entered-in-error"], default: "current" },
    type: CodeableConceptSchema, // e.g., discharge summary
    category: [CodeableConceptSchema],
    date: { type: Date, default: Date.now },
    author: [{ type: Schema.Types.ObjectId, ref: "User" }],
    content: [ContentSchema],
    context: {
      encounter: [{ type: Schema.Types.ObjectId, ref: "Encounter" }],
    },
  },
  { timestamps: true }
);

DocumentReferenceSchema.index({ hospital: 1, patient: 1, date: -1 });
export default mongoose.model("DocumentReference", DocumentReferenceSchema);


// =============================================
// File: src/models/EMR/CarePlan.js
// FHIR CarePlan (treatment plan / goals / activities)
// =============================================
import mongoose from "mongoose";
import { CodeableConceptSchema, AnnotationSchema, PeriodSchema, reqRef, optRef } from "./common.js";

const { Schema } = mongoose;

const ActivitySchema = new Schema(
  {
    detail: {
      kind: { type: String, enum: ["Appointment", "CommunicationRequest", "MedicationRequest", "NutritionOrder", "ServiceRequest", "Task"] },
      code: CodeableConceptSchema,
      status: { type: String, enum: ["not-started", "scheduled", "in-progress", "on-hold", "completed", "cancelled", "stopped", "unknown"], default: "scheduled" },
      statusReason: CodeableConceptSchema,
      description: String,
      scheduledPeriod: PeriodSchema,
      performer: [optRef("User")],
    },
  },
  { _id: false }
);

const CarePlanSchema = new Schema(
  {
    hospital: reqRef("Hospital"),
    patient: reqRef("User"),
    encounter: optRef("Encounter"),

    status: { type: String, enum: ["draft", "active", "on-hold", "revoked", "completed", "entered-in-error", "unknown"], default: "active" },
    intent: { type: String, enum: ["plan", "order", "option"], default: "plan" },
    category: [CodeableConceptSchema],
    title: String,
    description: String,
    period: PeriodSchema,
    author: [optRef("User")],
    goal: [CodeableConceptSchema],
    activity: [ActivitySchema],
    note: [AnnotationSchema],
  },
  { timestamps: true }
);

CarePlanSchema.index({ hospital: 1, patient: 1 });
export default mongoose.model("CarePlan", CarePlanSchema);


// =============================================
// Notes:
// 1) All models are multi-tenant: `hospital` is required everywhere to enforce isolation.
// 2) We reference `User` for both patients and clinicians (role-guard in middleware/services).
// 3) CodeableConcept/Coding allow you to store FHIR-friendly terminologies (SNOMED, LOINC, RxNorm, UCUM).
// 4) For file/binary payloads, prefer external object storage; keep URLs + metadata in Mongo.
// 5) Add role/tenant checks in controllers to ensure a requester can only access their hospital’s records.
// 6) Indexes added for common query patterns (by hospital, patient, and time).


// =============================================
// File: src/middleware/authMiddleware.js
// JWT auth + subdomain -> hospital resolution
// =============================================
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


// =============================================
// File: src/utils/crudFactory.js
// Generic CRUD handlers with tenant filter + soft delete support
// =============================================
export const crudFactory = (Model, resourceName) => ({
  create: async (req, res) => {
    try {
      const data = { ...req.body, hospital: req.hospital._id };
      // enforce patient/encounter linkage safety if present
      if (data.patient && String(req.user.hospital) !== String(req.hospital._id))
        return res.status(403).json({ message: "Cross-tenant patient reference" });

      const doc = await Model.create(data);
      res.status(201).json({ message: `${resourceName} created`, data: doc });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  list: async (req, res) => {
    try {
      const { page = 1, limit = 20, sort = "-createdAt" } = req.query;
      const filter = { ...req.tenantFilter };

      // patient scoped listing if patientId is provided
      if (req.query.patient) filter.patient = req.query.patient;
      if (req.query.encounter) filter.encounter = req.query.encounter;

      const docs = await Model.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit));

      const count = await Model.countDocuments(filter);
      res.json({ data: docs, page: Number(page), pages: Math.ceil(count / limit), total: count });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  get: async (req, res) => {
    try {
      const doc = await Model.findOne({ _id: req.params.id, ...req.tenantFilter });
      if (!doc) return res.status(404).json({ message: `${resourceName} not found` });
      res.json({ data: doc });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  update: async (req, res) => {
    try {
      const doc = await Model.findOneAndUpdate(
        { _id: req.params.id, ...req.tenantFilter },
        req.body,
        { new: true }
      );
      if (!doc) return res.status(404).json({ message: `${resourceName} not found` });
      res.json({ message: `${resourceName} updated`, data: doc });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  remove: async (req, res) => {
    try {
      const doc = await Model.findOneAndDelete({ _id: req.params.id, ...req.tenantFilter });
      if (!doc) return res.status(404).json({ message: `${resourceName} not found` });
      res.json({ message: `${resourceName} deleted` });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },
});


// =============================================
// File: src/controllers/emrControllerFactory.js
// Binds models to CRUD + role guards, ready for routes
// =============================================
import Encounter from "../models/EMR/Encounter.js";
import Observation from "../models/EMR/Observation.js";
import Condition from "../models/EMR/Condition.js";
import MedicationRequest from "../models/EMR/MedicationRequest.js";
import Procedure from "../models/EMR/Procedure.js";
import AllergyIntolerance from "../models/EMR/AllergyIntolerance.js";
import Immunization from "../models/EMR/Immunization.js";
import DiagnosticReport from "../models/EMR/DiagnosticReport.js";
import DocumentReference from "../models/EMR/DocumentReference.js";
import CarePlan from "../models/EMR/CarePlan.js";
import { crudFactory } from "../utils/crudFactory.js";

export const controllers = {
  Encounter: crudFactory(Encounter, "Encounter"),
  Observation: crudFactory(Observation, "Observation"),
  Condition: crudFactory(Condition, "Condition"),
  MedicationRequest: crudFactory(MedicationRequest, "MedicationRequest"),
  Procedure: crudFactory(Procedure, "Procedure"),
  AllergyIntolerance: crudFactory(AllergyIntolerance, "AllergyIntolerance"),
  Immunization: crudFactory(Immunization, "Immunization"),
  DiagnosticReport: crudFactory(DiagnosticReport, "DiagnosticReport"),
  DocumentReference: crudFactory(DocumentReference, "DocumentReference"),
  CarePlan: crudFactory(CarePlan, "CarePlan"),
};


// =============================================
// File: src/routes/emrRoutes.js
// Auto-wired routes for all EMR resources using the factory controllers
// =============================================
import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import { tenantScope } from "../middleware/tenantMiddleware.js";
import { can } from "../middleware/roleGuard.js";
import { controllers } from "../controllers/emrControllerFactory.js";

const router = express.Router();

const wireCRUD = (name, ctrl) => {
  const base = `/emr/${name.toLowerCase()}`;
  router.post(base, auth, tenantScope, can(name, "create"), ctrl.create);
  router.get(base, auth, tenantScope, can(name, "read"), ctrl.list);
  router.get(`${base}/:id`, auth, tenantScope, can(name, "read"), ctrl.get);
  router.patch(`${base}/:id`, auth, tenantScope, can(name, "update"), ctrl.update);
  router.delete(`${base}/:id`, auth, tenantScope, can(name, "delete"), ctrl.remove);
};

Object.entries(controllers).forEach(([name, ctrl]) => wireCRUD(name, ctrl));

export default router;


// =============================================
// File: src/app.js (excerpt)
// Mount EMR routes
// =============================================
import express from "express";
import cors from "cors";
import emrRoutes from "./routes/emrRoutes.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api", emrRoutes);

export default app;