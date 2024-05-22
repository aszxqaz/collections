import { ItemPropType } from '@prisma/client';
import { withZod } from '@remix-validated-form/with-zod';
import { z } from 'zod';
// import { zfd } from 'zod-form-data';

// export type ItemPropTypeCLient = keyof typeof ItemPropTypeClient;
export type ItemPropTypeCLient = ItemPropType;

export const ItemPropTypeClient = {
  Int: 'Integer',
  LineText: 'Text',
  MultilineText: 'Multiline text',
  Bool: 'Boolean',
  Date: 'Date',
} as const;

export function validatePassword(password: unknown) {
  if (typeof password !== 'string' || !password.length) {
    return 'Password is required';
  }

  if (password.length < 4) {
    return 'Password must contain 4 or more characters';
  }
}

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, { message: 'Minimum length is 3 characters' })
      .max(20, { message: 'Maximum length is 20 characters' }),
    password: z.string().min(4, { message: 'Minimum length is 4 characters' }),
    confirmPassword: z.string().min(4, { message: 'Minimum length is 4 characters' }),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'The passwords did not match',
        path: ['confirmPassword'],
      });
    }
  });

export const registerValidator = withZod(registerSchema);

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, { message: 'Minimum length is 3 characters' })
    .max(20, { message: 'Maximum length is 20 characters' }),
  password: z.string().min(4, { message: 'Minimum length is 4 characters' }),
});

export const loginValidator = withZod(loginSchema);

export function createCreateCollectionSchema(categories: { name: string }[], propsCount: number) {
  const base = {
    name: z.string().trim().min(3).max(64),
    description: z.string().trim().min(3).max(512),
    category: z.enum(categories.map(cat => cat.name) as unknown as readonly [string, ...string[]]),
  } as { [fieldName: string]: any };
  for (let i = 0; i < propsCount; i++) {
    base[`prop-${i}-type`] = z.string().trim().min(3);
    base[`prop-${i}-name`] = z.string().trim().min(3);
  }
  return withZod(z.object(base));
}

export function createCreateItemSchema(
  itemCount: number,
  schemes: { type: ItemPropTypeCLient; name: string }[],
) {
  const base = {
    // 'item-count': z.number(),
  } as { [fieldName: string]: any };
  for (let itemIdx = 0; itemIdx < itemCount; itemIdx++) {
    base[`item-${itemIdx}-name`] = z.string().trim().min(3).max(64);
    for (let propIdx = 0; propIdx < schemes.length; propIdx++) {
      const key = `item-${itemIdx}-prop-${propIdx}-value`;
      switch (schemes[propIdx].type) {
        case 'Date':
          base[key] = z
            .string()
            .min(1, { message: 'Should not be empty' })
            .date('Should be a valid date');
          break;
        case 'Int':
          base[key] = z
            .string()
            .trim()
            .min(1, { message: 'Should not be empty' })
            .regex(/^\-?(0|[1-9]+[0-9]*)$/, { message: 'Should be a valid integer' })
            .transform(Number);
          break;
        case 'LineText':
          base[key] = z
            .string()
            .trim()
            .min(1, { message: 'Should not be empty' })
            .max(32, { message: 'Should be 32 chars max' });
          break;
        case 'MultilineText':
          base[key] = z
            .string()
            .trim()
            .min(1, { message: 'Should not be empty' })
            .max(512, { message: 'Should be 512 chars max' });
          break;
        case 'Bool':
          base[key] = z.any().transform(s => (s === 'on' ? true : false));
          break;
      }
    }
  }
  return z.object(base);
}

// export function createZfdCreateItemSchema(
//   itemCount: number,
//   schemes: { type: ItemPropType; name: string }[],
// ) {
//   const base = {} as { [fieldName: string]: any };
//   for (let itemIdx = 0; itemIdx < itemCount; itemIdx++) {
//     base[`item-${itemIdx}-name`] = z.string().trim().min(3).max(64);
//     for (let propIdx = 0; propIdx < schemes.length; propIdx++) {
//       const key = `item-${itemIdx}-prop-${propIdx}-value`;
//       switch (schemes[propIdx].type) {
//         case 'Date':
//           base[key] = z
//             .string()
//             .min(1, { message: 'Should not be empty' })
//             .date('Should be a valid date');
//           break;
//         case 'Int':
//           base[key] = z
//             .string()
//             .trim()
//             .min(1, { message: 'Should not be empty' })
//             .regex(/^\-?(0|[1-9]+[0-9]*)$/, { message: 'Should be a valid integer' })
//             .transform(Number);
//           break;
//         case 'LineText':
//           base[key] = z
//             .string()
//             .trim()
//             .min(1, { message: 'Should not be empty' })
//             .max(32, { message: 'Should be 32 chars max' });
//           break;
//         case 'MultilineText':
//           base[key] = z
//             .string()
//             .trim()
//             .min(1, { message: 'Should not be empty' })
//             .max(512, { message: 'Should be 512 chars max' });
//           break;
//         case 'Bool':
//           base[key] = z.any();
//           break;
//       }
//     }
//   }
//   return zfd.formData(base);
// }
