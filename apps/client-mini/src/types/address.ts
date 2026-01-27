/**
 * Unified Address Types
 */

export enum AddressLabel {
  HOME = 'home',
  WORK = 'work',
  SCHOOL = 'school',
  OTHER = 'other',
}

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface Address {
  id?: string | number
  recipientName: string
  phoneNumber: string
  province: string
  city: string
  district: string
  street?: string
  detailedAddress: string
  postalCode?: string
  label?: AddressLabel
  isDefault?: boolean
  coordinates?: Coordinates
  region?: string // Display string: "Province City District"
  createdAt?: string
  updatedAt?: string
}

export interface AddressFormData extends Omit<Address, 'id' | 'createdAt' | 'updatedAt'> {}

export interface Region {
  code: string
  name: string
  children?: Region[]
}

export interface LocationInfo {
  address: string
  province: string
  city: string
  district: string
  street?: string
  name?: string
  coordinates: Coordinates
}
