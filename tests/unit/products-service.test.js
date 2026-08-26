import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProductsService } from '../../src/modules/products/products.service.js'
import { AppError } from '../../src/shared/errors/app-error.js'

function createMockRepo(overrides = {}) {
    return {
        findAll: vi.fn(),
        findById: vi.fn(),
        findBySku: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        ...overrides,
    }
}

function createMockAudit() {
    return { create: vi.fn() }
}

describe('ProductsService', () => {
    let service
    let mockRepo
    let mockAudit

    beforeEach(() => {
        mockRepo = createMockRepo()
        mockAudit = createMockAudit()
        service = new ProductsService(mockRepo, mockAudit, AppError)
    })

    describe('list', () => {
        it('should return paginated products', async () => {
            const mockResult = { data: [], pagination: { total: 0 } }
            mockRepo.findAll.mockResolvedValue(mockResult)

            const result = await service.list({ page: 1, limit: 20 })

            expect(mockRepo.findAll).toHaveBeenCalledWith({
                page: 1,
                limit: 20,
            })
            expect(result).toEqual(mockResult)
        })
    })

    describe('getById', () => {
        it('should return a product', async () => {
            const product = { id: '123', sku: 'KB-001', name: 'Keyboard' }
            mockRepo.findById.mockResolvedValue(product)

            const result = await service.getById('123')

            expect(result).toEqual(product)
        })

        it('should throw 404 if not found', async () => {
            mockRepo.findById.mockResolvedValue(null)

            await expect(service.getById('nonexistent')).rejects.toThrow(
                'Product not found'
            )
        })
    })

    describe('create', () => {
        it('should create a product', async () => {
            mockRepo.findBySku.mockResolvedValue(null)
            mockRepo.create.mockResolvedValue({
                id: '123',
                sku: 'KB-001',
                name: 'Keyboard',
            })

            const result = await service.create(
                { sku: 'KB-001', name: 'Keyboard', price: 100 },
                'user-1'
            )

            expect(result.sku).toBe('KB-001')
            expect(mockAudit.create).toHaveBeenCalled()
        })

        it('should throw 409 if SKU exists', async () => {
            mockRepo.findBySku.mockResolvedValue({ id: 'existing' })

            await expect(
                service.create({ sku: 'KB-001', name: 'Keyboard' }, 'user-1')
            ).rejects.toThrow('SKU already exists')
        })
    })

    describe('delete', () => {
        it('should soft-delete a product', async () => {
            mockRepo.findById.mockResolvedValue({ id: '123' })
            mockRepo.delete.mockResolvedValue({ id: '123' })

            await service.delete('123', 'user-1')

            expect(mockRepo.delete).toHaveBeenCalledWith('123')
            expect(mockAudit.create).toHaveBeenCalled()
        })

        it('should throw 404 if not found', async () => {
            mockRepo.findById.mockResolvedValue(null)

            await expect(
                service.delete('nonexistent', 'user-1')
            ).rejects.toThrow('Product not found')
        })
    })
})
