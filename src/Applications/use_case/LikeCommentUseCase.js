const NewLike = require('../../Domains/likes/entities/NewLike');

class LikeCommentUseCase {
  constructor({ threadRepository, commentRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, userId } = useCasePayload;
    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExists(commentId);

    const isUserLiked = await this._likeRepository.verifyUserLikeComment(
      commentId,
      userId,
    );

    if (isUserLiked) {
      // User already liked, so unlike it
      await this._likeRepository.unlikeComment(commentId, userId);
    } else {
      // User hasn't liked, so like it
      const newLike = new NewLike({
        commentId,
        owner: userId,
      });
      await this._likeRepository.likeComment(newLike);
    }
  }
}

module.exports = LikeCommentUseCase;
