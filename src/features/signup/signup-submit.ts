// Native constraints are the source of truth; do not add a second schema.
export const signupValidation = {
  email: { required: true },
  password: { required: true, minLength: 8 },
}

export interface SignupSubmission {
  preventDefault: () => void
  currentTarget: Pick<HTMLFormElement, 'reportValidity' | 'reset'>
}

export function submitSignupDemo(
  event: SignupSubmission,
  onSuccess: () => void,
): void {
  event.preventDefault()
  if (!event.currentTarget.reportValidity()) return
  event.currentTarget.reset()
  onSuccess()
}
