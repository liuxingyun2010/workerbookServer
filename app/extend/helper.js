module.exports = {
  // 只判断是否是24位
  isObjectId: id => {
    return String(id).length === 24
  },

  isInt: str => {
    const reg = /^[1-9]\d*|0$/
    return reg.test(str)
  }
}
