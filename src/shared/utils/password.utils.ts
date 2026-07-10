export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_CHARACTER_TYPES_MIN = 3

export type PasswordRequirementsState = {
  minLength: boolean
  lowercase: boolean
  uppercase: boolean
  numbers: boolean
  special: boolean
  characterTypesMet: number
  characterTypesRequirementMet: boolean
  isValid: boolean
}

export const getPasswordRequirements = (password: string): PasswordRequirementsState => {
  const minLength = password.length >= PASSWORD_MIN_LENGTH
  const lowercase = /[a-z]/.test(password)
  const uppercase = /[A-Z]/.test(password)
  const numbers = /\d/.test(password)
  const special = /[^a-zA-Z0-9]/.test(password)

  const characterTypesMet = [lowercase, uppercase, numbers, special].filter(Boolean).length
  const characterTypesRequirementMet = characterTypesMet >= PASSWORD_CHARACTER_TYPES_MIN

  return {
    minLength,
    lowercase,
    uppercase,
    numbers,
    special,
    characterTypesMet,
    characterTypesRequirementMet,
    isValid: minLength && characterTypesRequirementMet,
  }
}

export const arePasswordRequirementsComplete = (password: string): boolean => {
  const requirements = getPasswordRequirements(password)

  return requirements.minLength && requirements.characterTypesRequirementMet
}

export const isPasswordValid = (password: string) =>
  arePasswordRequirementsComplete(password)
