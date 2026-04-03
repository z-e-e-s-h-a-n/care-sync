import { ulid } from "ulid";

export const REFERENCE_PREFIX = {
  appointment: "APT",
  order: "ORD",
  payment: "PAY",
  shipment: "TRK",
  authorization: "AUTH",
} as const;

export type ReferenceEntity = keyof typeof REFERENCE_PREFIX;

export const createReference = (entity: ReferenceEntity) => {
  const refId = ulid().slice(-6).toUpperCase();
  return `${REFERENCE_PREFIX[entity]}-${refId}`;
};

