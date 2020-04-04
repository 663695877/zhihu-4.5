const Router = require('koa-router');
const router = new Router({prefix: '/v1'})
const { index, upload } = require('../../controllers/home')

router.get('/', index)
router.post('/uploads', upload)


module.exports = router;