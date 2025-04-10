import { Module } from '@nestjs/common';
import { UserContextService } from './user-context/user-context.service';

@Module({
  providers: [UserContextService],
  exports: [UserContextService],
  imports: [],
})
export class CommonModule {}
