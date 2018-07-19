/**
 *  任务表字段
 *  name   任务名称
 *  status  状态   1.正常  2.暂停，
 *  progress 任务进度
 *  description 任务描述
 *  deadline 截止时间
 *  users 参与任务的人员，子文档
 *  users.id 参与人员id
 *  users.day 预计天数
 *  users.isDelete 是否从任务中删除
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
    description: {
      type: String,
      default: ''
    },
    deadline: {
      type: Date,
      required: true
    },
    users: [new mongoose.Schema({
      info: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      day: {
        type: Number,
        required: true
      }
    }, {_id: 0})],
    // users: [{
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'User'
    // }],
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
