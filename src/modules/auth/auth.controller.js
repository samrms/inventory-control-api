export class AuthController {
    constructor(authService) {
        this.authService = authService
        this.signUp = this.signUp.bind(this)
        this.signIn = this.signIn.bind(this)
        this.logout = this.logout.bind(this)
    }

    async signUp(req, res, next) {
        try {
            const user = await this.authService.signUp(req.body)
            res.status(201).json({ data: user })
        } catch (err) {
            next(err)
        }
    }

    async signIn(req, res, next) {
        try {
            const result = await this.authService.signIn(req.body)
            res.json({ data: result })
        } catch (err) {
            next(err)
        }
    }

    async logout(req, res, next) {
        try {
            const token = req.headers.authorization.split(' ')[1]
            await this.authService.logout(token)
            res.status(204).end()
        } catch (err) {
            next(err)
        }
    }
}
