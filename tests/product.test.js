import { describe, it, expect, vi } from 'vitest'
import productController from '../src/controllers/product-controller.js'
import productModel from '../src/models/product-model.js'

vi.mock('../src/models/product-model.js', () => ({
    default: {
        findAll: vi.fn(),
    },
}))

describe('getAll', () => {
    it('should return products with status 200', async () => {
        const products = [
            {
                id: '51fb20fa-4026-44af-8b65-e02150919693',
                sku: 'SKU-001',
                name: 'Produto',
                description: 'Descrição do produto',
                price: '99.90',
                created_at: '2026-08-18T13:47:02.317Z',
                updated_at: '2026-08-18T13:47:02.317Z',
                deleted_at: null,
            },
        ]

        productModel.findAll.mockResolvedValue(products)

        const req = {}

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        }

        await productController.getAll(req, res)

        expect(productModel.findAll).toHaveBeenCalled()

        expect(res.status).toHaveBeenCalledWith(200)

        expect(res.json).toHaveBeenCalledWith(products)
    })
})
