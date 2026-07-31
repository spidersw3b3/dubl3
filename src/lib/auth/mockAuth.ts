import type { AuthUser, UserProfile } from '@/lib/types/profile'

const MOCK_SESSION_KEY = 'dubl-mock-session'

export const TEST_CREDENTIALS = {
  email: 'test@dubl.app',
  password: 'TestDubl123!',
} as const

const MOCK_PROFILE: UserProfile = {
  id: '00000000-0000-4000-8000-000000000001',
  username: 'testuser',
  email: TEST_CREDENTIALS.email,
  display_name: 'Test User',
  address_json: {
    street: '123 Market St',
    city: 'San Francisco',
    state: 'CA',
    zip: '94105',
    country: 'US',
  },
  appearance_preset: 'dark',
  is_test_account: true,
  referral_code: 'TESTREF1',
  avatar_initials: 'JD',
}

export interface MockSession {
  user: AuthUser
  profile: UserProfile
}

export function readMockSession(): MockSession | null {
  try {
    const raw = localStorage.getItem(MOCK_SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as MockSession
  } catch {
    return null
  }
}

export function writeMockSession(session: MockSession): void {
  localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session))
}

export function clearMockSession(): void {
  localStorage.removeItem(MOCK_SESSION_KEY)
}

export function mockSignIn(email: string, password: string): MockSession {
  if (email === TEST_CREDENTIALS.email && password === TEST_CREDENTIALS.password) {
    const session = { user: { id: MOCK_PROFILE.id, email }, profile: { ...MOCK_PROFILE } }
    writeMockSession(session)
    return session
  }
  throw new Error('Invalid email or password')
}

export function mockSignUp(email: string, password: string, username?: string): MockSession {
  if (password.length < 8) throw new Error('Password must be at least 8 characters')
  const initials = (username ?? email.split('@')[0]).slice(0, 2).toUpperCase()
  const session: MockSession = {
    user: { id: crypto.randomUUID(), email },
    profile: {
      id: '', // set below
      username: username ?? email.split('@')[0],
      email,
      display_name: username ?? null,
      address_json: {},
      appearance_preset: 'dark',
      is_test_account: false,
      referral_code: Math.random().toString(36).slice(2, 10).toUpperCase(),
      avatar_initials: initials,
    },
  }
  session.profile.id = session.user.id
  writeMockSession(session)
  return session
}

export function mockDevSeedLogin(): MockSession {
  return mockSignIn(TEST_CREDENTIALS.email, TEST_CREDENTIALS.password)
}

export function updateMockProfile(patch: Partial<UserProfile>): UserProfile | null {
  const session = readMockSession()
  if (!session) return null
  session.profile = { ...session.profile, ...patch }
  writeMockSession(session)
  return session.profile
}
