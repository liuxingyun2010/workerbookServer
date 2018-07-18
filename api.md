## 接口文档

#### 登录 
  * /user/login 
  * post
  * 参数
    * username 
    * password

#### 获取个人信息
  * /user/profile 
  * get

#### 获取其他人信息
  * /user/:id
  * get

#### 编辑用户
  * /user/:id
  * put
  * 参数
    * username
    * password
    * nickname
    * departmentId
    * mobile
    * title
    * email
    * role
    
#### 添加用户
  * /user/add
  * post
  * 参数
    * username
    * password
    * nickname
    * departmentId
    * mobile
    * email
    * role

#### 停用或者启用用户
  * /user/:id
  * patch
  * 参数：
    * status  1:正常 2；停用

#### 获取所有用户
  * /user/
  * get
  * 参数：
    * limit 
    * skip
    * departmentId


#### 添加部门
  * /department/add
  * post 
  * 参数
    * name

#### 更新部门
  * /department/:id
  * patch
  * 参数
    * name

#### 获取部门列表
  * /department/
  * get
  * 参数
    * 无

#### 获取部门列表
  * /department/:id
  * delete
  * 参数
    * 无

