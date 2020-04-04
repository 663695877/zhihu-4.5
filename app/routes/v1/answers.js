const jwt = require('jsonwebtoken')
const Router = require('koa-router');
const router = new Router({prefix: '/v1/questions/:questionId/answers'});
const {
  find, findById, update, delete: del, create,
  checkAnswerExist, checkAnswerer,

} = require('../../controllers/answers')
const {security} = require('../../config')
const {checkOwner} = require('../../controllers/users')



const auth = async (ctx, next) => {
  const { authorization = '' } = ctx.request.header;
  const token = authorization.replace('Bearer ', '');
  try {
    const user = jwt.verify(token, security.secretKey)
    ctx.state.user = user
  } catch (err) {
    ctx.throw(401, err.message)
  }
  await next();
};

router.get('/', find);
router.get('/:id', checkAnswerExist, findById);
router.post('/', auth, create);
router.patch('/:id', auth, checkAnswerExist, checkAnswerer, update);
router.delete('/:id', auth, checkAnswerExist, checkAnswerer, del)

module.exports = router;