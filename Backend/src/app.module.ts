import { Module } from "@nestjs/common";
import { ApiModule } from "./api/api.module";
import { AuthModule } from "./auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AvatarModule } from "./avatar/avatar.module";
import { CommonModule } from "./common/common.module";
import { RagModule } from './rag/rag.module';
import { ConfigModule } from '@nestjs/config';
import { ChatbotModule } from './chatbot/chatbot.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: "mysql",
      host: "localhost",
      port: 3306,
      username: "root",
      password: "admin",
      database: "adam",
      entities: [__dirname + "/entities/*.entity{.ts,.js}"],
      synchronize: true,
      charset: "utf8mb4_general_ci",
    }),
    ApiModule,
    AuthModule,
    AvatarModule,
    CommonModule,
    RagModule,
    ChatbotModule,
  ],
})
export class AppModule {}
