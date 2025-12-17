const NewLike = require('../../../Domains/likes/entities/NewLike');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const LikeCommentUseCase = require('../LikeCommentUseCase');

describe('LikeCommentUseCase', () => {
  it('should like comment when user has not liked it yet', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.verifyUserLikeComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve(false));
    mockLikeRepository.likeComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));

    const likeCommentUseCase = new LikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await likeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(
      useCasePayload.commentId,
    );
    expect(mockLikeRepository.verifyUserLikeComment).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.userId,
    );
    expect(mockLikeRepository.likeComment).toBeCalledWith(
      new NewLike({
        commentId: useCasePayload.commentId,
        owner: useCasePayload.userId,
      }),
    );
  });

  it('should unlike comment when user has already liked it', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.verifyUserLikeComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));
    mockLikeRepository.unlikeComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));

    const likeCommentUseCase = new LikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await likeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(
      useCasePayload.commentId,
    );
    expect(mockLikeRepository.verifyUserLikeComment).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.userId,
    );
    expect(mockLikeRepository.unlikeComment).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.userId,
    );
  });
});
