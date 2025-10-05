// =============================================
// File: src/models/EMR/Observation.js
// FHIR Observation (vitals, lab results, etc.)
// =============================================
const mongoose =require("mongoose");
const { CodeableConceptSchema, AnnotationSchema, reqRef, optRef } =require("./common");

const ObservationSchema = new mongoose.Schema(
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