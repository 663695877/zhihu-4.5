const Koa = require('koa')
const app = new Koa()
const koaBody = require('koa-body')
// const bodyparser = require('koa-bodyparser')
const error = require('koa-json-error')
const koaStatic = require('koa-static')
const mongoose = require('mongoose')
const connectionStr = require('./config')
const path = require('path')
// const routing = require('./routes')
// const UsersRouter = require('./routes/v1/users')
const requireDirectory = require('require-directory')
const Router = require('koa-router')
const paramater = require('koa-parameter')

mongoose.connect(connectionStr.dbs, {
  useNewUrlParser: true
}, () => console.log('MongoDB连接成功了！')
)

// mongoose.connection.on('error', console.log(error)
// )

// app.use(router.routes()).use(router.allowedMethods());
// app.use(UsersRouter.routes()).use(UsersRouter.allowedMethods())

app.use(koaStatic(path.join(__dirname, '/public')));

app.use(koaBody({
  multipart: true,
  formidable: {
    uploadDir: path.join(__dirname, '/public/uploads/' ),
    keepExtensions: true
  }
}))
// app.use(bodyparser())

app.use(paramater(app))

app.use(error());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || err.statusCode || 500;
    ctx.body = {
      message: err.message
    }
  }
})

const modules = requireDirectory(module, './routes', {
  visit: LoadModule
})

function LoadModule(obj) {
  if(obj instanceof Router) {
    app.use(obj.routes())
  }
}


app.listen(3000);