import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthController } from '../../src/modules/auth/auth.controller.js'

function createMockService(overrides = {}) {
    return {
        signUp: vi.fn(),
        signIn: vi.fn(),
        ...overrides,
    }
}

describe('AuthController', () => {
    let controller
    let mockService

    beforeEach(() => {
        mockService = createMockService()
        controller = new AuthController(mockService)
    })

    describe('signUp', () => {
        it('should return 201 with user data', async () => {
            const user = {
                id: '123',
                name: 'Test',
                email: 'test@test.com',
                role: 'OPERATOR',
            }
            mockService.signUp.mockResolvedValue(user)

            const req = {
                body: {
                    name: 'Test',
                    email: 'test@test.com',
                    password: '123456',
                },
            }
            const res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn(),
            }
            const next = vi.fn()

            await controller.signUp(req, res, next)

            expect(res.status).toHaveBeenCalledWith(201)
            expect(res.json).toHaveBeenCalledWith({ data: user })
        })

        it('should call next on error', async () => {
            mockService.signUp.mockRejectedValue(
                new Error('Email already in use')
            )

            const req = { body: {} }
            const res = {}
            const next = vi.fn()

            await controller.signUp(req, res, next)

            expect(next).toHaveBeenCalledWith(expect.any(Error))
        })
    })

    describe('signIn', () => {
        it('should return token and user', async () => {
            const result = {
                token: 'jwt-token',
                user: { id: '123', name: 'Test', role: 'ADMIN' },
            }
            mockService.signIn.mockResolvedValue(result)

            const req = { body: { email: 'test@test.com', password: '123456' } }
            const res = { json: vi.fn() }
            const next = vi.fn()

            await controller.signIn(req, res, next)

            expect(res.json).toHaveBeenCalledWith({ data: result })
        })
    })
})
