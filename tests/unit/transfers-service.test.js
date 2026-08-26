import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TransfersService } from '../../src/modules/transfers/transfers.service.js'
import { AppError } from '../../src/shared/errors/app-error.js'

function createMockTransfersRepo(overrides = {}) {
    return {
        findAll: vi.fn(),
        findById: vi.fn(),
        findItems: vi.fn(),
        create: vi.fn(),
        updateStatus: vi.fn(),
        ...overrides,
    }
}

function createMockInventoryRepo(overrides = {}) {
    return {
        lockAndFind: vi.fn(),
        upsert: vi.fn(),
        incrementReserved: vi.fn(),
        decrementReserved: vi.fn(),
        decrementQuantity: vi.fn(),
        ...overrides,
    }
}

function createMockAudit() {
    return { create: vi.fn() }
}

function createMockPool() {
    return {
        connect: vi.fn().mockResolvedValue({
            query: vi.fn().mockResolvedValue({ rows: [] }),
            release: vi.fn(),
        }),
    }
}

describe('TransfersService', () => {
    let service
    let mockTransfersRepo
    let mockInventoryRepo
    let mockAudit
    let mockPool

    beforeEach(() => {
        mockTransfersRepo = createMockTransfersRepo()
        mockInventoryRepo = createMockInventoryRepo()
        mockAudit = createMockAudit()
        mockPool = createMockPool()
        service = new TransfersService(
            mockTransfersRepo,
            mockInventoryRepo,
            mockAudit,
            mockPool,
            AppError
        )
    })

    describe('create', () => {
        it('should create a transfer', async () => {
            mockTransfersRepo.create.mockResolvedValue({ id: 't1' })
            mockTransfersRepo.findById.mockResolvedValue({
                id: 't1',
                source_warehouse_id: 'wh1',
                destination_warehouse_id: 'wh2',
                status: 'PENDING',
            })
            mockTransfersRepo.findItems.mockResolvedValue([])

            const result = await service.create(
                {
                    sourceWarehouseId: 'wh1',
                    destinationWarehouseId: 'wh2',
                    items: [{ productId: 'p1', quantity: 10 }],
                },
                'user-1'
            )

            expect(result.id).toBe('t1')
            expect(mockAudit.create).toHaveBeenCalled()
        })
    })

    describe('cancel', () => {
        it('should cancel a pending transfer', async () => {
            mockTransfersRepo.findById.mockResolvedValue({
                id: 't1',
                status: 'PENDING',
            })
            mockTransfersRepo.updateStatus.mockResolvedValue({
                id: 't1',
                status: 'CANCELLED',
            })
            mockTransfersRepo.findItems.mockResolvedValue([])

            await service.cancel('t1', 'user-1')

            expect(mockTransfersRepo.updateStatus).toHaveBeenCalledWith(
                't1',
                'CANCELLED'
            )
        })

        it('should throw if not pending', async () => {
            mockTransfersRepo.findById.mockResolvedValue({
                id: 't1',
                status: 'COMPLETED',
            })

            await expect(service.cancel('t1', 'user-1')).rejects.toThrow(
                'Cannot cancel transfer in status COMPLETED'
            )
        })
    })
})
