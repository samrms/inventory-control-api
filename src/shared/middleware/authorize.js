import { AppError } from '../errors/app-error.js'

export function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError('Unauthorized', 401))
        }

        if (!roles.includes(req.user.role)) {
            return next(new AppError('Forbidden', 403))
        }

        next()
    }
}
