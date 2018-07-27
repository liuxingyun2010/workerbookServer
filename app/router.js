'use strict';

module.exports = app => {
  require('./router/user')(app)
  require('./router/department')(app)
  require('./router/project')(app)
  require('./router/mission')(app)
  require('./router/daily')(app)
  require('./router/event')(app)
}
