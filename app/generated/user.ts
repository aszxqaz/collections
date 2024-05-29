import { Password } from './password'
import { Collection } from './collection'
import { Comment } from './comment'
import { Item } from './item'
import { Rights } from './rights'

export class User {
	username!: string

	createdAt!: Date

	updatedAt!: Date

	password?: Password

	collections!: Collection[]

	comments!: Comment[]

	items!: Item[]

	rights?: Rights
}
