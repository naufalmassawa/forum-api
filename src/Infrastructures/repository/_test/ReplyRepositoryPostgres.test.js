const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const pool = require('../../database/postgres/pool');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123' });
    await ThreadsTableTestHelper.addThread({
      id: 'thread-123',
      owner: 'user-123',
    });
    await CommentsTableTestHelper.addComment({
      id: 'comment-123',
      owner: 'user-123',
      threadId: 'thread-123',
    });
  });

  describe('addReply function', () => {
    it('should persist new reply and return added reply correctly', async () => {
      // Arrange
      const newReply = new NewReply({
        content: 'a reply',
        owner: 'user-123',
        commentId: 'comment-123',
      });
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(newReply);

      // Assert
      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies).toBeDefined();
      expect(addedReply).toStrictEqual(
        new AddedReply({
          id: 'reply-123',
          content: 'a reply',
          owner: 'user-123',
        }),
      );
    });
  });

  describe('getRepliesByCommentIds function', () => {
    it('should return replies correctly', async () => {
      // Arrange
      const reply1 = {
        id: 'reply-111',
        content: 'reply 1',
        date: new Date('2024-01-01T00:00:00.000Z'),
        owner: 'user-123',
        commentId: 'comment-123',
        isDelete: false,
      };

      const reply2 = {
        id: 'reply-222',
        content: 'reply 2',
        date: new Date('2024-01-02T00:00:00.000Z'),
        owner: 'user-123',
        commentId: 'comment-123',
        isDelete: true,
      };

      await RepliesTableTestHelper.addReply(reply1);
      await RepliesTableTestHelper.addReply(reply2);
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByCommentIds([
        'comment-123',
      ]);

      // Assert
      expect(replies).toHaveLength(2);
      expect(replies[0].id).toEqual(reply1.id);
      expect(replies[0].content).toEqual(reply1.content);
      expect(replies[0].date.toISOString()).toEqual(reply1.date.toISOString());
      expect(replies[0].username).toEqual('dicoding');
      expect(replies[0].comment_id).toEqual(reply1.commentId);
      expect(replies[0].is_delete).toEqual(reply1.isDelete);

      expect(replies[1].id).toEqual(reply2.id);
      expect(replies[1].content).toEqual(reply2.content);
      expect(replies[1].date.toISOString()).toEqual(reply2.date.toISOString());
      expect(replies[1].username).toEqual('dicoding');
      expect(replies[1].comment_id).toEqual(reply2.commentId);
      expect(replies[1].is_delete).toEqual(reply2.isDelete);
    });
  });

  describe('getRepliesByCommentId function', () => {
    it('should return replies with DetailReply format correctly', async () => {
      // Arrange
      const reply1 = {
        id: 'reply-111',
        content: 'reply 1',
        date: new Date('2024-01-01T00:00:00.000Z'),
        owner: 'user-123',
        commentId: 'comment-123',
        isDelete: false,
      };

      const reply2 = {
        id: 'reply-222',
        content: 'reply 2',
        date: new Date('2024-01-02T00:00:00.000Z'),
        owner: 'user-123',
        commentId: 'comment-123',
        isDelete: true,
      };

      await RepliesTableTestHelper.addReply(reply1);
      await RepliesTableTestHelper.addReply(reply2);
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies =
        await replyRepositoryPostgres.getRepliesByCommentId('comment-123');

      // Assert
      expect(replies).toHaveLength(2);
      expect(replies[0].id).toEqual(reply1.id);
      expect(replies[0].content).toEqual(reply1.content);
      expect(replies[0].date.toISOString()).toEqual(reply1.date.toISOString());
      expect(replies[0].username).toEqual('dicoding');
      expect(replies[1].id).toEqual(reply2.id);
      expect(replies[1].content).toEqual(reply2.content);
      expect(replies[1].date.toISOString()).toEqual(reply2.date.toISOString());
      expect(replies[1].username).toEqual('dicoding');
    });
  });

  describe('getRepliesByCommentIds function', () => {
    it('should return replies correctly', async () => {
      // Arrange
      const reply1 = {
        id: 'reply-111',
        content: 'reply 1',
        date: new Date('2024-01-01T00:00:00.000Z'),
        owner: 'user-123',
        commentId: 'comment-123',
        isDelete: false,
      };

      const reply2 = {
        id: 'reply-222',
        content: 'reply 2',
        date: new Date('2024-01-02T00:00:00.000Z'),
        owner: 'user-123',
        commentId: 'comment-123',
        isDelete: true,
      };

      await RepliesTableTestHelper.addReply(reply1);
      await RepliesTableTestHelper.addReply(reply2);
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByCommentIds([
        'comment-123',
      ]);

      // Assert
      expect(replies).toHaveLength(2);
      expect(replies[0].id).toEqual(reply1.id);
      expect(replies[0].content).toEqual(reply1.content);
      expect(replies[0].date.toISOString()).toEqual(reply1.date.toISOString());
      expect(replies[0].username).toEqual('dicoding');
      expect(replies[0].comment_id).toEqual(reply1.commentId);
      expect(replies[0].is_delete).toEqual(reply1.isDelete);

      expect(replies[1].id).toEqual(reply2.id);
      expect(replies[1].content).toEqual(reply2.content);
      expect(replies[1].date.toISOString()).toEqual(reply2.date.toISOString());
      expect(replies[1].username).toEqual('dicoding');
      expect(replies[1].comment_id).toEqual(reply2.commentId);
      expect(replies[1].is_delete).toEqual(reply2.isDelete);
    });
  });

  describe('verifyReplyExists function', () => {
    it('should throw NotFoundError when reply is not exist', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyExists('reply-xxx'),
      ).rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError when reply exists', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        owner: 'user-123',
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyExists('reply-123'),
      ).resolves.not.toThrow(NotFoundError);
    });
  });

  describe('verifyReplyOwner', () => {
    it('should throw NotFoundError when reply does not exist', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyOwner('reply-xxx', 'user-123'),
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError when reply owner is not valid', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        owner: 'user-123',
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-xxx'),
      ).rejects.toThrow(AuthorizationError);
    });

    it('should not throw AuthorizationError when reply owner is valid', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        owner: 'user-123',
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123'),
      ).resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('deleteReplyById function', () => {
    it('should soft delete reply from database', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        owner: 'user-123',
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await replyRepositoryPostgres.deleteReplyById('reply-123');

      // Assert
      const reply = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(reply.is_delete).toEqual(true);
    });
  });
});
