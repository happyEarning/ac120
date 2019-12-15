module.exports = () => {
  return {
    preUpdate: (req, res, next) => {
      const payment = req.body
      if (payment.invoice) {
        req.body = { invoice: payment.invoice }
      }
      next()
    }
  }
}
