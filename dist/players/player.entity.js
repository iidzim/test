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
exports.Player = void 0;
const typeorm_1 = require("typeorm");
const player_status_enum_1 = require("./player_status.enum");
const bcrypt = require("bcrypt");
let Player = class Player extends typeorm_1.BaseEntity {
    async validatePassword(password) {
        const hash = await bcrypt.hash(password, this.salt);
        return hash === this.password;
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Player.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Player.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Player.prototype, "avatar", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Player.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: player_status_enum_1.UserStatus.ONLINE }),
    __metadata("design:type", String)
], Player.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Player.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Player.prototype, "salt", void 0);
Player = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Unique)(['username'])
], Player);
exports.Player = Player;
//# sourceMappingURL=player.entity.js.map