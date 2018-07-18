/**
 *  人员统计表字段
 *  uid  用户id
 *  name 用户姓名
 *  departmentId  部门id
 *  departmentName 部门名称
 *  date 日期
 *  missions 子文档
 *  missions.projectId 项目id
 *  missions.id 任务id
 *  missions.day  任务天数
 */

module.exports = app => {
  const mongoose = app.mongoose
  mongoose.Promise = global.Promise

  const MemberAnalysisSchema = new mongoose.Schema(Object.assign({}, {
    uid: {
      type: String,
      required: true
    },
    name: {
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
      type: Date,
      required: true
    },
    missions: [
      new mongoose.Schema({
        projectId: {
          type: String,
          required: true
        },
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

  return mongoose.model('MemberAnalysis', MemberAnalysisSchema)
}
