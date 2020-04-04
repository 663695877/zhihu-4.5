const Comment = require('../models/comments');
const User = require('../models/users')


class CommentsCtl {
  async find(ctx) {
    const { per_page = 10 } = ctx.query
    const page = Math.max(ctx.query.page * 1, 1) - 1;
    const perPage = Math.max(per_page * 1, 1);
    const q = new RegExp(ctx.query.q);
    const { questionId, answerId } = ctx.params;
    const { rootCommentId } = ctx.query;
    ctx.body = await Comment
      .find({ content: q, questionId, answerId, rootCommentId })
      .limit(perPage).skip(page * perPage)
      .populate('commentator replyTo')
  };

  async checkCommentExist(ctx, next) {
    console.log(ctx.params.id);
    
    const comment = await Comment.findById(ctx.params.id).select('+ commentator');

    //下面有点问题
    if (!comment) {
      ctx.throw(404, '评论不存在');
    }
    //只有在删改查答案时才检查逻辑，  赞、踩时不检查
    if (ctx.params.questionId && comment.questionId.toString() !== ctx.params.questionId) {
      ctx.throw(404, '该问题下没有此评论');
    }
    if (ctx.params.answerId && comment.answerId.toString() !== ctx.params.answerId) {
      ctx.throw(404, '该答案下没有此评论');
    }
    ctx.state.comment = comment;
    await next();
  }

  async findById(ctx) {
    const { fields = '' } = ctx.query
    const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
    const comment = await Comment.findById(ctx.params.id).select(selectFields).populate('commentator');
    ctx.body = comment;
  }

  async create(ctx) {
    ctx.verifyParams({
      content: { type: 'string', required: true },
      rootCommentId: { type: 'string', required: false },
      replyTo: { type: 'string', required: false }
    });
    const commentator = ctx.state.user._id;
    const { questionId, answerId } = ctx.params
    const comment = await new Comment({...ctx.request.body, commentator, 
        questionId, answerId}).save();
    ctx.body = comment;
  }

  async checkCommentator(ctx, next) {
    const { comment } = ctx.state;
    if (comment.commentator.toString() !== ctx.state.user._id) {
      ctx.throw(403, '没有权限')
    }
    await next()
  }

  async update(ctx) {
    ctx.verifyParams({
      content: { type: 'string', required: false },
    });
    const { content } = ctx.request.body;
    await ctx.state.comment.update({ content });
    ctx.body = ctx.state.comment;
  };
  async delete(ctx) {
    await Comment.findByIdAndRemove( ctx.params.id );
    ctx.state = 204;
  }
}

module.exports = new CommentsCtl()