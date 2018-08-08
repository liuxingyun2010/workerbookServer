const ErrorMsg = id => {
  const msg = {
    '100001': '用户名不能为空',
    '100002': '密码不能为空',
    '100003': '用户名或者密码不正确',
    '100004': '用户ID不合法',
    '100005': '用户昵称不能为空',
    '100006': '用户所属部门不能为空',
    '100007': '用户角色不能为空',
    '100008': '用户抬头不能为空',
    '100009': '用户已存在',
    '100010': '用户密码错误',
    '100011': '用户不存在',
    '100012': '用户状态不能为空',
    '100013': '新密码不能为空',
    '200001': '部门名称不能为空',
    '200002': '部门已经存在',
    '200003': '部门ID不合法',
    '200004': '部门不存在',
    '200005': '部门包含用户，无法删除',
    '300001': '项目名称不能为空',
    '300002': '项目截止日期不能为空',
    '300003': '项目不存在',
    '300004': '项目ID不合法',
    '300005': '项目ID不能为空',
    '300006': '项目不存在或者已经归档',
    '400001': '任务名称不能为空',
    '400002': '任务截止时间不能为空',
    '400003': '任务ID不合法',
    '400004': '任务的截止时间不能大于项目的截止时间',
    '400005': '任务不存在',
    '500001': '日报内容不能为空',
    '500002': '任务进度不能为空',
    '500003': '任务和日程不能同时存在',
    '500004': '任务和日程ID不能同时为空',
    '500005': '进度必须是0-100之间的整数',
    '500006': '此任务不属于当前用户，无法操作',
    '500007': '日报不存在',
    '500008': '日报ID不合法',
    '600001': '日程ID不合法',
    '600002': '日程已存在',
    '600003': '日程名称不能为空',
    '600004': '日程不存在',
    '700001': '您没有权限操作',
    '000000': 'success',
    '999999': '系统错误',
  }

  return {
    resCode: id,
    resMsg: msg[id]
  }
}

const Status = {
  UserAccountNotFound: ErrorMsg('100001'), // 用户名不能为空
  UserPasswordNotFound: ErrorMsg('100002'), // 密码不能为空
  UserAccountOrPasswordError: ErrorMsg('100003'), // 用户名或者密码不正确
  UserIdIllegal: ErrorMsg('100004'), // 用户ID不合法
  UserNicknameNotFound: ErrorMsg('100005'), // 用户昵称不能为空
  UserDepartmentNotFound: ErrorMsg('100006'), // 用户所属部门不能为空
  UserRoleNotFound: ErrorMsg('100007'), // 用户角色不能为空
  UserTitleNotFound: ErrorMsg('100008'), // 用户抬头不能为空
  UserHasExist: ErrorMsg('100009'), // 用户已存在
  UserPasswordError: ErrorMsg('100010'), // 用户密码错误
  UserDontExist: ErrorMsg('100011'), // 用户不存在
  UserStatusNotFound: ErrorMsg('100012'), // 用户状态不能为空
  UserNewPasswordNotFound: ErrorMsg('100013'), // 新密码不能为空
  DepartmentNameNotFound: ErrorMsg('200001'), // 部门名称不能为空
  DepartmentHasExist: ErrorMsg('200002'), // 部门已经存在
  DepartmentIdIllegal: ErrorMsg('200003'), // 部门ID不合法
  DepartmentDontExist: ErrorMsg('200004'), // 部门不存在
  DepartmentRemoveForbidden: ErrorMsg('200005'), // 部门包含用户，无法删除
  ProjectNameNofound: ErrorMsg('300001'), // 项目名称不能为空
  ProjectDeadlineNofound: ErrorMsg('300002'), // 项目截止日期不能为空
  ProjectDontExist: ErrorMsg('300003'), // 项目不存在
  ProjectIdIllegal: ErrorMsg('300004'), // 项目ID不合法
  ProjectIdNotFound: ErrorMsg('300005'), // 项目ID不能为空
  ProjectIdNotFoundOrArchive: ErrorMsg('300006'), // 项目不存在或者已经归档
  MissionNameNotFound: ErrorMsg('400001'), // 任务名称不能为空
  MissionDeadlineNotFound: ErrorMsg('400002'), // 任务截止时间不能为空
  MissionIdIllegal: ErrorMsg('400003'), // 任务ID不合法
  MissionDeadlineOverProjectDeadline: ErrorMsg('400004'), // 任务的截止时间不能大于项目的截止时间
  MissionNotFound: ErrorMsg('400005'), // 任务不存在
  DailyRecordNotFound: ErrorMsg('500001'), // 日报内容不能为空
  DailyProgressNotFound: ErrorMsg('500002'), // 任务进度不能为空
  DailyHasEventAndMission: ErrorMsg('500003'), // 任务和日程不能同时存在
  DailyNoEventAndMission: ErrorMsg('500004'), // 任务和日程ID不能同时为空
  DailyProgressIllegal: ErrorMsg('500005'), // 进度必须是0-100之间的整数
  DailyStatusUnauthorized: ErrorMsg('500006'), // 此任务不属于当前用户，无法操作
  DailyNotFound: ErrorMsg('500007'), // 日报不存在
  DailyIdIllegal: ErrorMsg('500008'), // 日报ID不合法
  EventIdIllegal: ErrorMsg('600001'), // 日程ID不合法
  EventNameExist: ErrorMsg('600002'), // 日程已存在
  EventNameNotFound: ErrorMsg('600003'), // 日程名称不能为空
  EventNotFound: ErrorMsg('600004'), // 日程不存在
  Forbidden: ErrorMsg('700001'), // 您没有权限操作
  Success: ErrorMsg('000000'), // 成功
  Error: ErrorMsg('999999') // 系统错误
}


module.exports = Status
