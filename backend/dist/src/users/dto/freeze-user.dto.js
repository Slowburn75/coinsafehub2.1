"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreezeUserDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class FreezeUserDto {
}
exports.FreezeUserDto = FreezeUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-123', description: 'User ID to freeze or activate' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FreezeUserDto.prototype, "user_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'deactivate', enum: ['activate', 'deactivate'] }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['activate', 'deactivate']),
    __metadata("design:type", String)
], FreezeUserDto.prototype, "action", void 0);
//# sourceMappingURL=freeze-user.dto.js.map