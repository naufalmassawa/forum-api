const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist new comment and return added comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });

      const newComment = new NewComment({
        content: 'A comment',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
        replyRepositoryPostgres,
      );

      // Action
      const addedComment =
        await commentRepositoryPostgres.addComment(newComment);

      // Assert
      const comments =
        await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: 'comment-123',
          content: 'A comment',
          owner: 'user-123',
        }),
      );
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should not throw AuthorizationError when comment owner is valid', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        {},
        replyRepositoryPostgres,
      );
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
      });

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123'),
      ).resolves.not.toThrow(AuthorizationError);
    });

    it('should throw AuthorizationError when comment owner is not valid', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        {},
        replyRepositoryPostgres,
      );
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
      });

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-456'),
      ).rejects.toThrow(AuthorizationError);
    });

    it('should throw NotFoundError when comment is not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner('comment-xxx', 'user-123'),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteCommentById function', () => {
    it('should throw NotFoundError when comment is not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        {},
        replyRepositoryPostgres,
      );

      // Action & Assert
      await expect(
        commentRepositoryPostgres.deleteCommentById('comment-xxx'),
      ).rejects.toThrow(NotFoundError);
    });

    it('should soft delete comment from database', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        {},
        replyRepositoryPostgres,
      );
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
      });

      // Action
      await commentRepositoryPostgres.deleteCommentById('comment-123');

      // Assert
      const comment =
        await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comment[0].is_delete).toEqual(true);
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return comments by thread id correctly', async () => {
      // Arrange
      const thread = { id: 'thread-123', owner: 'user-123' };
      const user = { id: 'user-123', username: 'user' };
      const comment1 = {
        id: 'comment-123',
        content: 'first comment',
        threadId: thread.id,
        owner: user.id,
        date: new Date('2024-01-01T00:00:00.000Z'),
      };
      const comment2 = {
        id: 'comment-456',
        content: 'second comment',
        threadId: thread.id,
        owner: user.id,
        isDelete: true,
        date: new Date('2024-01-02T00:00:00.000Z'),
      };

      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        {},
        new ReplyRepositoryPostgres(pool, {}),
      );
      await UsersTableTestHelper.addUser(user);
      await ThreadsTableTestHelper.addThread(thread);
      await CommentsTableTestHelper.addComment(comment1);
      await CommentsTableTestHelper.addComment(comment2);

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId(
        thread.id,
      );

      // Assert
      expect(comments).toHaveLength(2);
      expect(comments[0].id).toEqual(comment1.id);
      expect(comments[0].username).toEqual(user.username);
      expect(comments[0].content).toEqual(comment1.content);
      expect(comments[0].date.toISOString()).toEqual(
        comment1.date.toISOString(),
      );
      expect(comments[1].id).toEqual(comment2.id);
      expect(comments[1].username).toEqual(user.username);
      expect(comments[1].content).toEqual(comment2.content);
      expect(comments[1].date.toISOString()).toEqual(
        comment2.date.toISOString(),
      );
    });

    it('should return comments with replies by thread id correctly', async () => {
      // Arrange
      const thread = { id: 'thread-123', owner: 'user-123' };
      const user = { id: 'user-123', username: 'user' };
      const comment = {
        id: 'comment-123',
        content: 'a comment',
        threadId: thread.id,
        owner: user.id,
        date: new Date('2024-01-01T00:00:00.000Z'),
      };
      const reply1 = {
        id: 'reply-123',
        content: 'first reply',
        commentId: comment.id,
        owner: user.id,
        date: new Date('2024-01-01T01:00:00.000Z'),
      };
      const reply2 = {
        id: 'reply-456',
        content: 'second reply',
        commentId: comment.id,
        owner: user.id,
        isDelete: true,
        date: new Date('2024-01-01T02:00:00.000Z'),
      };

      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        {},
        new ReplyRepositoryPostgres(pool, {}),
      );
      await UsersTableTestHelper.addUser(user);
      await ThreadsTableTestHelper.addThread(thread);
      await CommentsTableTestHelper.addComment(comment);
      await RepliesTableTestHelper.addReply(reply1);
      await RepliesTableTestHelper.addReply(reply2);

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId(
        thread.id,
      );

      // Assert
      expect(comments).toHaveLength(1);
      expect(comments[0].id).toEqual(comment.id);
      expect(comments[0].replies).toBeUndefined();
    });
  });
});
