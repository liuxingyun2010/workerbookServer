/*
 * @ 统一错误码
 * @ 统一以http状态码结合业务状态码返回
 * @ 比如成功 200，创建成功201，执行成功但是不需要返回内容204，如果是客户端请求参数导致的错误，我们会返回 4xx 状态码，如果是服务端自身的处理逻辑错误，我们会返回 5xx 状态码
 * @ 业务状态码，以6位数字表示
 */


// 和用户相关
const USER = {
  AccountPwEmpty: {
    resCode: '100001',
    resMsg: '用户名和密码不能为空'
  },
  AccountEmpty: {
    resCode: '100002',
    resMsg: '用户名不能为空'
  },
  PwEmpty: {
    resCode: '100003',
    resMsg: '密码不能为空'
  },
  AccountPwError: {
    resCode: '100004',
    resMsg: '用户名或者密码不正确'
  },
  AccountInfoEmpty: {
    resCode: '100005',
    resMsg: '用户信息不能为空'
  },
  NicknameEmpty: {
    resCode: '100006',
    resMsg: '昵称不能为空'
  },
  DepartmentEmpty: {
    resCode: '100007',
    resMsg: '部门不能为空'
  },
  RoleEmpty: {
    resCode: '10008',
    resMsg: '角色不能为空'
  },
  TitleEmpty: {
    resCode: '10009',
    resMsg: '职称不能为空'
  },
  UserExist: {
    resCode: '100010',
    resMsg: '用户名已存在'
  },
  AccountError: {
    resCode: '100011',
    resMsg: '账号错误'
  },
  PwError: {
    resCode: '100012',
    resMsg: '密码错误'
  },
  AccountIdEmpty: {
    resCode: '100013',
    resMsg: '用户id不能为空'
  },
  UserNotFound: {
    resCode: '100014',
    resMsg: '用户不存在'
  },
  UserStatusEmpty: {
    resCode: '100015',
    resMsg: '设置的状态不能为空'
  },
  UserIdIlligal: {
    resCode: '100016',
    resMsg: '用户id不合法'
  },
  NewPwEmpty: {
    resCode: '100017',
    resMsg: '新密码不能为空'
  }
}


// 部门
const Department = {
  DepartmentNameEmpty: {
    resCode: '200001',
    resMsg: '部门名称不能为空'
  },
  DepartmentExist: {
    resCode: '200002',
    resMsg: '部门已经存在'
  },
  DepartmentIdError: {
    resCode: '200003',
    resMsg: '部门ID不合法'
  },
  DepartmentDontExist: {
    resCode: '200004',
    resMsg: '部门不存在'
  },
  DepartmentDontRemove: {
    resCode: '200005',
    resMsg: '部门包含用户，无法删除'
  }
}


// 项目
const Project = {
  ProjectNameEmpty: {
    resCode: '300001',
    resMsg: '项目名称不能为空'
  },
  ProjectDeadlineEmpty: {
    resCode: '300002',
    resMsg: '项目截止时间不能为空'
  },
  ProjectDepartmentEmpty: {
    resCode: '300003',
    resMsg: '项目关联部门不能为空'
  },
  ProjectDontExist: {
    resCode: '300004',
    resMsg: '项目不存在'
  },
  ProjectIdError: {
    resCode: '300005',
    resMsg: '项目id不合法'
  },
}

// 任务
const Mission = {
  MissionNameEmpty: {
    resCode: '400001',
    resMsg: '任务名称不能为空'
  },
  MissionDeadlineEmpty: {
    resCode: '400002',
    resMsg: '任务截止时间不能为空'
  },
  MissionProjectIdEmpty: {
    resCode: '400003',
    resMsg: '项目id不能为空'
  },
  MissionIdError: {
    resCode: '400004',
    resMsg: '任务id不合法'
  },
  MissionProjectIdError: {
    resCode: '400005',
    resMsg: '项目id不合法'
  },
  MissionProjectDontExist: {
    resCode: '400006',
    resMsg: '项目不存在'
  },
  MissionDeadlineError: {
    resCode: '400007',
    resMsg: '任务的截止时间不能大于项目的截止时间'
  },
  MissionNotFount: {
    resCode: '400008',
    resMsg: '任务不存在'
  },
  MissionDayNoFound: {
    resCode: '400009',
    resMsg: '预计开发天数不能为空'
  }
}

// 任务
const Daily = {
  DailyRecordEmpty: {
    resCode: '500001',
    resMsg: '日报内容不能为空'
  },
  DailyProgressEmpty: {
    resCode: '500002',
    resMsg: '任务进度不能为空'
  },
  DailyEventAndMissionTogather: {
    resCode: '500003',
    resMsg: '任务和日程不能同时存在'
  },
  DailyEventAndMissionAllEmpty: {
    resCode: '500005',
    resMsg: '任务和日程不能同时为空'
  },
  DailyProgressIlligeal: {
    resCode: '500004',
    resMsg: '进度必须是0-100之间的整数'
  },
  DailyStatusUnauthorized: {
    resCode: '500006',
    resMsg: '此任务不属于当前用户，无法操作'
  },
  DailyRecordIdError: {
    resCode: '500007',
    resMsg: '日报id错误'
  },
  DailyNotFount: {
    resCode: '500008',
    resMsg: '日报不存在'
  }
}

// 日程
const Event = {
  EventIdError: {
    resCode: '600001',
    resMsg: '日程id不正确'
  },
  EventNameExist: {
    resCode: '600002',
    resMsg: '日程已存在'
  },
  EventNameEmpty: {
    resCode: '600003',
    resMsg: '日程名称不能为空'
  },
  EventNotFount: {
    resCode: '600004',
    resMsg: '日程未找到'
  },
}

// 权限
const Auth = {
  Forbidden: {
    resCode: '400001',
    resMsg: '您没有权限操作'
  },
}

const ResponseCode = {
  Success: {
    resCode: '000000',
    resMsg: 'success'
  },
  Error: {
    resCode: '999999',
    resMsg: '系统错误'
  },
  ...USER,
  ...Department,
  ...Auth,
  ...Project,
  ...Mission,
  ...Event,
  ...Daily,
  ...Event
}

module.exports = ResponseCode
