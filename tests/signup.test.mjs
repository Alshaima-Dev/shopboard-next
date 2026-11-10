import test from 'node:test'
import assert from 'node:assert/strict'
import { submitSignupDemo, signupValidation } from '../src/features/signup/signup-submit.ts'

test('native signup constraints retain the required email and eight-character password rule', () => {
  assert.deepEqual(signupValidation, {
    email: { required: true },
    password: { required: true, minLength: 8 },
  })
})

test('invalid demo submission prevents navigation, invokes native validation, and keeps fields unchanged', () => {
  const calls = []
  submitSignupDemo(
    {
      preventDefault: () => calls.push('preventDefault'),
      currentTarget: {
        reportValidity: () => {
          calls.push('reportValidity')
          return false
        },
        reset: () => calls.push('reset'),
      },
    },
    () => calls.push('success'),
  )
  assert.deepEqual(calls, ['preventDefault', 'reportValidity'])
})

test('valid demo submission resets before notifying and never reads credentials', () => {
  const calls = []
  const form = {
    reportValidity: () => {
      calls.push('reportValidity')
      return true
    },
    reset: () => calls.push('reset'),
    get elements() {
      throw new Error('Credentials must not be read')
    },
  }
  submitSignupDemo(
    { preventDefault: () => calls.push('preventDefault'), currentTarget: form },
    () => calls.push('success'),
  )
  assert.deepEqual(calls, [
    'preventDefault',
    'reportValidity',
    'reset',
    'success',
  ])
})
