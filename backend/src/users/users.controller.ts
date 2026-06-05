import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FreezeUserDto } from './dto/freeze-user.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('users')
  @ApiOperation({ summary: 'Get current user profile ("me")' })
  @ApiResponse({ status: 200, description: 'User profile with balances' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser('sub') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Patch('users')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Get('user_list')
  @UseGuards(RolesGuard)
  @Roles('super_admin', 'admin', 'support_agent', 'compliance_officer', 'auditor')
  @ApiTags('Admin - Users')
  @ApiOperation({ summary: '[Admin] List all users' })
  @ApiResponse({ status: 200, description: 'List of all registered users' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async listUsers() {
    return this.usersService.findAll();
  }

  @Delete('delete_user/:id')
  @UseGuards(RolesGuard)
  @Roles('super_admin', 'admin')
  @HttpCode(HttpStatus.OK)
  @ApiTags('Admin - Users')
  @ApiOperation({ summary: '[Admin] Delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 403, description: 'Cannot delete self or superuser' })
  async deleteUser(
    @CurrentUser('sub') adminUserId: string,
    @Param('id') userId: string,
  ) {
    return this.usersService.deleteUser(adminUserId, userId);
  }

  @Patch('freeze_user')
  @UseGuards(RolesGuard)
  @Roles('super_admin', 'admin')
  @HttpCode(HttpStatus.OK)
  @ApiTags('Admin - Users')
  @ApiOperation({ summary: '[Admin] Freeze or activate a user account' })
  @ApiResponse({ status: 200, description: 'User status updated' })
  async freezeUser(
    @CurrentUser('sub') adminUserId: string,
    @Body() dto: FreezeUserDto,
  ) {
    return this.usersService.freezeUser(adminUserId, dto);
  }
}
