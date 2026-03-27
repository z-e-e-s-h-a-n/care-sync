import axios from "axios";
import type { CookieOptions, Request, Response } from "express";
import { UAParser } from "ua-parser-js";
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import type { ClientApp, UserRole } from "@workspace/contracts";

import { EnvService } from "@/modules/env/env.service";

export interface ClientInfo {
  ip: string;
  location: string;
  isp: string;
  timezone: string;

  deviceType: string;
  deviceInfo: string;
}

@Injectable()
export class ClientService {
  private ipStackKey: string;

  constructor(private readonly env: EnvService) {
    this.ipStackKey = this.env.get("IP_STACK_API_KEY");
  }

  async resolveClientApp(req: Request): Promise<ClientApp> {
    const clientUrl =
      (req.headers["x-client-url"] as string) || (req.headers.origin as string);

    const clientEndpoint = this.env.get("CLIENT_ENDPOINT");
    const adminEndpoint = this.env.get("ADMIN_ENDPOINT");

    if (clientUrl === clientEndpoint) return "web";
    if (clientUrl === adminEndpoint) return "dashboard";

    throw new BadRequestException("Invalid client app");
  }

  async assertRoleAccess(req: Request, role: UserRole) {
    const clientApp = await this.resolveClientApp(req);

    if (clientApp === "web" && role !== "patient") {
      throw new ForbiddenException({
        errorCode: "app_access_forbidden",
        message: "Only patient accounts can access the web app.",
      });
    }

    if (clientApp === "dashboard" && role === "patient") {
      throw new ForbiddenException({
        errorCode: "app_access_forbidden",
        message: "Patient accounts cannot access the dashboard app.",
      });
    }
  }

  async buildSessionContext(req: Request): Promise<ClientInfo> {
    const rawIp =
      req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
      req.headers["x-real-ip"]?.toString() ||
      req.socket.remoteAddress ||
      "Unknown";

    const ip = this.normalizeIp(rawIp);

    const ua = UAParser(req.headers["user-agent"] ?? "");

    const deviceType =
      ua.device.type ??
      (ua.os.name === "Android" || ua.os.name === "iOS" ? "mobile" : "desktop");

    const deviceInfo =
      [ua.os.name, ua.os.version].filter(Boolean).join(" ") +
      " · " +
      [ua.browser.name, ua.browser.major].filter(Boolean).join(" ");

    const isProd = this.env.get("NODE_ENV") === "production";

    if (!isProd || ip.startsWith("127.") || ip.startsWith("192.168")) {
      return {
        ip,
        location: "Local Network",
        isp: "",
        timezone: "UTC",
        deviceType,
        deviceInfo,
      };
    }

    const geo = await this.getIpInfo(ip);

    return {
      ip,
      location: geo?.location || "Unknown location",
      isp: geo?.isp || "",
      timezone: geo?.timezone || "UTC",
      deviceType,
      deviceInfo,
    };
  }

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

  clearCookie = (res: Response, key: string, options?: CookieOptions) => {
    res.clearCookie(key, {
      httpOnly: true,
      secure: this.env.get("NODE_ENV") === "production",
      sameSite: "strict",
      path: "/",
      ...options,
    });
  };

  private async getIpInfo(ip: string) {
    if (!this.ipStackKey) return null;

    try {
      const url = `https://api.ipstack.com/${ip}?access_key=${this.ipStackKey}&fields=city,region_name,country_name,timezone,connection`;
      const res = (await axios.get(url)).data;

      return {
        location: [res.city, res.region_name, res.country_name]
          .filter(Boolean)
          .join(", "),
        timezone: res.timezone?.id ?? "",
        isp: res.connection?.isp ?? "",
      };
    } catch {
      return null;
    }
  }

  private normalizeIp(ip: string): string {
    if (ip.startsWith("::ffff:")) return ip.replace("::ffff:", "");
    if (ip === "::1") return "127.0.0.1";
    return ip;
  }
}
