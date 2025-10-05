// =============================================
// File: src/models/EMR/DiagnosticReport.js
// FHIR DiagnosticReport (lab/radiology reports)
// =============================================
const mongoose =require("mongoose");
const { CodeableConceptSchema, AnnotationSchema, reqRef, optRef } =require("./common");

const DiagnosticReportSchema = new mongoose.Schema(
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
