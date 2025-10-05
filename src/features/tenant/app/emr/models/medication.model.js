// =============================================
// File: src/models/EMR/Medication.js
// FHIR Medication (drug definition when you want to persist catalog items)
// Optional: for simple systems you can inline medication name in MedicationRequest
// =============================================
const mongoose =require("mongoose");
const { CodeableConceptSchema} =require("./common");
const MedicationSchema = new mongoose.Schema(
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