export const PASSWORD_MIN_LENGTH = 8

export type PasswordRequirementsState = {
  minLength: boolean
  lowercase: boolean
  uppercase: boolean
  numbers: boolean
  special: boolean
  isValid: boolean
}

export const getPasswordRequirements = (password: string): PasswordRequirementsState => {
  const minLength = password.length >= PASSWORD_MIN_LENGTH
  const lowercase = /[a-z]/.test(password)
  const uppercase = /[A-Z]/.test(password)
  const numbers = /\d/.test(password)
  const special = /[^a-zA-Z0-9]/.test(password)

  return {
    minLength,
    lowercase,
    uppercase,
    numbers,
    special,
    isValid: minLength && lowercase && uppercase && numbers && special,
  }
}

export const arePasswordRequirementsComplete = (password: string): boolean =>
  getPasswordRequirements(password).isValid

export const isPasswordValid = (password: string) =>
  arePasswordRequirementsComplete(password)
