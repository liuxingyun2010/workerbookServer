/**
 *  统计表字段
 *  missionId  任务id
 *  missionName 任务名称
 *  departmentId  部门id
 *  departmentName 部门名称
 *  date 日期
 *  userId 用户id
 *  nickname 用户名称
 *  projectId 项目id
 *  projectName 项目名称
 *  missionProgress 任务进度
 *  projectProgress 任务名称
 *  missionDeadline 任务截止时间
 *  projectDeadline 项目截止时间
 *  missionDelay 任务延期
 *  projectDelay 项目延期
 */

module.exports = app => {
  const mongoose = app.mongoose
  mongoose.Promise = global.Promise

  const AnalysisSchema = new mongoose.Schema(Object.assign({}, {
    missionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    missionName: {
      type: String,
      required: true
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    departmentName: {
      type: String,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    nickname: {
      type: String,
      required: true
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    projectName: {
      type: String,
      required: true
    },
    missionProgress: {
      type: Number,
      default: 0
    },
    projectProgress: {
      type: Number,
      default: 0
    },
    missionDeadline: {
      type: Date,
      required: true
    },
    projectDeadline: {
      type: Date,
      required: true
    },
    missionDelay: {
      type: Boolean,
      default: false
    },
    projectDelay: {
      type: Boolean,
      default: false
    },
    date: {
      type: String,
      required: true
    },
    createTime: {
      type: Date,
      default: Date.now
    },
    updateTime: {
      type: Date,
      default: Date.now
    }
  }), {
    versionKey: false,
    timestamps: {
      createdAt: 'createTime',
      updatedAt: 'updateTime'
    }
  })

  AnalysisSchema.index({date: 1})

  return mongoose.model('Analysis', AnalysisSchema)
}
