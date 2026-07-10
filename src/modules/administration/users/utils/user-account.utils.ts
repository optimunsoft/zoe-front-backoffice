import type { User, UserAccount } from '../types/users.types'

const resolveUserAccounts = (user: Pick<User, 'accounts' | 'account'>): UserAccount[] => {
  if (user.accounts?.length) return user.accounts

  if (!user.account) return []

  return Array.isArray(user.account) ? user.account : [user.account]
}

export const getPrimaryUserAccount = (user: Pick<User, 'accounts' | 'account'>): UserAccount | null => {
  const accounts = resolveUserAccounts(user)
  if (!accounts.length) return null

  return accounts.find((account) => !account.isDeleted) ?? accounts[0] ?? null
}

export const resolveUserAccountDemo = (user: Pick<User, 'accounts' | 'account'>): boolean | null => {
  const account = getPrimaryUserAccount(user)
  if (!account || typeof account.isDemo !== 'boolean') return null

  return account.isDemo
}

export const mapUserDemoLabel = (user: Pick<User, 'accounts' | 'account'>): string => {
  const isDemo = resolveUserAccountDemo(user)
  if (isDemo === null) return 'No Aplica'

  return isDemo ? 'Sí' : 'No'
}
