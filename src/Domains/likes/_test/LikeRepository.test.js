const LikeRepository = require('../LikeRepository');

describe('LikeRepository', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const likeRepository = new LikeRepository();

    // Assert
    await expect(likeRepository.likeComment({})).rejects.toThrow(
      'LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
    await expect(
      likeRepository.unlikeComment('comment-123', 'user-123'),
    ).rejects.toThrow('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(
      likeRepository.verifyUserLikeComment('comment-123', 'user-123'),
    ).rejects.toThrow('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(
      likeRepository.getLikesCountByCommentId('comment-123'),
    ).rejects.toThrow('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
