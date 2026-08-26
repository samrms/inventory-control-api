export class UsersController {
    constructor(usersService) {
        this.usersService = usersService
    }

    async list(req, res, next) {
        try {
            const result = await this.usersService.list(req.query)
            res.json(result)
        } catch (err) {
            next(err)
        }
    }

    async getById(req, res, next) {
        try {
            const user = await this.usersService.getById(req.params.id)
            res.json({ data: user })
        } catch (err) {
            next(err)
        }
    }

    async update(req, res, next) {
        try {
            const user = await this.usersService.update(req.params.id, req.body)
            res.json({ data: user })
        } catch (err) {
            next(err)
        }
    }

    async delete(req, res, next) {
        try {
            await this.usersService.delete(req.params.id)
            res.status(204).end()
        } catch (err) {
            next(err)
        }
    }
}
