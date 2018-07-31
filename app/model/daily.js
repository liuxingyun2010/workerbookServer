/**
 *  日报表字段
 *  uid   用户id
 *  departmentId  部门id
 *  departmentName  部门名称
 *  date  日期
 *  dailyList  数组（每条日报）
 *  dailyList.projectId 项目id
 *  dailyList.projectName 项目名称
 *  dailyList.missionId 任务id
 *  dailyList.missionName  任务名称
 *  dailyList.record 日报内容
 *  dailyList.progress 任务进度
 *  dailyList.eventId 日程id
 *  dailyList.eventName 日程名称 （开会，面试等）
 *  createTime 创建时间
 *  updateTIme 修改时间
 */

module.exports = app => {
  const mongoose = app.mongoose
  mongoose.Promise = global.Promise

  const DailySchema = new mongoose.Schema(Object.assign({}, {
    userId: {
      type: String,
      required: true
    },
    nickname: {
      type: String,
      required: true
    },
    departmentId: {
      type: String,
      required: true
    },
    departmentName: {
      type: String,
      required: true
    },
    date: {
      type: String,
      default: ''
    },
    dailyList: [{
      projectId: {
        type: String,
        default: ''
      },
      projectName: {
        type: String,
        default: ''
      },
      missionName: {
        type: String,
        default: ''
      },
      missionId: {
        type: String,
        default: ''
      },
      record: {
        type: String,
        required: true
      },
      progress: {
        type: Number,
        require: true,
        default: 0
      },
      eventId: {
        type: String,
        default: ''
      },
      eventName: {
        type: String,
        default: ''
      }
    }],
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


  DailySchema.index({createTime: 1})

  return mongoose.model('Daily', DailySchema)
}
