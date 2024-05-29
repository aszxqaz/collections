import { PropertyType } from '@prisma/client';

export type FilterValueType<T extends PropertyType> = T extends 'Int'
  ? number
  : T extends 'Date'
  ? Date
  : T extends 'Line' | 'Multiline'
  ? string
  : T extends 'Bool'
  ? boolean
  : never;

export type IntFilterOptions = {
  type: 'Int';
  from?: number;
  to?: number;
};

export type DateFilterOptions = {
  type: 'Date';
  from?: Date;
  to?: Date;
};

export type TextFilterOptions = {
  type: 'Line' | 'Multiline';
  query?: string;
};

export type BoolFilterOptions = {
  type: 'Bool';
  query?: boolean;
};

export type FilterOptions =
  | IntFilterOptions
  | DateFilterOptions
  | TextFilterOptions
  | BoolFilterOptions;

type IntFilterProps = {
  type: 'Int';
  options: IntFilterOptions;
  values: number[];
  onChange: (options: IntFilterOptions) => void;
};

type DateFilterProps = {
  type: 'Date';
  options: DateFilterOptions;
  values: Date[];
  onChange: (options: DateFilterOptions) => void;
};

type TextFilterProps = {
  type: 'Line' | 'Multiline';
  options: TextFilterOptions;
  values: string[];
  onChange: (options: TextFilterOptions) => void;
};

type BoolFilterProps = {
  type: 'Bool';
  options: BoolFilterOptions;
  values: boolean[];
  onChange: (options: BoolFilterOptions) => void;
};

export type FilterProps = IntFilterProps | DateFilterProps | TextFilterProps | BoolFilterProps;
