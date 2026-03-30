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
import { slugify } from "@workspace/shared/utils";
import type { OAuthProvider } from "@workspace/contracts";

import { OtpService } from "./otp.service";
import { EnvService } from "@/modules/env/env.service";
import { PrismaService } from "@/modules/prisma/prisma.service";

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
    private readonly env: EnvService,
  ) {}

  onModuleInit() {
    this.initGoogleStrategy();
  }

  private initGoogleStrategy() {
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

  private async validateOAuthLogin(profile: GoogleProfile) {
    const normalized = this.normalizeProfile(profile);

    if (!normalized.email) {
      throw new BadRequestException("No email found");
    }

    const user = await this.prisma.user.findUnique({
      where: { email: normalized.email },
      include: { avatar: true },
    });

    if (!user) {
      throw new NotFoundException("User Not Found");
    }

    if (normalized.imageUrl && user.avatar?.url !== normalized.imageUrl) {
      await this.prisma.media.upsert({
        where: {
          url: normalized.imageUrl,
        },
        create: {
          type: "avatar",
          url: normalized.imageUrl,
          name: `${slugify(normalized.displayName)}-avatar`,
          mimeType: "image/jpeg",
          resourceType: "image",
          publicId: normalized.imageUrl,
          size: 0,
          hash: normalized.imageUrl,
          uploadedById: user.id,
        },
        update: {
          name: `${slugify(normalized.displayName)}-avatar`,
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

  private normalizeProfile(profile: GoogleProfile): OAuthProfile {
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
