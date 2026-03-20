import type { Response, CookieOptions } from "express";
import { Injectable } from "@nestjs/common";

import { EnvService } from "@/modules/env/env.service";

@Injectable()
export class CookieService {
  constructor(private readonly env: EnvService) {}

  setCookie = (
    res: Response,
    key: string,
    value: any,
    options?: CookieOptions,
  ) => {
    res.cookie(key, value, {
      httpOnly: true,
      secure: this.env.get("NODE_ENV") === "production",
      sameSite: "strict",
      path: "/",
      ...options,
    });
  };
}
