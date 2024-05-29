import { Collection } from './collection'
import { Scheme } from './scheme'
import { Property } from './property'
import { Tag } from './tag'
import { User } from './user'
import { Comment } from './comment'

export class Item {
	id!: number

	name!: string

	slug!: string

	createdAt!: Date

	collection!: Collection

	username!: string

	collSlug!: string

	schemes!: Scheme[]

	properties!: Property[]

	tags!: Tag[]

	likers!: User[]

	comments!: Comment[]
}
