import movementModel from '../models/movement-model.js'

class MovementController {
  async create(req, res) {
    const { body } = req
    const result = await movementModel.create({ body })
    return res.status(201).json(result)
  }

  async findAll(req, res) {
    const result = await movementModel.findAll()
    return res.status(200).json(result)
  }
}

export default new MovementController()
