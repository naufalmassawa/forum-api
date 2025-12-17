const pool = require('../../database/postgres/pool');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');

describe('LikeRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'dicoding',
      password: 'secret_password',
      fullName: 'Dicoding Indonesia',
    });
    await ThreadsTableTestHelper.addThread({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      owner: 'user-123',
    });
    await CommentsTableTestHelper.addComment({
      id: 'comment-123',
      content: 'sebuah comment',
      owner: 'user-123',
      threadId: 'thread-123',
    });
  });

  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('likeComment', () => {
    it('should like a comment correctly', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        () => 'fake-id',
      );
      const newLike = {
        commentId: 'comment-123',
        owner: 'user-123',
      };

      // Action
      const result = await likeRepositoryPostgres.likeComment(newLike);

      // Assert
      expect(result).toBe(true);
      const likes =
        await CommentLikesTableTestHelper.getLikesByCommentId('comment-123');
      expect(likes).toHaveLength(1);
    });

    it('should return false when user already liked the comment', async () => {
      // Arrange
      await CommentLikesTableTestHelper.addLike({
        commentId: 'comment-123',
        userId: 'user-123',
      });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        () => 'fake-id-2',
      );
      const newLike = {
        commentId: 'comment-123',
        owner: 'user-123',
      };

      // Action
      const result = await likeRepositoryPostgres.likeComment(newLike);

      // Assert
      expect(result).toBe(false);
      const likes =
        await CommentLikesTableTestHelper.getLikesByCommentId('comment-123');
      expect(likes).toHaveLength(1);
    });
  });

  describe('getLikesCountByCommentId', () => {
    it('should get likes count correctly', async () => {
      // Arrange
      await CommentLikesTableTestHelper.addLike({
        commentId: 'comment-123',
        userId: 'user-123',
      });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        () => 'fake-id',
      );

      // Action
      const likesCount =
        await likeRepositoryPostgres.getLikesCountByCommentId('comment-123');

      // Assert
      expect(likesCount).toBe(1);
    });

    it('should return 0 when there are no likes', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        () => 'fake-id',
      );

      // Action
      const likesCount =
        await likeRepositoryPostgres.getLikesCountByCommentId('comment-123');

      // Assert
      expect(likesCount).toBe(0);
    });
  });

  describe('verifyUserLikeComment', () => {
    it('should return true when user already liked the comment', async () => {
      // Arrange
      await CommentLikesTableTestHelper.addLike({
        commentId: 'comment-123',
        userId: 'user-123',
      });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        () => 'fake-id',
      );

      // Action
      const isUserLiked = await likeRepositoryPostgres.verifyUserLikeComment(
        'comment-123',
        'user-123',
      );

      // Assert
      expect(isUserLiked).toBe(true);
    });

    it('should return false when user has not liked the comment', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        () => 'fake-id',
      );

      // Action
      const isUserLiked = await likeRepositoryPostgres.verifyUserLikeComment(
        'comment-123',
        'user-123',
      );

      // Assert
      expect(isUserLiked).toBe(false);
    });
  });

  describe('unlikeComment', () => {
    it('should unlike a comment correctly', async () => {
      // Arrange
      await CommentLikesTableTestHelper.addLike({
        commentId: 'comment-123',
        userId: 'user-123',
      });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        () => 'fake-id',
      );

      // Action
      const result = await likeRepositoryPostgres.unlikeComment(
        'comment-123',
        'user-123',
      );

      // Assert
      expect(result).toBe(true);
      const likes =
        await CommentLikesTableTestHelper.getLikesByCommentId('comment-123');
      expect(likes).toHaveLength(0);
    });

    it('should return false when trying to unlike a comment that user did not like', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        () => 'fake-id',
      );

      // Action
      const result = await likeRepositoryPostgres.unlikeComment(
        'comment-123',
        'user-123',
      );

      // Assert
      expect(result).toBe(false);
    });
  });
});
