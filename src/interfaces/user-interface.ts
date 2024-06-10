export interface IUser {
	firstname: string;
	lastname: string;
	address: string;
	id_passpost: string;
	mail: string;
	password: string;
	confirm_password: string;
	role?: "OWNER" | "CUSTOMER";
	status?: "PENDING" | "REJECT" | "SUCCESS";
	// createAt?: Date;
	// updateAt?: Date;
}
