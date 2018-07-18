/**
 *  项目统计表字段
 *  projectId  项目id
 *  projectName 项目名称
 *  missionId  任务id
 *  missionName 任务名称
 *  deadline 项目截止日期
 *  progress 每天的进度
 *  date 日期
 *  users 参与用户，子文档
 *  users.id 用户id
 *  users.day 任务天数
 */

module.exports = app => {
  const mongoose = app.mongoose
  mongoose.Promise = global.Promise

  const ProjectAnalysisSchema = new mongoose.Schema(Object.assign({}, {
    projectId: {
      type: String,
      required: true
    },
    projectName: {
      type: String,
      required: true
    },
    missionId: {
      type: String,
      required: true
    },
    missionName: {
      type: String,
      required: true
    },
    deadline: {
      type: Date,
      required: true
    },
    progress: {
      type: Number,
      required: true,
      default: 0
    },
    date: {
      type: Date,
      required: true
    },
    missions: [
      new mongoose.Schema({
        id: {
          type: String,
          required: true
        },
        day: {
          type: Number,
          default: 0,
          required: true
        }
      }, {_id: false})
    ],
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

  return mongoose.model('ProjectAnalysis', ProjectAnalysisSchema)
}
