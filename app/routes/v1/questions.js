const jwt = require('jsonwebtoken')
const Router = require('koa-router');
const router = new Router({prefix: '/v1/questions'});
const {
  find, findById, update, delete: del, create,
  checkQuestionExist, checkQuestioner
} = require('../../controllers/questions')
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
router.get('/:id', checkQuestionExist, findById);
router.post('/', auth, create);
router.patch('/:id', auth, checkQuestionExist, checkQuestioner,update);
router.delete('/:id', auth, checkQuestionExist, checkQuestioner, del)

module.exports = router;
