// =============================================
// File: src/models/EMR/AllergyIntolerance.js
// FHIR AllergyIntolerance
// =============================================
const mongoose =require("mongoose");
const { CodeableConceptSchema, AnnotationSchema, reqRef } =require("./common");

const ReactionSchema = new mongoose.Schema(
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

const AllergyIntoleranceSchema = new mongoose.Schema(
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