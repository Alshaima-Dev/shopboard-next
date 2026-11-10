export const API_BASE_URL = 'https://shopboard-api-nu.vercel.app'
export const DEFAULT_API_TIMEOUT_MS = 5_000

export type ApiScenario = 'normal' | 'delay' | 'fail' | 'empty'

export function getApiScenario(value: unknown): ApiScenario {
  return value === 'delay' || value === 'fail' || value === 'empty'
    ? value
    : 'normal'
}

export const DEFAULT_API_SCENARIO = getApiScenario(
  process.env.SHOPBOARD_API_SCENARIO,
)

export function buildApiUrl(
  endpoint: string,
  scenario: ApiScenario = DEFAULT_API_SCENARIO,
): string {
  const prefixes: Record<ApiScenario, string> = {
    normal: '',
    delay: '/delay/3000',
    fail: '/fail/500',
    empty: '/empty',
  }
  // Compose the prefix with the endpoint, never with the URL base: a leading
  // endpoint slash would otherwise discard /delay/3000, /fail/500, or /empty.
  return new URL(
    `${prefixes[scenario]}/${endpoint.replace(/^\/+/, '')}`,
    API_BASE_URL,
  ).href
}

export interface ApiFetcher {
  (input: string, init: RequestInit): Promise<Response>
}

export interface FetchJsonOptions {
  fetcher?: ApiFetcher
  timeoutMs?: number
  scenario?: ApiScenario
}

export class ApiHttpError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`Request failed with status ${status}`)
    this.name = 'ApiHttpError'
    this.status = status
  }
}

export class ApiJsonError extends Error {
  constructor() {
    super('Response did not contain valid JSON')
    this.name = 'ApiJsonError'
  }
}

export class ApiTimeoutError extends Error {
  constructor() {
    super('Request timed out')
    this.name = 'ApiTimeoutError'
  }
}

export async function fetchJson(
  endpoint: string,
  {
    fetcher = globalThis.fetch,
    timeoutMs = DEFAULT_API_TIMEOUT_MS,
    scenario = DEFAULT_API_SCENARIO,
  }: FetchJsonOptions = {},
): Promise<unknown> {
  const controller = new AbortController()
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs)

  try {
    const url = buildApiUrl(endpoint, scenario)
    const response = await fetcher(url, { signal: controller.signal, cache: 'no-store' })
    if (!response.ok) throw new ApiHttpError(response.status)

    try {
      return await response.json()
    } catch {
      throw new ApiJsonError()
    }
  } catch (error: unknown) {
    if (controller.signal.aborted) throw new ApiTimeoutError()
    throw error
  } finally {
    globalThis.clearTimeout(timeout)
  }
}
