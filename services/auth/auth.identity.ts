
// Transient identifier
interface Identifier {
	userName: string;
	expires: Date;
}

export class AuthIdentityService {
	// Transient local store of authorized users
	// This is different to the authorization / database services
	users: { [id: string]: Identifier };

	constructor() {
		this.users = {};
	}

	// Authorizes a client nanoid locally based on an API call
	authorizeNanoid(nanoid: string, user: string): void {
		// 14 Day Expiry
		const newIdentifier: Identifier = {
			userName: user,
			expires: new Date(Date.now() + 14*24*60*60*1000)
		};
		this.users[nanoid] = newIdentifier;
	}

	// Check if a nanoid is authorized
	isAuthorized(nanoid: string): boolean {
		if (this.users[nanoid]?.expires.valueOf() > Date.now()) {
			return true;
		}
		else {
			// Delete the auth if not authorized / expired
			delete this.users[nanoid];
			return false;
		}
	}

	// Gets username based on an authorized nanoid
	getAuthorization(nanoid: string): string {
		if (this.users[nanoid])
			return this.users[nanoid].userName;
		else return "";
	}
}