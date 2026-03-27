import type { PatientProfileResponse } from "@workspace/contracts/patient";

const REQUIRED_PROFILE_FIELDS: Array<keyof PatientProfileResponse> = [
  "birthDate",
  "gender",
  "emergencyContactName",
  "emergencyContactNumber",
];

export const getPatientProfileCompletion = (
  profile?: PatientProfileResponse | null,
) => {
  const missingFields = REQUIRED_PROFILE_FIELDS.filter((field) => !profile?.[field]);
  const completedCount = REQUIRED_PROFILE_FIELDS.length - missingFields.length;

  return {
    isReadyForBooking: missingFields.length === 0,
    completedCount,
    totalRequired: REQUIRED_PROFILE_FIELDS.length,
    percent: Math.round((completedCount / REQUIRED_PROFILE_FIELDS.length) * 100),
    missingFields,
  };
};

export const formatPatientFieldLabel = (field: keyof PatientProfileResponse) => {
  const labels: Partial<Record<keyof PatientProfileResponse, string>> = {
    birthDate: "birth date",
    gender: "gender",
    emergencyContactName: "emergency contact name",
    emergencyContactNumber: "emergency contact number",
  };

  return labels[field] ?? String(field);
};
