const dp = require('dot-prop')

// const common = require('../../../../../common')
// const Role = require('../../../models/role')

const getResourceName = req => {
  // /rest/orderDetails/:id
  return req.route.path.split('/')[2]
}

const METHOD_TO_PERMISSION = {
  post: 'c',
  delete: 'd',
  get: 'r',
  put: 'u',
  patch: 'u'
}

const permissionRestricted = req => {
  let name = getResourceName(req)
  let p = METHOD_TO_PERMISSION[req.method.toLowerCase()]
  if (Role.schema.paths[`resource.${name}.permission.${p}`]) {
    return true
  } else {
    return false
  }
}

const getPermissionWithFilters = async (req) => {
  let roles = await Role.find({ _id: { $in: req.$injection.staff.roleRefs } })
  let role = common.staff.mergeRoles(roles)

  let name = getResourceName(req)
  let p = METHOD_TO_PERMISSION[req.method.toLowerCase()]

  let permission = dp.get(role, `resource.${name}.permission.${p}`)
  let filters
  if (permission) {
    filters = dp.get(role, `resource.${name}.filter${p.toUpperCase()}`) || []
  }
  return {
    permission,
    filters
  }
}

const roleBasedPre = async (req, res, next) => {
  let pf = await getPermissionWithFilters(req)
  let { permission } = pf
  if (permission) {
    next()
  } else {
    next(new Error(`当前管理员没有权限 ${req.method} ${getResourceName(req)}`))
  }
}

let roleBasedContextFilter = async (model, req, done) => {
  let pf = await getPermissionWithFilters(req)
  let { permission, filters } = pf

  if (permission) {
    let criterias = []
    for (let i = 0; i < filters.length; i++) {
      let filter = filters[i]
      if (model.parseFilter) {
        let criteria = await model.parseFilter(req, filter)
        criterias.push(criteria)
      }
    }
    criterias = criterias.filter(criteria => criteria)
    if (criterias.length) {
      model = model.find({ $or: criterias })
    }
  } else {
    // Filter all
    model = model.find({ _id: { $in: [] } })
  }
  done(model)
}

const userBasedPre = (req, res, next) => {
  let model = req.erm.model
  if (model.schema.paths.userRef) {
    if (req.$session.getUserRef() === req.body.userRef) {
      next()
    } else {
      next(new Error(`当前用户没有权限 ${req.method} 其他用户（${req.body.userRef}）的 ${getResourceName(req)}`))
    }
  } else {
    next()
  }
}

let userBasedContextFilter = (model, req, done) => {
  if (model.schema.paths.userRef) {
    done(model.find({
      userRef: req.$session.getUserRef()
    }))
  } else {
    done(model)
  }
}

let pre = (req, res, next) => {
  if (permissionRestricted(req)) {
    req.$session.getStaffRef() ? roleBasedPre(req, res, next) : userBasedPre(req, res, next)
  } else {
    next()
  }
}

module.exports = {
  // contextFilter: (model, req, done) => {
  //   if (permissionRestricted(req)) {
  //     req.$session.getStaffRef() ? roleBasedContextFilter(model, req, done) : userBasedContextFilter(model, req, done)
  //   } else {
  //     done(model)
  //   }
  // },
  // preCreate: pre,
  // preUpdate: pre,
  // preDelete: pre
}
