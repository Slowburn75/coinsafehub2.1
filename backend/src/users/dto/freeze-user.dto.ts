import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FreezeUserDto {
  @ApiProperty({ example: 'uuid-123', description: 'User ID to freeze or activate' })
  @IsString()
  user_id: string;

  @ApiProperty({ example: 'deactivate', enum: ['activate', 'deactivate'] })
  @IsString()
  @IsIn(['activate', 'deactivate'])
  action: 'activate' | 'deactivate';
}
