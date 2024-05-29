import { Collection } from './collection'
import { Item } from './item'
import { Property } from './property'
import { PropertyType } from '@prisma/client'

export class Scheme {
	id!: number

	name!: string

	type!: PropertyType

	collection!: Collection

	username!: string

	slug!: string

	items!: Item[]

	properties!: Property[]
}
