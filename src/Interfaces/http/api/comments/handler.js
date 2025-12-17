const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');
const LikeCommentUseCase = require('../../../../Applications/use_case/LikeCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.putLikeCommentHandler = this.putLikeCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const addCommentUseCase = this._container.getInstance(
      AddCommentUseCase.name,
    );
    const { id: owner } = request.auth.credentials;
    const { threadId } = request.params;

    const useCasePayload = {
      ...request.payload,
      threadId,
      owner,
    };
    const addedComment = await addCommentUseCase.execute(useCasePayload);

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentHandler(request) {
    const deleteCommentUseCase = this._container.getInstance(
      DeleteCommentUseCase.name,
    );
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    const useCasePayload = {
      commentId,
      threadId,
      owner,
    };

    await deleteCommentUseCase.execute(useCasePayload);
    return { status: 'success' };
  }

  async putLikeCommentHandler(request, h) {
    const likeCommentUseCase = this._container.getInstance(
      LikeCommentUseCase.name,
    );
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    const useCasePayload = {
      threadId,
      commentId,
      userId,
    };

    await likeCommentUseCase.execute(useCasePayload);
    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = CommentsHandler;
