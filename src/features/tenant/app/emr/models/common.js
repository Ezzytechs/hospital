import mongoose from "mongoose";

export const CodeableConceptSchema = new mongoose.Schema(
  {
    coding: [CodingSchema],
    text: String,
  },
  { _id: false }
);

export const AnnotationSchema = new mongoose.Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User" },
    time: { type: Date, default: Date.now },
    text: String,
  },
  { _id: false }
);

export const PeriodSchema = new mongoose.Schema(
  {
    start: Date,
    end: Date,
  },
  { _id: false }
);
export const reqRef = (model) => ({ type: Schema.Types.ObjectId, ref: model, required: true });
export const optRef = (model) => ({ type: Schema.Types.ObjectId, ref: model });

export const QuantitySchema = new mongoose.Schema(
  {
    value: Number,
    unit: String,
    system: String, // e.g., http://unitsofmeasure.org
    code: String,
  },
  { _id: false }
);

export const RangeSchema = new mongoose.Schema(
  {
    low: QuantitySchema,
    high: QuantitySchema,
  },
  { _id: false }
);

export const IdentifierSchema = new mongoose.Schema(
  {
    system: String, // e.g., MRN system URI
    value: String,
    use: { type: String, enum: ["usual", "official", "temp", "secondary"], default: "official" },
    type: {
      coding: [
        {
          system: String,
          code: String,
          display: String,
        },
      ],
      text: String,
    },
  },
  { _id: false }
);

export const CodingSchema = new mongoose.Schema(
  {
    system: String, // e.g., http://snomed.info/sct, http://loinc.org, http://www.nlm.nih.gov/research/umls/rxnorm
    code: String,
    display: String,
  },
  { _id: false }
);



// =============================================
// Notes:
// 1) All models are multi-tenant: `hospital` is required everywhere to enforce isolation.
// 2) We reference `User` for both patients and clinicians (role-guard in middleware/services).
// 3) CodeableConcept/Coding allow you to store FHIR-friendly terminologies (SNOMED, LOINC, RxNorm, UCUM).
// 4) For file/binary payloads, prefer external object storage; keep URLs + metadata in Mongo.
// 5) Add role/tenant checks in controllers to ensure a requester can only access their hospital’s records.
// 6) Indexes added for common query patterns (by hospital, patient, and time).


