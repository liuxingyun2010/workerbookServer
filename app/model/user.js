/**
 *  定义用户表字段
 *  nickname  昵称
 *  email 邮箱
 *  mobile 手机号
 *  username 用户名
 *  departmentId 部门id
 *  status 状态 1：正常， 2：停用
 *  password 密码
 *  role 角色  99：管理员， 1：普通用户, 2: leader
 *  title 职位
 *  isDelete 是否删除，默认false
 *  createTime 创建时间
 *  updateTIme 修改时间
 */

module.exports = app => {
  const mongoose = app.mongoose
  mongoose.Promise = global.Promise

  const UserSchema = new mongoose.Schema(Object.assign({}, {
    mobile: {
      type: String,
      default: ''
    },
    nickname: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    email: {
      type: String,
      default: ''
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    status: {
      type: Number,
      default: 1
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: Number,
      default: 2
    },
    title: {
      type: String,
      default: ''
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

  return mongoose.model('User', UserSchema)
}
