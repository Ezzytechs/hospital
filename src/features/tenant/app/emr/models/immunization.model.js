// =============================================
// File: src/models/EMR/Immunization.js
// FHIR Immunization (vaccinations)
// =============================================
const mongoose =require("mongoose");
const { CodeableConceptSchema, reqRef, optRef } =require("./common");

const ImmunizationSchema = new mongoose.Schema(
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

