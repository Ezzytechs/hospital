// =============================================
// File: src/models/EMR/CarePlan.js
// FHIR CarePlan (treatment plan / goals / activities)
// =============================================
const mongoose =require("mongoose");
const { CodeableConceptSchema, AnnotationSchema, PeriodSchema, reqRef, optRef } =require("./common");

const ActivitySchema = new mongoose.Schema(
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

const CarePlanSchema = new mongoose.Schema(
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
