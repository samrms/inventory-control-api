export class AuthController {
    constructor(authService) {
        this.authService = authService
    }

    async register(req, res, next) {
        try {
            const user = await this.authService.register(req.body)
            res.status(201).json({ data: user })
        } catch (err) {
            next(err)
        }
    }

    async login(req, res, next) {
        try {
            const result = await this.authService.login(req.body)
            res.json({ data: result })
        } catch (err) {
            next(err)
        }
    }
}
