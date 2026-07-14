import { MovementModel } from '../models/movement-model.js'

class MovementController {
  movementModel = new MovementModel()

  create = async (req, res) => {
    const { body } = req
    const result = await this.movementModel.create({ body })
    return res.status(201).json(result)
  }

  findAll = async (req, res) => {
    const result = await this.movementModel.findAll()
    return res.status(200).json(result)
  }
}

export default new MovementController()
