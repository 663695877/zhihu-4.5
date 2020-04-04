const jwt = require('jsonwebtoken')
const Router = require('koa-router');
const router = new Router({prefix: '/v1/topics'});
const {
  find, findById, update, delete: del, create,
  listTopicFollowers,checkTopicExist, listQuestions
} = require('../../controllers/topics')
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
router.get('/:id', checkTopicExist, findById);
router.post('/', auth, create);
router.patch('/:id', auth, checkTopicExist, update);
router.get('/:id/followers', checkTopicExist, listTopicFollowers);
router.delete("/:id", checkTopicExist, del);
router.get('/:id/questions', checkTopicExist, listQuestions);

module.exports = router;

