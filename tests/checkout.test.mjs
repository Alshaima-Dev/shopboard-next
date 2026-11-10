import test from 'node:test'
import assert from 'node:assert/strict'
import { createFormControl } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  checkoutSchema,
  checkoutDefaults,
} from '../src/features/checkout/checkout-schema.ts'
import {
  completeDemoCheckout,
  createDemoCheckoutReceipt,
} from '../src/features/checkout/checkout-logic.ts'
import {
  checkoutMessages,
  checkoutErrorMessage,
} from '../src/features/checkout/checkout-messages.ts'
import { createCartController } from '../src/features/cart/cart-controller.ts'
import { products } from '../src/features/products/product-data.ts'

const valid = {
  fullName: 'Demo Visitor',
  email: 'demo@example.test',
  phone: '',
  address: '12 Demo Street',
  city: 'Demo City',
  postalCode: '34000',
  country: 'Türkiye',
  demoAcknowledged: true,
}

test('one checkout schema trims values and accepts international names, addresses and phone digits', () => {
  for (const fullName of ['Demo Visitor', 'زائر تجريبي', 'Çağrı Örnek']) {
    const value = checkoutSchema.parse({
      ...valid,
      fullName: `  ${fullName}  `,
      email: ' demo@example.test ',
      phone: '+٩٠ ٥٥٥ ١٢٣ ٤٥٦٧',
      address: '  12 Demo Street  ',
    })
    assert.equal(value.fullName, fullName)
    assert.equal(value.email, valid.email)
    assert.equal(value.address, valid.address)
  }
  assert.equal(
    checkoutSchema.safeParse({ ...valid, phone: '+90 (555) 123-4567' }).success,
    true,
  )
})

test('checkout rejects invalid, overlong, whitespace-only and unacknowledged inputs with field errors', () => {
  for (const [field, value] of [
    ['fullName', ' '],
    ['email', 'not-email'],
    ['phone', 'letters'],
    ['phone', '123'],
    ['address', 'x'],
    ['city', ' '],
    ['postalCode', ''],
    ['country', 'x'],
    ['demoAcknowledged', false],
    ['fullName', 'x'.repeat(101)],
    ['email', 'x'.repeat(255)],
    ['phone', '1'.repeat(31)],
    ['address', 'x'.repeat(201)],
    ['city', 'x'.repeat(101)],
    ['postalCode', 'x'.repeat(21)],
    ['country', 'x'.repeat(101)],
  ]) {
    const result = checkoutSchema.safeParse({ ...valid, [field]: value })
    assert.equal(result.success, false, field)
    assert.ok(
      result.error.issues.some((issue) => issue.path[0] === field),
      field,
    )
  }
})

test('React Hook Form and the Zod resolver block invalid submission and expose submission state', async () => {
  const form = createFormControl({
    resolver: zodResolver(checkoutSchema),
    defaultValues: checkoutDefaults,
  })
  const states = []
  const unsubscribe = form.subscribe({
    formState: { isSubmitting: true },
    callback: (state) => states.push(state.isSubmitting),
  })
  let submitted = false
  let errors
  await form.handleSubmit(
    () => {
      submitted = true
    },
    (invalid) => {
      errors = invalid
    },
  )()
  assert.equal(submitted, false)
  for (const field of [
    'fullName',
    'email',
    'address',
    'city',
    'postalCode',
    'country',
    'demoAcknowledged',
  ])
    assert.ok(errors[field], field)
  assert.equal(errors.phone, undefined)
  assert.ok(states.includes(true))
  assert.equal(states.at(-1), false)
  unsubscribe()
})

test('valid checkout resets only form details and publishes a demo summary without changing persistence', async () => {
  const saved = new Map([['shopboard-catalog-cart-v2', '{"1":2}']])
  const storage = {
    getItem: (key) => saved.get(key),
    setItem: (key, value) => saved.set(key, value),
  }
  const cart = createCartController(products)
  cart.restoreStorage(storage)
  const before = cart.getSnapshot()
  const form = createFormControl({
    resolver: zodResolver(checkoutSchema),
    defaultValues: valid,
  })
  let receipt
  const calls = []
  await form.handleSubmit(() => {
    assert.equal(
      completeDemoCheckout(
        products,
        cart.getQuantities,
        () => {
          calls.push('reset')
          form.reset(checkoutDefaults)
        },
        (value) => {
          calls.push('complete')
          receipt = value
        },
      ),
      true,
    )
  })()
  assert.deepEqual(calls, ['reset', 'complete'])
  assert.deepEqual(receipt, { count: 2, subtotal: 178 })
  assert.equal(cart.getSnapshot(), before)
  assert.equal(saved.get('shopboard-catalog-cart-v2'), '{"1":2}')
  assert.equal(saved.size, 1)
  assert.equal(form.getValues().email, '')
  assert.equal(form.getValues().address, '')
  assert.deepEqual(Object.keys(receipt), ['count', 'subtotal'])
})

test('checkout rechecks the current cart after validation and blocks a cart emptied during submission', async () => {
  const cart = createCartController(products)
  cart.restoreStorage(null)
  cart.addItem(1)
  const form = createFormControl({
    resolver: zodResolver(checkoutSchema),
    defaultValues: valid,
  })
  let completed = false
  let accepted
  const pending = form.handleSubmit(() => {
    accepted = completeDemoCheckout(
      products,
      cart.getQuantities,
      () => assert.fail('No reset for empty cart'),
      () => {
        completed = true
      },
    )
  })()
  cart.removeItem(1)
  await pending
  assert.equal(accepted, false)
  assert.equal(completed, false)
  assert.equal(
    createDemoCheckoutReceipt(products, cart.getQuantities()),
    undefined,
  )
})

test('demo subtotal follows current catalog prices and error codes translate without changing form values', () => {
  assert.deepEqual(
    createDemoCheckoutReceipt(
      products.map((product) => ({ ...product, price: 100 })),
      { 1: 2 },
    ),
    { count: 2, subtotal: 200 },
  )
  const fieldKeys = Object.keys(checkoutMessages.en.fields)
  const errorKeys = Object.keys(checkoutMessages.en.errors)
  for (const language of ['en', 'ar', 'tr']) {
    assert.deepEqual(Object.keys(checkoutMessages[language].fields), fieldKeys)
    assert.deepEqual(Object.keys(checkoutMessages[language].errors), errorKeys)
    assert.equal(
      checkoutErrorMessage('email', language),
      checkoutMessages[language].errors.email,
    )
    assert.equal(
      checkoutErrorMessage('unknown', language),
      checkoutMessages[language].errors.invalid,
    )
    assert.equal(checkoutErrorMessage(undefined, language), undefined)
  }
})
