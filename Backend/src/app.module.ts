import { Module } from "@nestjs/common";
import { ApiModule } from "./api/api.module";
import { AuthModule } from "./auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AvatarModule } from "./avatar/avatar.module";
import { CommonModule } from "./common/common.module";
import { ConfigModule } from "@nestjs/config";
import { ChatbotModule } from "./chatbot/chatbot.module";
import { RouterModule } from "@nestjs/core";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: "mysql",
      host: process.env.DB_HOST || "localhost",
      port: 3306,
      username: process.env.DB_USERNAME || "root",
      password: process.env.DB_PASSWORD || "password",
      database: process.env.DB_DATABASE || "adam",
      entities: [__dirname + "/entities/*.entity{.ts,.js}"],
      synchronize: true,
      charset: "utf8mb4_general_ci",
    }),
    ApiModule,
    AuthModule,
    AvatarModule,
    CommonModule,
    ChatbotModule,
    RouterModule.register([
      {
        path: "api",
        module: ApiModule,
      },
    ]),
  ],
})
export class AppModule {}
