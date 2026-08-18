import movementModel from '../models/movement-model.js'

class MovementController {
    async in(req, res) {
        const { body } = req

        const result = await movementModel.in({ body })

        return res.status(201).json(result)
    }
    async out(req, res) {
        const { body } = req
        const result = await movementModel.out({ body })

        return res.status(201).json(result)
    }
    async stock(req, res) {
        const result = await movementModel.stock()
        return res.status(200).json(result)
    }
    async movement(req, res) {
        const result = await movementModel.movement()

        return res.status(200).json(result)
    }
}

export default new MovementController()
