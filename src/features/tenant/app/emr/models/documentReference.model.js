// =============================================
// File: src/models/EMR/DocumentReference.js
// FHIR DocumentReference (scanned docs, external PDFs/images)
// =============================================
const mongoose =require("mongoose");
const { CodeableConceptSchema, reqRef } =require("./common");

const ContentSchema = new mongoose.Schema(
  {
    attachment: {
      contentType: String,
      url: String, // store externally (S3, GCS); do not bloat DB
      title: String,
      creation: { type: Date, default: Date.now },
      size: Number,
      hash: String,
    },
    format: CodeableConceptSchema,
  },
  { _id: false }
);

const DocumentReferenceSchema = new mongoose.Schema(
  {
    hospital: reqRef("Hospital"),
    patient: reqRef("User"),
    status: { type: String, enum: ["current", "superseded", "entered-in-error"], default: "current" },
    type: CodeableConceptSchema, // e.g., discharge summary
    category: [CodeableConceptSchema],
    date: { type: Date, default: Date.now },
    author: [{ type: Schema.Types.ObjectId, ref: "User" }],
    content: [ContentSchema],
    context: {
      encounter: [{ type: Schema.Types.ObjectId, ref: "Encounter" }],
    },
  },
  { timestamps: true }
);

DocumentReferenceSchema.index({ hospital: 1, patient: 1, date: -1 });
export default mongoose.model("DocumentReference", DocumentReferenceSchema);
