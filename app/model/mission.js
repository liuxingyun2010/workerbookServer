/**
 *  任务表字段
 *  name   任务名称
 *  status  状态   1.正常  2.暂停， 3 归档
 *  progress 任务进度
 *  description 任务描述
 *  deadline 截止时间
 *  user 参与人员id
 *  isDelete 是否已经删除
 *  createTime 创建时间
 *  updateTIme 修改时间
 */

module.exports = app => {
  const mongoose = app.mongoose
  mongoose.Promise = global.Promise

  const MissionSchema = new mongoose.Schema(Object.assign({}, {
    name: {
      type: String,
      required: true
    },
    status: {
      type: Number,
      default: 1
    },
    progress: {
      type: Number,
      default: 0,
      required: 0
    },
    deadline: {
      type: Date,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
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

  return mongoose.model('Mission', MissionSchema)
}
