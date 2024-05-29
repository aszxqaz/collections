import { User } from './user'
import { Category } from './category'
import { Scheme } from './scheme'
import { Item } from './item'

export class Collection {
	name!: string

	slug!: string

	description!: string

	createdAt!: Date

	updatedAt!: Date

	user!: User

	username!: string

	Category!: Category

	category!: string

	schemes!: Scheme[]

	items!: Item[]
}
