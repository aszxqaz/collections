import { User } from './user'

export class Auth {
	id!: number

	username!: string

	isAdmin!: boolean

	isBlocked!: boolean

	user!: User
}
