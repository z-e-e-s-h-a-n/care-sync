import { Module } from "@nestjs/common";
import { TokenService } from "./token.service";
import { CookieService } from "@/utils/cookie.util";
import { ClientService } from "@/utils/client.utils";

@Module({
  providers: [TokenService, CookieService, ClientService],
  exports: [TokenService],
})
export class TokenModule {}
