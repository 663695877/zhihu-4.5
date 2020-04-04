const jwt = require('jsonwebtoken')
const Router = require('koa-router');
const router = new Router({prefix: '/v1/questions/:questionId/answers/:answerId/comments'});
const {
  find, findById, update, delete: del, create,
  checkCommentExist, checkCommentator,

} = require('../../controllers/comments')
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
router.get('/:id', checkCommentExist, findById);
router.post('/', auth, create);
router.patch('/:id', auth, checkCommentExist, checkCommentator, update);
router.delete('/:id', auth, checkCommentExist, checkCommentator, del)

module.exports = router;