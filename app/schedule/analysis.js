const moment = require('moment')

module.exports = app => {
  let repeatCount = 0
  const doRepeat = (fn, count, ctx) => {
    repeatCount ++

    if (repeatCount >= count) {
      ctx.logger.info(`\n统计任务定时器当天数据未同步>>>>>>>>>>>>>>>>>>${moment().format('YYYY-MM-DD HH:mm:SS')}\n`)
      return
    }

    fn()
  }

  // let testCount = 0

  return {
    schedule: {
      cron: app.config.schedule, // 每天凌晨
      // interval: '2s',
      type: 'all', // 指定所有的 worker 都需要执行
    },

    async task(ctx) {
      try {
        const missions = await ctx.model.Mission.find({
          status: 1
        }).populate('user')
        .populate('department')
        .populate('project')


        const batchMission = []


        missions.forEach((item, index) => {
          const obj = {}
          obj.missionId = item._id
          obj.missionName = item.name
          obj.departmentId = item.department._id
          obj.departmentName = item.department.name
          obj.date = moment().format('YYYY-MM-DD')
          obj.missionProgress = item.progress
          obj.userId = item.user._id
          obj.nickname = item.user.nickname
          obj.projectId = item.project._id
          obj.projectName = item.project.name
          obj.missionDeadline = item.deadline
          obj.projectDeadline = item.project.deadline
          obj.missionDelay = new Date() > item.deadline? true: false
          obj.projectDelay = new Date() > item.project.deadline? true: false
          obj.projectProgress = item.project.progress

          // if (true){
          //   obj.date = moment().subtract(Math.max(40 - testCount, 0), 'day').format('YYYY-MM-DD')
          //   obj.missionProgress = Math.min(testCount + Math.floor(5* Math.random()), 100)
          //   obj.projectProgress = Math.min(Math.floor((testCount + Math.floor(5* Math.random())) / 2), 100)
          // }

          batchMission.push(obj)
        })
        await ctx.model.Analysis.create(batchMission)
      }
      catch(error){
        ctx.logger.info(`\定时器问题>>>>>>>>>>>>>>>>>>\n${error && error.stack? error.stack: resMsg}\n`)

        // 如果捕获到错误，则重新执行定时任务
        doRepeat(async (ctx) => {
          await app.runSchedule('analysis')
        }, 10, ctx)
      }
    }
  }
}
