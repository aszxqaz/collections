import { Item } from './item'
import { Scheme } from './scheme'

export class Property {
	value!: string

	item!: Item

	itemId!: number

	scheme!: Scheme

	schemeId!: number
}
