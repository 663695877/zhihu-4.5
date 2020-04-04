const jwt = require('jsonwebtoken')
const koaJwt = require('koa-jwt')
const Router = require('koa-router');
const router = new Router({prefix: '/v1/users'});
const {
  find, findById, update, delete: del, 
  register, login, listFollowing, follow,
  unfollow, listFans, checkUserExist,
  followTopics, unfollowTopics, listFollowingTopics,
  listQuestions,
  listLikingAnswers, likeAnswer, unlikeAnswer,
  listDislikingAnswers, dislikeAnswer, undislikeAnswer,
  listCollectingAnswers, collectAnswer, uncollectAnswer
} = require('../../controllers/users')
const {
  checkAnswerExist, checkAnswerer,
} = require('../../controllers/answers')
const User = require('../../models/users');
const {PositiveIntergerValidator} = require('../../validators/validator')
const {security} = require('../../config')
const {checkOwner} = require('../../controllers/users')
const { checkTopicExist } = require('../../controllers/topics')


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
router.get('/:id', findById);
router.patch('/:id', auth, checkOwner, update);
router.delete('/:id', auth, checkOwner, del);

router.post('/register', register
  // const v = await new PositiveIntergerValidator().validate(ctx)
  // const name = v.get('body.name')
  // const nuser = await User.create({name})
  // if(nuser) {
  //   ctx.body = {
  //     code: 0,
  //     msg: name
  //   }
  // }
);

router.post('/login', login);

router.get('/:id/following', listFollowing);

router.put('/following/:id', auth, checkUserExist, follow);

router.delete('/following/:id',auth, checkUserExist,unfollow);

router.get('/:id/followers', listFans);

router.get('/:id/followingTopics', auth, listFollowingTopics);

router.put('/followingTopics/:id', auth, checkTopicExist, followTopics);

router.delete('/followingTopics/:id',auth, checkTopicExist,unfollowTopics);

router.get('/:id/questions', listQuestions);

router.get('/:id/likingAnswers',auth, listLikingAnswers);

router.put('/likingAnswers/:id', auth, checkAnswerExist, likeAnswer, undislikeAnswer);

router.delete('/likingAnswers/:id',auth, checkAnswerExist, unlikeAnswer);

router.get('/:id/dislikingAnswers',auth, listDislikingAnswers);

router.put('/dislikingAnswers/:id', auth, checkAnswerExist, dislikeAnswer, unlikeAnswer);

router.delete('/dislikingAnswers/:id',auth, checkAnswerExist, undislikeAnswer);

router.get('/:id/collectingAnswers',auth, listCollectingAnswers);

router.put('/collectAnswers/:id', auth, checkAnswerExist, collectAnswer);

router.delete('/collectAnswers/:id',auth, checkAnswerExist, uncollectAnswer);

module.exports = router;