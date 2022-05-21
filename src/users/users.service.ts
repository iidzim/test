import { Injectable, NotFoundException } from "@nestjs/common";
import { User } from "./users.model";

@Injectable()
export class UsersService {
	private users: User[] = [];

	insertUser(id: string, username: string, avatar: string){
		this.duplicateUser(id, username);
		const newUser = new User(id, username, avatar, 0, 0, 0, 'online');
		this.users.push(newUser);
	}

	getAllUsers(){
		return [...this.users];
	}

	getUser(id: string){
		const player = this.findUser(id);
		return {...player};
	}

	updateUsername(id:string, username: string){
		const [userObj, userIndex] = this.findUser(id);
		const updateUsernm = {...userObj};
		if (username) {
			updateUsernm.id = id;
		}
		this.users[userIndex] = updateUsernm;
	}

	updateLevel(id:string, lvl: number){
		const [userObj, userIndex] = this.findUser(id);
		const updateUser = {...userObj};
		if (lvl > updateUser.level) {
			updateUser.level = lvl;
		}
		this.users[userIndex] = updateUser;
	}

	updateStatus(id:string, status: string){
		const [userObj, userIndex] = this.findUser(id);
		const updateUser = {...userObj};
		updateUser.status = status;
		this.users[userIndex] = updateUser;
	}

	private findUser(id:string): [User, number] {
		const userIndex = this.users.findIndex(player => player.id === id);
		const userObj = this.users[userIndex];
		if (!userObj) {
			throw new NotFoundException('Could not find user');
		}
		return [userObj, userIndex];
	}

	private duplicateUser(id: string, username: string){
		const usernm = this.users.find(player => player.username === username);
		if (usernm) {
			throw new NotFoundException('username already taken !');
		}
	}
}