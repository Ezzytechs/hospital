// =============================================
// File: src/models/EMR/Procedure.js
// FHIR Procedure (surgery, imaging, lab collection, etc.)
// =============================================
const mongoose =require("mongoose");
const { CodeableConceptSchema, AnnotationSchema, PeriodSchema, reqRef, optRef } =require("./common");

const ProcedureSchema = new mongoose.Schema(
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