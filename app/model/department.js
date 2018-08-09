/**
 *  部门表字段
 *  name 部门名称
 *  count 部门人数
 *  isDelete 是否删除 true
 *  createTime 创建时间
 *  updateTIme 修改时间
 */

module.exports = app => {
  const mongoose = app.mongoose
  mongoose.Promise = global.Promise

  const DepartmentSchema = new mongoose.Schema(Object.assign({}, {
    name: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      default: 0
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

  return mongoose.model('Department', DepartmentSchema)
}
