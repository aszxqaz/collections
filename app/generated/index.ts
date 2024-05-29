import { User as _User } from './user'
import { Rights as _Rights } from './rights'
import { Password as _Password } from './password'
import { Category as _Category } from './category'
import { Collection as _Collection } from './collection'
import { Scheme as _Scheme } from './scheme'
import { Item as _Item } from './item'
import { Comment as _Comment } from './comment'
import { Tag as _Tag } from './tag'
import { Property as _Property } from './property'

export namespace PrismaModel {
	export class User extends _User {}
	export class Rights extends _Rights {}
	export class Password extends _Password {}
	export class Category extends _Category {}
	export class Collection extends _Collection {}
	export class Scheme extends _Scheme {}
	export class Item extends _Item {}
	export class Comment extends _Comment {}
	export class Tag extends _Tag {}
	export class Property extends _Property {}

	export const extraModels = [
		User,
		Rights,
		Password,
		Category,
		Collection,
		Scheme,
		Item,
		Comment,
		Tag,
		Property,
	]
}
