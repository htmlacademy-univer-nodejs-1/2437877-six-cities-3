export const UserTypes = [
  'regular',
  'pro'
] as const;

export type UserType = typeof UserTypes[number];
