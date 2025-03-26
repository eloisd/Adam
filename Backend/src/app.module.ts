import { Module } from "@nestjs/common";
import { ApiModule } from "./api/api.module";
import { AuthModule } from "./auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AvatarModule } from "./avatar/avatar.module";
import { CommonModule } from "./common/common.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "mysql",
      host: "localhost",
      port: 3306,
      username: "root",
      password: "admin",
      database: "adam",
      entities: [__dirname + "/entities/*.entity{.ts,.js}"],
      synchronize: true,
      charset: "utf8mb4",
    }),
    ApiModule,
    AuthModule,
    AvatarModule,
    CommonModule,
  ],
})
export class AppModule {}
