import {
  BadRequestException,
  Injectable,
  NotFoundException,
  type OnModuleInit,
} from "@nestjs/common";
import passport from "passport";
import {
  Strategy as GoogleStrategy,
  type Profile as GoogleProfile,
} from "passport-google-oauth20";
import {
  Strategy as FacebookStrategy,
  type Profile as FacebookProfile,
} from "passport-facebook";
import { slugify } from "@workspace/shared/utils";

import { OtpService } from "./otp.service";
import { EnvService } from "@/modules/env/env.service";
import { InjectLogger } from "@/decorators/logger.decorator";
import { LoggerService } from "@/modules/logger/logger.service";
import { PrismaService } from "@/modules/prisma/prisma.service";
import type { OAuthProvider } from "@workspace/contracts";

interface OAuthProfile {
  provider: OAuthProvider;
  id: string;
  email: string | null;
  firstName: string;
  lastName: string;
  displayName: string;
  imageUrl?: string;
}

@Injectable()
export class OAuthService implements OnModuleInit {
  @InjectLogger()
  private readonly logger!: LoggerService;

  constructor(
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
    private readonly env: EnvService,
  ) {}

  onModuleInit() {
    this.initGoogleStrategy();
    this.initFacebookStrategy();
  }

  private initGoogleStrategy() {
    if (
      !this.env.get("GOOGLE_CLIENT_ID") ||
      !this.env.get("GOOGLE_CLIENT_SECRET") ||
      !this.env.get("GOOGLE_CALLBACK_URL")
    ) {
      this.logger.warn(
        "Google OAuth is disabled because its env values are missing.",
      );
      return;
    }

    passport.use(
      "google",
      new GoogleStrategy(
        {
          clientID: this.env.get("GOOGLE_CLIENT_ID"),
          clientSecret: this.env.get("GOOGLE_CLIENT_SECRET"),
          callbackURL: this.env.get("GOOGLE_CALLBACK_URL"),
          scope: ["profile", "email"],
        },
        async (_, __, profile: GoogleProfile, done) => {
          try {
            const user = await this.validateOAuthLogin(profile);
            done(null, user);
          } catch (err) {
            done(err, false);
          }
        },
      ),
    );
  }

  private initFacebookStrategy() {
    if (
      !this.env.get("FACEBOOK_CLIENT_ID") ||
      !this.env.get("FACEBOOK_CLIENT_SECRET") ||
      !this.env.get("FACEBOOK_CALLBACK_URL")
    ) {
      this.logger.warn(
        "Facebook OAuth is disabled because its env values are missing.",
      );
      return;
    }

    passport.use(
      "facebook",
      new FacebookStrategy(
        {
          clientID: this.env.get("FACEBOOK_CLIENT_ID"),
          clientSecret: this.env.get("FACEBOOK_CLIENT_SECRET"),
          callbackURL: this.env.get("FACEBOOK_CALLBACK_URL"),
          scope: "email",
        },
        async (_, __, profile: FacebookProfile, done) => {
          try {
            const user = await this.validateOAuthLogin(profile);
            done(null, user);
          } catch (err) {
            done(err, null);
          }
        },
      ),
    );
  }

  private async validateOAuthLogin(profile: GoogleProfile | FacebookProfile) {
    const normalized = this.normalizeProfile(profile);

    if (!normalized.email) {
      throw new BadRequestException("No email found");
    }

    const user = await this.prisma.user.findUnique({
      where: { email: normalized.email },
    });

    if (!user) {
      throw new NotFoundException("User Not Found");
    }

    if (normalized.imageUrl) {
      await this.prisma.media.upsert({
        where: {
          url: normalized.imageUrl,
        },
        create: {
          type: "photo",
          url: normalized.imageUrl,
          filename: `${slugify(normalized.displayName)}-avatar`,
          title: `${slugify(normalized.displayName)}-avatar`,
          mimeType: "image/jpeg",
          size: 0,
          hash: crypto.randomUUID(),
          uploadedById: user.id,
        },
        update: {
          url: normalized.imageUrl,
          filename: `${slugify(normalized.displayName)}-avatar`,
          mimeType: "image/jpeg",
          size: 0,
          hash: crypto.randomUUID(),
          uploadedById: user.id,
        },
      });
    }

    const { password, ...rest } = user;

    if (!password) {
      await this.otpService.sendOtp({
        user: rest,
        type: "secureToken",
        purpose: "setPassword",
        identifier: normalized.email,
      });
    }

    return {
      id: rest.id,
      role: user.role,
      status: user.status,
    };
  }

  private normalizeProfile(
    profile: GoogleProfile | FacebookProfile,
  ): OAuthProfile {
    const provider = profile.provider as OAuthProvider;
    const email = profile.emails?.[0]?.value || null;

    const displayName =
      profile.displayName ||
      `${profile.name?.givenName || ""} ${profile.name?.familyName || ""}`.trim();

    const firstName = profile.name?.givenName || "";
    const lastName = profile.name?.familyName || "";

    const imageUrl = profile.photos?.[0]?.value;

    return {
      id: profile.id,
      provider,
      email,
      displayName,
      firstName,
      lastName,
      imageUrl,
    };
  }
}
