import { Module } from "@nestjs/common";
import { DoctorModule } from "@/modules/doctor/doctor.module";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";

@Module({
  imports: [DoctorModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
