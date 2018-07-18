/**
 *  部门表字段
 *  name   部门名称
 *  deadline   部门人数
 *  description  项目描述
 *  missions 任务 内嵌文档
 *  departments 部门 内嵌文档
 *  departments.name 部门名称
 *  departments.id  部门id
 *  weight 任务优先级 1：普通 2：重要， 3：紧急
 *  status 1:进行中 2：暂停 3：归档
 *  isDelete 是否已经删除， boolean
 */

module.exports = app => {
  const mongoose = app.mongoose
  mongoose.Promise = global.Promise

  const ProjectSchema = new mongoose.Schema(Object.assign({}, {
    name: {
      type: String,
      required: true
    },
    deadline: {
      type: Date,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    departments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    }],
    missions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mission'
    }],
    status: {
      type: Number,
      default: 1
    },
    weight: {
      type: Number,
      default: 1
    },
    isDelete: {
      type: Boolean,
      default: false
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

  return mongoose.model('Project', ProjectSchema)
}
