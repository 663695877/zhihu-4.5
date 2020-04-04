const bcrypt = require('bcryptjs')
const Redis = require('koa-redis')
const User = require('../models/users');
const jwt = require('jsonwebtoken');
const {security} = require('../config');
const Question = require('../models/questions');
const Answer = require('../models/answers');

// const Store = new Redis().client



class UsersCtl {
  async checkOwner(ctx, next) {
    if (ctx.params.id !== ctx.state.user._id) {
      ctx.throw(403, '没有权限')
    }
    await next();
  }

  async find(ctx) {
    const { per_page = 10 } = ctx.query
    const page = Math.max(ctx.query.page * 1, 1) - 1;
    const perPage = Math.max(per_page * 1, 1);
    //这里的模糊查询有问题
    ctx.body = await User
      .find({ username: new RegExp(ctx.query.q) })
      .limit(perPage).skip(page * perPage);
  };

  async findById(ctx) {
    const { fields = '' } = ctx.query;
    const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
    const populateStr = fields.split(';').filter(f => f).map(f => {
      if (f = 'employments') {
        return 'employments.company employments.job';
      }
      if (f = 'educations') {
        return 'educations.school educations.major';
      }
      return f;
    }).join(' ')
    const user = await User.findById(ctx.params.id).select(selectFields)
      .populate('following locations business employments.company employments.job educations.major');
    if(!user) { ctx.throw(404, '用户不存在'); }
    ctx.body = user;
  };

