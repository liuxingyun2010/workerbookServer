/**
 *  日程表字段
 *  name   日程名称
 *  status  日程状态   1.正常  2.归档
 *  isDelete 是否删除
 *  createTime 创建时间
 *  updateTIme 修改时间
 */

module.exports = app => {
  const mongoose = app.mongoose
  mongoose.Promise = global.Promise

  const EventsSchema = new mongoose.Schema(Object.assign({}, {
    name: {
      type: String,
      required: true
    },
    status: {
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
  }).index({createTime: -1})

  return mongoose.model('Event', EventsSchema)
}
