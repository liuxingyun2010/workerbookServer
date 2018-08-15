/**
 *  统计表字段
 *  missionId  任务id
 *  date 日期
 *  progress 任务进度
 */

module.exports = app => {
  const mongoose = app.mongoose
  mongoose.Promise = global.Promise

  const AnalysisSchema = new mongoose.Schema(Object.assign({}, {
    missionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    // userId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   required: true
    // },
    progress: {
      type: Number,
      default: 0
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