  async create(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
      password: {type: 'string', required: true}
    })
    const {name, password} = ctx.request.body;
    // ctx.body = name;
    // const repeatedUser = await User.findOne({name});
    // if(repeatedUser) {
    //   ctx.throw(409, '用户已经fdf占用')
    // }
    const user = await User.create({name, password});
    if (user) {
      ctx.body = {
        code: 0,
        msg: '注册成功'
      }
    }
  };

  async update(ctx) {
    ctx.verifyParams({
      username: {type: 'string', required: false},
      password: { type: 'string', required: false },
      avatar_url: { type: 'string', required: false },
      gender: { type: 'string', required: false },
      headline: { type: 'string', required: false },
      locations: { type: 'array', itemType: 'string', required: false },
      business: { type: 'string', required: false },
      employments: { type: 'array', itemType: 'object', required: false },
      educations: { type: 'array', itemType: 'object', required: false }
    });
    const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body)
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    ctx.body = user
  };

  async delete(ctx) {
    const user = await User.findByIdAndRemove(ctx.params.id, ctx.request.body);
    if(!user) {
      ctx.throw(404, '用户不存在');
    }
  };

  async register(ctx) {
    ctx.verifyParams({
      password: {type: 'string', require: true}
    })
    const {username, password} = ctx.request.body;
    
    const salt = bcrypt.genSaltSync(10)
    const psw = bcrypt.hashSync(password, salt)

    const user = await User.find({username})
    if(user.length) {
      ctx.body = {
        code: -1,
        msg: '已经被注册'
      }
      return
    }
    
    const userInfo = {
       username, 
       password: psw
    }
    const nuser = await User.create(userInfo)
    // throw new global.errs.Success()
    if(nuser) {
      ctx.body = {
        code: 0,
        msg: `${username}注册成功`
      }
    }
  };
  async login(ctx) {
    ctx.verifyParams({
      username: {type: 'string', require: false},
      password: { type: 'string', require: false }
    })
    const {username, password} = ctx.request.body;
    const user = await User.findOne({username})
    console.log(user);
    console.log(password)
    
    const verrifyPass = bcrypt.compareSync(password, user.password)
    const { _id, username: jwtName} = user
    const {secretKey, expiresIn} = security
    if (verrifyPass) {
      const token = jwt.sign({ _id, jwtName}, secretKey , {expiresIn})
      ctx.body = {
        msg: '密码正确',
        token
      }
    } else {
      ctx.body = {
        msg: '密码不正确'
      }
    }
  };

  async listFollowing(ctx) {
    const user = await User.findById(ctx.params.id).select('+following').populate('following');
    if(!user) {
      ctx.throw(404, '用户不存在');
    }
    ctx.body = user.following;
  };

  async checkUserExist(ctx, next) {
    const user = await User.findById(ctx.params.id);
    if (!user) {
      ctx.throw(4004, '用户不存在');
    }
    await next();
  }

  async follow(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+following');
    if (!me.following.map(id => id.toString()).includes(ctx.params.id)) {
      me.following.push(ctx.params.id);
      me.save();
    }
    ctx.status = 204;
  };
  async unfollow(ctx) {
    console.log(ctx.state);
    
    const me = await User.findById(ctx.state.user._id).select('+following');
    const index = me.following.map(id => id.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.following.splice(index, 1);
      me.save();
    }
    ctx.status = 204;
  };

  async listFans(ctx) {
    const users = await User.find({ following: ctx.params.id });
    ctx.body = users;
  };

  async listFollowingTopics(ctx) {
    const topic = await User.findById(ctx.params.id).select('+followingTopics').populate('followingTopics');
    if(!topic) {
      ctx.throw(404, '话题不存在');
    }
    ctx.body = topic.followingTopics;
  };

  async followTopics(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+followingTopics');
    if (!me.followingTopics.map(id => id.toString()).includes(ctx.params.id)) {
      me.followingTopics.push(ctx.params.id);
      me.save();
    }
    ctx.status = 204;
  };

  async unfollowTopics(ctx) {
    console.log(ctx.state);
    
    const me = await User.findById(ctx.state.user._id).select('+followingTopics');
    const index = me.followingTopics.map(id => id.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.followingTopics.splice(index, 1);
      me.save();
    }
    ctx.status = 204;
  };
  async listQuestions(ctx) {
    const questions = await Question.find({ questioner: ctx.params.id });
    ctx.body = questions;
  };
  async listLikingAnswers(ctx) {
    const user = await User.findById(ctx.params.id).select(' + likingAnswers').populate('likingAnswers');
    if(!user) {
      ctx.throw(404, '用户不存在');
    }
    ctx.body = user.likingAnswers;
  };

  async likeAnswer(ctx, next) {
    const me = await User.findById(ctx.state.user._id).select('+likingAnswers');
    if (!me.likingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
      me.likingAnswers.push(ctx.params.id);
      me.save();
      await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: 1 } });
    }
    ctx.status = 204;
    await next();
  };

  async unlikeAnswer(ctx, next) {
    console.log(ctx.state);
    
    const me = await User.findById(ctx.state.user._id).select('+likingAnswers');
    const index = me.likingAnswers.map(id => id.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.likingAnswers.splice(index, 1);
      me.save();
      await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: -1 } });
    }
    ctx.status = 204;
    await next();
  };


  async listDislikingAnswers(ctx) {
    const user = await User.findById(ctx.params.id).select(' + dislikingAnswers').populate('dislikingAnswers');
    if(!user) {
      ctx.throw(404, '用户不存在');
    }
    ctx.body = user.dislikingAnswers;
  };

  async dislikeAnswer(ctx, next) {
    const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers');
    if (!me.dislikingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
      me.dislikingAnswers.push(ctx.params.id);
      me.save();
    }
    ctx.status = 204;
    await next();
  };

  async undislikeAnswer(ctx, next) {
    console.log(ctx.state);
    
    const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers');
    const index = me.dislikingAnswers.map(id => id.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.dislikingAnswers.splice(index, 1);
      me.save();
    }
    ctx.status = 204;
    await next();
  };
  
  async listCollectingAnswers(ctx) {
    const user = await User.findById(ctx.params.id).select(' + collectingAnswers').populate('collectingAnswers');
    if(!user) {
      ctx.throw(404, '收藏不存在');
    }
    ctx.body = user.collectingAnswers;
  };

  async collectAnswer(ctx, next) {
    const me = await User.findById(ctx.state.user._id).select('+collectingAnswers');
    if (!me.collectingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
      me.collectingAnswers.push(ctx.params.id);
      me.save();
    }
    ctx.status = 204;
    await next();
  };

  async uncollectAnswer(ctx, next) {
    console.log(ctx.state);
    
    const me = await User.findById(ctx.state.user._id).select('+collectingAnswers');
    const index = me.collectingAnswers.map(id => id.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.collectingAnswers.splice(index, 1);
      me.save();
    }
    ctx.status = 204;
    await next();
  };

}

module.exports = new UsersCtl()