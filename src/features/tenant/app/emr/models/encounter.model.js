import mongoose from "mongoose";

// =============================================
// File: src/models/EMR/Encounter.js
// FHIR Encounter (links Patient + Practitioner at a Hospital)
// =============================================
const mongoose =require("mongoose");
const { CodeableConceptSchema, AnnotationSchema, PeriodSchema, reqRef, optRef } =require("./common");
const EncounterSchema = new mongoose.Schema(
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