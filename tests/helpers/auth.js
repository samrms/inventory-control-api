import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret'

export function generateToken(userId, role = 'ADMIN') {
    return jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '1h' })
}

export function createAuthHeaders(token) {
    return { Authorization: `Bearer ${token}` }
}
