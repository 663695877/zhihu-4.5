const path = require('path')

class HomeCtl {
  index(ctx) {
    ctx.body = '<h2>这scs是主页</h2>';
  }
  upload(ctx) {
    const file = ctx.request.files.file;
    const basename = path.basename(file.path);
    ctx.body = { url: `${ctx.origin}/uploads/${basename}` };
  }
}

module.exports = new HomeCtl();