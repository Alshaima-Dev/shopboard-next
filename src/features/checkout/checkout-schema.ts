import { z } from 'zod'

// Error codes remain stable so changing language never rebuilds or resets the form.
export const checkoutSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { error: 'name' })
    .max(100, { error: 'tooLong' }),
  email: z
    .string()
    .trim()
    .max(254, { error: 'tooLong' })
    .pipe(z.email({ error: 'email' })),
  phone: z
    .string()
    .trim()
    .max(30, { error: 'phone' })
    .refine(
      (value) =>
        value === '' ||
        (/^\+?[\p{Nd} ()-]+$/u.test(value) &&
          value.replace(/\P{Nd}/gu, '').length >= 7),
      { error: 'phone' },
    ),
  address: z
    .string()
    .trim()
    .min(3, { error: 'address' })
    .max(200, { error: 'tooLong' }),
  city: z
    .string()
    .trim()
    .min(1, { error: 'required' })
    .max(100, { error: 'tooLong' }),
  postalCode: z
    .string()
    .trim()
    .min(1, { error: 'required' })
    .max(20, { error: 'tooLong' }),
  country: z
    .string()
    .trim()
    .min(2, { error: 'country' })
    .max(100, { error: 'tooLong' }),
  demoAcknowledged: z
    .boolean()
    .refine((value) => value, { error: 'demoRequired' }),
})

export type CheckoutValues = z.infer<typeof checkoutSchema>
export type CheckoutFieldName = Exclude<
  keyof CheckoutValues,
  'demoAcknowledged'
>
export type CheckoutErrorCode =
  | 'name'
  | 'email'
  | 'phone'
  | 'address'
  | 'required'
  | 'country'
  | 'tooLong'
  | 'demoRequired'
  | 'invalid'

export const checkoutDefaults: CheckoutValues = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  country: '',
  demoAcknowledged: false,
}
