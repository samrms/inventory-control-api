import { AppError } from '../../shared/errors/app-error.js'

const VALID_ROLES = ['ADMIN', 'MANAGER', 'OPERATOR']

export function validateUpdateUser(req, res, next) {
    const { role } = req.body

    if (role && !VALID_ROLES.includes(role)) {
        return next(
            new AppError(`Role must be one of: ${VALID_ROLES.join(', ')}`, 400)
        )
    }

    next()
}
