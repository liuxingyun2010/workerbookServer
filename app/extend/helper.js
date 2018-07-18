module.exports = {
  // 只判断是否是24位
  isObjectId: id => {
    return String(id).length === 24
  }
}
