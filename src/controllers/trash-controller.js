import trashModel from '../models/trash-model.js'

class TrashController {
  async trash(req, res) {
    const result = await trashModel.trash()

    return res.status(200).json(result)
  }

  async trashById(req, res) {
    const { id } = req.params
    const result = await trashModel.trash({ id })

    return res.status(200).json(result)
  }

  async restore(req, res) {
    const { id } = req.params

    const result = await trashModel.restore({ id })

    return res.status(200).json(result)
  }
}

export default new TrashController()
