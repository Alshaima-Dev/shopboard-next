// The saved cart maps product ID strings directly to numeric quantities.
export type CartItem = number
export type Cart = Record<string, CartItem>

export type CartStorage = Pick<Storage, 'getItem' | 'setItem'>
