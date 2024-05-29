import { User } from './user'

export class Rights {
	id!: number

	username!: string

	isAdmin!: boolean

	isBlocked!: boolean

	user!: User
}
