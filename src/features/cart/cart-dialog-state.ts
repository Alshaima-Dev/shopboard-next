export interface CartDialogState {
  isOpen: boolean
  confirmClear: boolean
}

export type CartDialogAction =
  'open' | 'close' | 'requestClear' | 'cancelClear' | 'empty'

export const initialCartDialogState: CartDialogState = {
  isOpen: false,
  confirmClear: false,
}

export function cartDialogReducer(
  state: CartDialogState,
  action: CartDialogAction,
): CartDialogState {
  switch (action) {
    case 'open':
      return { isOpen: true, confirmClear: false }
    case 'close':
      return initialCartDialogState
    case 'requestClear':
      return { ...state, confirmClear: state.isOpen }
    case 'cancelClear':
    case 'empty':
      return { ...state, confirmClear: false }
  }
}
