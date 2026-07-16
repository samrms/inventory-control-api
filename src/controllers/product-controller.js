import productModel from '../models/product-model.js'

class ProductController {
  async main(req, res) {
    const products = await productModel.findAll()

    return res.status(200).json(products)
  }

  async create(req, res) {
    const products = await productModel.create({ product: req.body })

    return res.status(201).json(products)
  }

  async byId(req, res) {
    const { id } = req.params

    const result = await productModel.findById({ id })

    return res.status(200).json(result)
  }

  async uptdate(req, res) {
    const { id } = req.params

    const result = await productModel.update({ id, body: req.body })

    return res.status(200).json(result)
  }

  async delete(req, res) {
    const { id } = req.params

    const result = await productModel.delete({ id })

    return res.status(204).json(result)
  }
}

export default new ProductController()
