export const VEHICLE_BRAND_DEFAULTS = [
  'Jim Isuzu',
  'Toyota',
  'Hyundai',
  'Honda',
  'BYD',
  'Nissan',
  'Jet move',
  'Roar',
  'Changan',
  'Gac',
  'Jac',
  'Mercedes-Benz',
  'BMW',
  'Kia',
  'Mitsubishi',
  'Ford',
  'Volkswagen',
] as const

export const LUBRICANT_SUBCATEGORIES = [
  'Engine Oil',
  'Gear Oil',
  'Transmission Fluid',
  'Power Steering',
  'Automotive Grease',
] as const

export const PART_CATEGORY_DEFAULTS = [
  'Lubricants',
  'Engine',
  'Transmission',
  'Suspension',
  'Electrical',
  'Body',
  'HVAC - Air Condition',
] as const

export const normalizePartCategory = (value?: string | null): string | undefined => {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined

  const withSpaces = trimmed.replace(/[_-]+/g, ' ')
  const words = withSpaces.split(/\s+/).filter(Boolean)
  const titleCased = words.map((word) => {
    if (/^[A-Z0-9]+$/.test(word) && word.length <= 4) return word
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  })

  return titleCased.join(' ')
}

export const PART_CATEGORY_GROUPS = [
  { label: 'Lubricants', options: ['Lubricants', ...LUBRICANT_SUBCATEGORIES] },
  { label: 'Engine', options: ['Engine'] },
  { label: 'Transmission', options: ['Transmission'] },
  { label: 'Suspension', options: ['Suspension'] },
  { label: 'Electrical', options: ['Electrical'] },
  { label: 'Body', options: ['Body'] },
  { label: 'HVAC & Air Conditioning', options: ['HVAC - Air Condition'] },
] as const
