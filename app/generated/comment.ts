import { User } from './user'
import { Item } from './item'

export class Comment {
	id!: number

	content!: string

	createdAt!: Date

	user!: User

	username!: string

	item!: Item

	itemId!: number
}
