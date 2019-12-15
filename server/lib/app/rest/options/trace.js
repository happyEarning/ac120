// const Trace = require('../../../models/trace')

let _pre = (req, res, next) => {
  req.$trace = {
    snapshot: {}
  }
  if (req.params.id) {
    req.$trace.snapshot.pre = req.erm.document.toJSON()
  }
  next()
}

let _post = (req, res, next) => {
  let ref
  let post
  if (req.method === 'POST') {
    ref = req.erm.result.id
    post = req.erm.result.toJSON()
  } else if (req.method === 'PATCH') {
    ref = req.erm.document.id
    post = req.erm.document.toJSON()
  } else if (req.method === 'DELETE') {
    ref = req.erm.document.id
  }
  let trace = new Trace({
    type: req.method,
    message: `${req.method} ${req.erm.model.collection.collectionName}`,
    stack: new Error().stack,
    by: {
      userRef: req.$session.getUserRef(),
      staffRef: req.$session.getStaffRef()
    },
    target: {
      ref,
      collectionName: req.erm.model.collection.collectionName,
      snapshot: {
        pre: req.$trace.snapshot.pre,
        post
      }
    }
  })

  trace.save(next)
}

module.exports = {
  // preCreate: _pre,
  // preUpdate: _pre,
  // preDelete: _pre,
  // postCreate: _post,
  // postUpdate: _post,
  // postDelete: _post
}
