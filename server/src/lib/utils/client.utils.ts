import axios from "axios";
import type { Request } from "express";
import { UAParser } from "ua-parser-js";
import { Injectable } from "@nestjs/common";

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

  private normalizeIp(ip: string): string {
    if (ip.startsWith("::ffff:")) return ip.replace("::ffff:", "");
    if (ip === "::1") return "127.0.0.1";
    return ip;
  }

  private async getIpData(ip: string) {
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

  async resolve(req: Request): Promise<ClientInfo> {
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

    const geo = await this.getIpData(ip);

    return {
      ip,
      location: geo?.location || "Unknown location",
      isp: geo?.isp || "",
      timezone: geo?.timezone || "UTC",
      deviceType,
      deviceInfo,
    };
  }
}
