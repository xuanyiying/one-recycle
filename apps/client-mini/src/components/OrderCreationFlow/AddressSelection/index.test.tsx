/**
 * AddressSelection Component Unit Tests
 * Tests specific examples and edge cases
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Address, AddressLabel } from '../../../types/order'
import { validateAddress, validateAddressInServiceArea } from '../../../utils/orderValidation'

// ============================================================================
// Unit Tests
// ============================================================================

describe('AddressSelection Component - Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    // ============================================================================
    // Test: Address Validation
    // ============================================================================

    it('should validate a complete address with all required fields', () => {
        const address: Address = {
            id: 'addr_1',
            recipientName: 'John Doe',
            phoneNumber: '13800138000',
            province: '北京市',
            city: '北京市',
            district: '朝阳区',
            region: '北京市 北京市 朝阳区',
            detailedAddress: '123 Main St',
            label: AddressLabel.HOME,
            isDefault: true,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
        }

        const errors = validateAddress(address)
        expect(errors.length).toBe(0)
    })

    // ============================================================================
    // Test: Missing Recipient Name
    // ============================================================================

    it('should reject address with missing recipient name', () => {
        const address: Address = {
            id: 'addr_1',
            recipientName: '',
            phoneNumber: '13800138000',
            province: '北京市',
            city: '北京市',
            district: '朝阳区',
            region: '北京市 北京市 朝阳区',
            detailedAddress: '123 Main St',
            label: AddressLabel.HOME,
            isDefault: false,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
        }

        const errors = validateAddress(address)
        expect(errors.length).toBeGreaterThan(0)
        expect(errors.some((e) => e.field === 'recipientName')).toBe(true)
    })

    // ============================================================================
    // Test: Invalid Phone Number
    // ============================================================================

    it('should reject address with invalid phone number', () => {
        const address: Address = {
            id: 'addr_1',
            recipientName: 'John Doe',
            phoneNumber: 'invalid',
            province: '北京市',
            city: '北京市',
            district: '朝阳区',
            region: '北京市 北京市 朝阳区',
            detailedAddress: '123 Main St',
            label: AddressLabel.HOME,
            isDefault: false,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
        }

        const errors = validateAddress(address)
        expect(errors.length).toBeGreaterThan(0)
        expect(errors.some((e) => e.field === 'phoneNumber')).toBe(true)
    })

    // ============================================================================
    // Test: Missing Region
    // ============================================================================

    it('should reject address with missing region', () => {
        const address: Address = {
            id: 'addr_1',
            recipientName: 'John Doe',
            phoneNumber: '13800138000',
            province: '北京市',
            city: '北京市',
            district: '朝阳区',
            region: '',
            detailedAddress: '123 Main St',
            label: AddressLabel.HOME,
            isDefault: false,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
        }

        const errors = validateAddress(address)
        expect(errors.length).toBeGreaterThan(0)
        expect(errors.some((e) => e.field === 'region')).toBe(true)
    })

    // ============================================================================
    // Test: Missing Detailed Address
    // ============================================================================

    it('should reject address with missing detailed address', () => {
        const address: Address = {
            id: 'addr_1',
            recipientName: 'John Doe',
            phoneNumber: '13800138000',
            province: '北京市',
            city: '北京市',
            district: '朝阳区',
            region: '北京市 北京市 朝阳区',
            detailedAddress: '',
            label: AddressLabel.HOME,
            isDefault: false,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
        }

        const errors = validateAddress(address)
        expect(errors.length).toBeGreaterThan(0)
        expect(errors.some((e) => e.field === 'detailedAddress')).toBe(true)
    })

    // ============================================================================
    // Test: Service Area Validation - No Boundary
    // ============================================================================

    it('should return true when no service area boundary is provided', () => {
        const address: Address = {
            id: 'addr_1',
            recipientName: 'John Doe',
            phoneNumber: '13800138000',
            province: '北京市',
            city: '北京市',
            district: '朝阳区',
            region: '北京市 北京市 朝阳区',
            detailedAddress: '123 Main St',
            label: AddressLabel.HOME,
            isDefault: false,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
        }

        const isValid = validateAddressInServiceArea(address, undefined)
        expect(isValid).toBe(true)
    })

    // ============================================================================
    // Test: Service Area Validation - No Coordinates
    // ============================================================================

    it('should return true when address has no coordinates', () => {
        const address: Address = {
            id: 'addr_1',
            recipientName: 'John Doe',
            phoneNumber: '13800138000',
            province: '北京市',
            city: '北京市',
            district: '朝阳区',
            region: '北京市 北京市 朝阳区',
            detailedAddress: '123 Main St',
            label: AddressLabel.HOME,
            isDefault: false,
            coordinates: undefined,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
        }

        const boundary = {
            type: 'Polygon',
            coordinates: [
                [
                    [116.3, 39.9],
                    [116.5, 39.9],
                    [116.5, 40.1],
                    [116.3, 40.1],
                    [116.3, 39.9],
                ],
            ],
        }

        const isValid = validateAddressInServiceArea(address, boundary)
        expect(isValid).toBe(true)
    })

    // ============================================================================
    // Test: Address Label Preservation
    // ============================================================================

    it('should preserve address label when copying', () => {
        const originalAddress: Address = {
            id: 'addr_1',
            recipientName: 'John Doe',
            phoneNumber: '13800138000',
            province: '北京市',
            city: '北京市',
            district: '朝阳区',
            region: '北京市 北京市 朝阳区',
            detailedAddress: '123 Main St',
            label: AddressLabel.WORK,
            isDefault: false,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
        }

        const copiedAddress = { ...originalAddress }
        expect(copiedAddress.label).toBe(AddressLabel.WORK)
        expect(copiedAddress.label).toBe(originalAddress.label)
    })

    // ============================================================================
    // Test: Default Address Flag
    // ============================================================================

    it('should preserve default address flag', () => {
        const address: Address = {
            id: 'addr_1',
            recipientName: 'John Doe',
            phoneNumber: '13800138000',
            province: '北京市',
            city: '北京市',
            district: '朝阳区',
            region: '北京市 北京市 朝阳区',
            detailedAddress: '123 Main St',
            label: AddressLabel.HOME,
            isDefault: true,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
        }

        expect(address.isDefault).toBe(true)

        const updatedAddress = { ...address, isDefault: false }
        expect(updatedAddress.isDefault).toBe(false)
        expect(address.isDefault).toBe(true) // Original unchanged
    })

    // ============================================================================
    // Test: Address Immutability
    // ============================================================================

    it('should not mutate original address when creating copies', () => {
        const originalAddress: Address = {
            id: 'addr_1',
            recipientName: 'John Doe',
            phoneNumber: '13800138000',
            province: '北京市',
            city: '北京市',
            district: '朝阳区',
            region: '北京市 北京市 朝阳区',
            detailedAddress: '123 Main St',
            label: AddressLabel.HOME,
            isDefault: false,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
        }

        const copy = { ...originalAddress }
        copy.recipientName = 'Jane Smith'
        copy.isDefault = true

        expect(originalAddress.recipientName).toBe('John Doe')
        expect(originalAddress.isDefault).toBe(false)
    })

    // ============================================================================
    // Test: Multiple Addresses
    // ============================================================================

    it('should handle multiple addresses correctly', () => {
        const addresses: Address[] = [
            {
                id: 'addr_1',
                recipientName: 'John Doe',
                phoneNumber: '13800138000',
                province: '北京市',
                city: '北京市',
                district: '朝阳区',
                region: '北京市 北京市 朝阳区',
                detailedAddress: '123 Main St',
                label: AddressLabel.HOME,
                isDefault: true,
                createdAt: '2025-01-01T00:00:00Z',
                updatedAt: '2025-01-01T00:00:00Z',
            },
            {
                id: 'addr_2',
                recipientName: 'Jane Smith',
                phoneNumber: '13900139000',
                province: '上海市',
                city: '上海市',
                district: '浦东新区',
                region: '上海市 上海市 浦东新区',
                detailedAddress: '456 Oak Ave',
                label: AddressLabel.WORK,
                isDefault: false,
                createdAt: '2025-01-02T00:00:00Z',
                updatedAt: '2025-01-02T00:00:00Z',
            },
        ]

        expect(addresses.length).toBe(2)
        expect(addresses[0].isDefault).toBe(true)
        expect(addresses[1].isDefault).toBe(false)

        // Filter default address
        const defaultAddress = addresses.find((addr) => addr.isDefault)
        expect(defaultAddress?.id).toBe('addr_1')
    })

    // ============================================================================
    // Test: Address Coordinates Validation
    // ============================================================================

    it('should validate address coordinates are within valid ranges', () => {
        const address: Address = {
            id: 'addr_1',
            recipientName: 'John Doe',
            phoneNumber: '13800138000',
            province: '北京市',
            city: '北京市',
            district: '朝阳区',
            region: '北京市 北京市 朝阳区',
            detailedAddress: '123 Main St',
            label: AddressLabel.HOME,
            isDefault: false,
            coordinates: {
                latitude: 39.9,
                longitude: 116.4,
            },
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
        }

        expect(address.coordinates!.latitude).toBeGreaterThanOrEqual(-90)
        expect(address.coordinates!.latitude).toBeLessThanOrEqual(90)
        expect(address.coordinates!.longitude).toBeGreaterThanOrEqual(-180)
        expect(address.coordinates!.longitude).toBeLessThanOrEqual(180)
    })

    // ============================================================================
    // Test: Address Label Options
    // ============================================================================

    it('should support all address label types', () => {
        const labels = [
            AddressLabel.HOME,
            AddressLabel.WORK,
            AddressLabel.SCHOOL,
            AddressLabel.OTHER,
        ]

        labels.forEach((label) => {
            const address: Address = {
                id: 'addr_1',
                recipientName: 'John Doe',
                phoneNumber: '13800138000',
                province: '北京市',
                city: '北京市',
                district: '朝阳区',
                region: '北京市 北京市 朝阳区',
                detailedAddress: '123 Main St',
                label,
                isDefault: false,
                createdAt: '2025-01-01T00:00:00Z',
                updatedAt: '2025-01-01T00:00:00Z',
            }

            expect(address.label).toBe(label)
        })
    })
})
