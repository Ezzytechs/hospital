// =============================================
// File: src/models/EMR/MedicationRequest.js
// FHIR MedicationRequest (prescription order)
// =============================================
const mongoose =require("mongoose");
const { CodeableConceptSchema, PeriodSchema, reqRef, optRef } =require("./common");
const DosageInstructionSchema = new mongoose.Schema(
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

const MedicationRequestSchema = new mongoose.Schema(
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
