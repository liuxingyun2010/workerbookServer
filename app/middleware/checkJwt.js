const HttpStatus = require('./httpStatus')

module.exports = () => {
  return async function response(ctx, next) {
    if (!ctx.header || !ctx.header.authorization) {
      return ctx.error({
        status: HttpStatus.StatusUnauthorized
      })
    }
    try {
      const token = ctx.header.authorization.replace('Bearer ', '')
      const app = ctx.app
      const jwt = app.jwt.verify(token, app.config.jwt.secret)
      const id = jwt.id
      let userInfo = await app.redis.get(`wb:user:${id}`)
      if (!userInfo) {
        userInfo = await ctx.service.user.findUserById(id)
      } else {
        userInfo = JSON.parse(userInfo)
      }

      if (!userInfo || userInfo.status === 2) {
        return ctx.error({
          status: HttpStatus.StatusUnauthorized
        })
      }

      ctx.userInfo = userInfo
    } catch (e) {
      return ctx.error({
        status: HttpStatus.StatusUnauthorized
      })
    }
    await next()
  }
}
