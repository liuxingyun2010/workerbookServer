// const Subscription = require('egg').Subscription

const moment = require('moment')

module.exports = app => {
  return {
    schedule: {
      cron: app.config.schedule, // 每天凌晨
      // interval: '10s',
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
          obj.userId = item.user._id
          obj.nickname = item.user.nickname
          obj.projectId = item.project._id
          obj.projectName = item.project.name
          obj.missionProgress = item.progress
          obj.missionDeadline = item.deadline
          obj.projectProgress = item.project.progress
          obj.projectDeadline = item.project.deadline
          obj.missionDelay = new Date() > item.deadline? true: false
          obj.projectDelay = new Date() > item.project.deadline? true: false

          batchMission.push(obj)
        })
        await ctx.model.Analysis.create(batchMission)
      }
      catch(e){
        // 如果捕获到错误，则重新执行定时任务
        await app.runSchedule('analysis');
      }
    }
  }
}
