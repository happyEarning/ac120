module.exports = (left, right, comparator) => {
  let leftOnly = []
  let intersection = []
  let rightOnly
  if (!comparator) {
    comparator = (l, r) => {
      return l === r
    }
  }
  left.forEach(l => {
    let found = right.find(r => {
      return comparator(l, r)
    })
    if (found) {
      intersection.push(found)
    } else {
      leftOnly.push(l)
    }
  })
  rightOnly = right.filter(r => {
    return !intersection.find(i => {
      return comparator(i, r)
    })
  })
  return {
    leftOnly,
    rightOnly,
    intersection
  }
}
