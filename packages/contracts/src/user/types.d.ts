import z from "zod";
import type { userProfileSchema } from "./schema";
import { type Media, type User } from "@workspace/db/browser";

export type UserProfileType = z.input<typeof userProfileSchema>;

export type BaseUserResponse = Sanitize<
  Pick<
    User,
    "id" | "email" | "phone" | "firstName" | "lastName" | "displayName"
  >
>;

export type SafeUser = StrictOmit<User, "password"> & {
  image?: Media | null;
};

export type UserResponse = StrictOmit<Sanitize<User>, "password"> & {
  image?: MediaResponse;
};
