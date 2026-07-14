import { ProductModel } from '../models/product-model.js'

class ProductController {
  productModel = new ProductModel()

  main = async (req, res) => {
    const products = await this.productModel.findAll()

    return res.status(200).json(products)
  }

  create = async (req, res) => {
    const products = await this.productModel.create({ product: req.body })

    return res.status(201).json(products)
  }

  byId = async (req, res) => {
    const { id } = req.params

    const result = await this.productModel.findById({ id })

    return res.status(200).json(result)
  }

  uptdate = async (req, res) => {
    const { id } = req.params

    const result = await this.productModel.update({ id, body: req.body })

    return res.status(200).json(result)
  }

  delete = async (req, res) => {
    const { id } = req.params

    const result = await this.productModel.delete({ id })

    return res.status(204).json(result)
  }
}

export default new ProductController()
