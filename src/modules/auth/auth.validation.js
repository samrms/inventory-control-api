import { AppError } from '../../shared/errors/app-error.js'

export function validateSignUp(req, res, next) {
    const { name, email, password } = req.body

    if (!name || name.trim().length === 0) {
        return next(new AppError('Name is required', 400))
    }

    if (!email || !email.includes('@')) {
        return next(new AppError('Valid email is required', 400))
    }

    if (!password || password.length < 6) {
        return next(new AppError('Password must be at least 6 characters', 400))
    }

    delete req.body.role

    next()
}

export function validateSignIn(req, res, next) {
    const { email, password } = req.body

    if (!email || !password) {
        return next(new AppError('Email and password are required', 400))
    }

    next()
}
