export class ReservationsController {
    constructor(reservationsService) {
        this.reservationsService = reservationsService
    }

    async list(req, res, next) {
        try {
            const result = await this.reservationsService.list(req.query)
            res.json(result)
        } catch (err) {
            next(err)
        }
    }

    async getById(req, res, next) {
        try {
            const reservation = await this.reservationsService.getById(
                req.params.id
            )
            res.json({ data: reservation })
        } catch (err) {
            next(err)
        }
    }

    async create(req, res, next) {
        try {
            const reservation = await this.reservationsService.create(
                req.body,
                req.user.id
            )
            res.status(201).json({ data: reservation })
        } catch (err) {
            next(err)
        }
    }

    async release(req, res, next) {
        try {
            const reservation = await this.reservationsService.release(
                req.params.id,
                req.user.id
            )
            res.json({ data: reservation })
        } catch (err) {
            next(err)
        }
    }

    async fulfill(req, res, next) {
        try {
            const reservation = await this.reservationsService.fulfill(
                req.params.id,
                req.user.id
            )
            res.json({ data: reservation })
        } catch (err) {
            next(err)
        }
    }
}
