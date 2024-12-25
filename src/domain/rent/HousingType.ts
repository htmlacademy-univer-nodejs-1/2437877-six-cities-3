export const HousingTypes = [
  'apartment',
  'house',
  'room',
  'hotel'
] as const;

export type HousingType = typeof HousingTypes[number];
