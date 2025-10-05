// =============================================
// File: src/models/EMR/Condition.js
// FHIR Condition (diagnoses/problems)
// =============================================
const mongoose =require("mongoose");
const { CodeableConceptSchema, AnnotationSchema, PeriodSchema, reqRef, optRef } =require("./common");

const ConditionSchema = new mongoose.Schema(
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
