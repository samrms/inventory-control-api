function validateCreateMovement(req, res, next) {
  const { product_id, type, quantity } = req.body

  if (!product_id) {
    return res.status(400).json({
      message: 'Product ID is required',
    })
  }

  if (!type) {
    return res.status(400).json({
      message: 'Type is required',
    })
  }

  if (quantity <= 0) {
    return res.status(400).json({
      message: 'Quantity must be greater than zero',
    })
  }

  next()
}

export { validateCreateMovement }
