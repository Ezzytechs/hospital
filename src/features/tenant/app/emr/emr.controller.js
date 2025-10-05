import Encounter from "../models/EMR/Encounter.js";
import Observation from "../models/EMR/Observation.js";
import Condition from "../models/EMR/Condition.js";
import MedicationRequest from "../models/EMR/MedicationRequest.js";
import Procedure from "../models/EMR/Procedure.js";
import AllergyIntolerance from "../models/EMR/AllergyIntolerance.js";
import Immunization from "../models/EMR/Immunization.js";
import DiagnosticReport from "../models/EMR/DiagnosticReport.js";
import DocumentReference from "../models/EMR/DocumentReference.js";
import CarePlan from "../models/EMR/CarePlan.js";
import { crudFactory } from "../utils/crudFactory.js";

export const controllers = {
  Encounter: crudFactory(Encounter, "Encounter"),
  Observation: crudFactory(Observation, "Observation"),
  Condition: crudFactory(Condition, "Condition"),
  MedicationRequest: crudFactory(MedicationRequest, "MedicationRequest"),
  Procedure: crudFactory(Procedure, "Procedure"),
  AllergyIntolerance: crudFactory(AllergyIntolerance, "AllergyIntolerance"),
  Immunization: crudFactory(Immunization, "Immunization"),
  DiagnosticReport: crudFactory(DiagnosticReport, "DiagnosticReport"),
  DocumentReference: crudFactory(DocumentReference, "DocumentReference"),
  CarePlan: crudFactory(CarePlan, "CarePlan"),
};
