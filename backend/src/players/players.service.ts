import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException, Res, Response } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
// import { TwoFactorAuthenticationService } from "../auth/two-factor-authentication.service";
import { GetPlayersFilterDto } from "./dto-players/get-player-filter.dto";
import { Player } from "./player.entity";
import { PlayerRepository } from "./player.repository";
import { UserStatus } from "./player_status.enum";

import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';
import * as dotenv from "dotenv";
dotenv.config({ path: `.env` })

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(PlayerRepository)
		private userRepository: PlayerRepository,
		// private readonly twofactorService: TwoFactorAuthenticationService,
		private jwtService: JwtService,
	) {}

	// async signUp(createUserDto: CreateUserDto): Promise<void> {
	// 	return this.userRepository.signUp(createUserDto);
	// }

	// async signIn(createUserDto: CreateUserDto): Promise<{ accessToken: string }> {
	// 	const username = await this.userRepository.validateUserPassword(createUserDto);
	// 	if (!username) {
	// 		throw new UnauthorizedException('Invalid credentials')
	// 	}
	
	// 	const payload: JwtPayload = { username };
	// 	const accessToken = await this.jwtService.sign(payload);
	// 	return { accessToken };
	// }

	async getUserById(id: number): Promise<Player> {
		const found = await this.userRepository.findOne(id);
		if (!found){
			throw new NotFoundException(`User with ID "${id}" not found`);
		}
		return found;
	}
	
	async getUserByUsername(username:string): Promise<Player> {
		const found = await this.userRepository.findOne(username);
		if (!found){
			throw new NotFoundException(`User with ID "${username}" not found`);
		}
		return found;
	}

	async getUsers(FilterDto: GetPlayersFilterDto):Promise<Player[]> {
		return this.userRepository.getUsers(FilterDto);
	}

	async updateUsername(id: number, username: string): Promise<Player> {

		const updated = await this.getUserById(id);
		updated.username = username;
		try {
			await updated.save();
		} catch (error) {
			console.log(error.code);
			if (error.code === '23505') {
				throw new ConflictException('Username already exists');
			} else {
				throw new InternalServerErrorException();
			}
		}
		return updated;
	}

	async updateAvatar(id: number, avatar: string): Promise<Player> {

		const updated = await this.getUserById(id);
		updated.avatar = avatar;
		await updated.save();
		return updated;
	}

	async generateSecretQr(user: Player, @Res() res: Response): Promise<void> {
		const { otpauth_url } = await this.generateTwoFactorAuthenticationSecret(user);
		return this.pipeQrCodeStream(res, otpauth_url);
	}

	async updateLevel(id: number): Promise<Player> {
		const updated = await this.getUserById(id);
		updated.level += 0.125;
		await updated.save();
		return updated;
	}

	async updateStatus(id: number, status: UserStatus): Promise<Player> {
		const updated = await this.getUserById(id);
		updated.status = status;
		await updated.save();
		return updated;
	}

	async getAchievements(id: number): Promise<any> {
		const achievements = ['gold', 'silver', 'bronze', 'first'];
		const user = await this.userRepository.findOne(id);
		let s: number = 0;
		if (user.wins >= 20)
			s = -4;
		else if (user.wins >= 10)
			s = -3;
		else if (user.wins >= 5)
			s = -2;
		else if (user.wins == 1)
			s = -1;
		else
			s = 4;
		return achievements.slice(s);
	}

	async findOrCreate(id: number, login: string, email: string): Promise<Player> {
		console.log("find or create > number of arguments passed: ", arguments.length);
		console.log(id, login);
		const found = await this.userRepository.findOne({ where: { id } });
		if (found) {
			console.log('found !!');
			found.status = UserStatus.ONLINE;
			await found.save();
			return found;
		}
		console.log('not found !!');
		const newUser = new Player();
		newUser.id = id;
		newUser.username = login;
		newUser.avatar = "https://avatars.dicebear.com/api/croodles/" + login + ".svg";
		newUser.level = 0.0;
		newUser.wins = 0;
		newUser.losses = 0;
		newUser.status = UserStatus.ONLINE;
		newUser.two_fa = false;
		newUser.email = email;
		await newUser.save();
		console.log('new User saved successfully ' + newUser);
		if (typeof(newUser) == 'undefined') {
			console.log('newUser is undefined');
		}
		return newUser;
	}

	async verifyToken(token: string): Promise<Player> {

		try {
			const decoded = await this.jwtService.verify(token.toString());
			if (typeof decoded === 'object' && 'id' in decoded)
				return decoded;
			throw new BadRequestException();
		} catch(error) {
			throw new BadRequestException('Token expired');
		}
	}

	async setTwoFactorAuthenticationSecret(id:number , secret: string) {
		await this.userRepository.update(id, { secret: secret });
	}

	async turnOnTwoFactorAuthentication(id:number) {
		await this.userRepository.update(id, { two_fa: true });
	}

	//----------------------------- TwoFactorAuthentication.service.ts

	async generateTwoFactorAuthenticationSecret(user: Player) {

        const secret = authenticator.generateSecret();
		console.log('secret: ', secret);
        const otpauth_url = authenticator.keyuri(user.email, process.env.APP_NAME, secret);
        // await this.setTwoFactorAuthenticationSecret(user.id, secret);
		await this.userRepository.update(user.id, { secret: secret });
        return { secret, otpauth_url };
    }

    async pipeQrCodeStream(stream: Response, otpauth_url: string) {
        return toFileStream(stream, otpauth_url);
    }

	async verifyTwoFactorAuthenticationCodeValid(user: Player, code: string) {
		return authenticator.verify({token: code, secret: user.secret});
	}
}