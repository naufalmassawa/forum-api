const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted reply', async () => {
      // Arrange
      const requestPayload = {
        content: 'a reply',
      };

      const server = await createServer(container);

      const { accessToken, userId } = await UsersTableTestHelper.getAccessToken(
        { server },
      );

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply.content).toEqual(
        requestPayload.content,
      );
    });

    it('should response 401 when request does not have authentications', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: {
          content: 'a reply',
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when comment is not found', async () => {
      // Arrange
      const requestPayload = {
        content: 'a reply',
      };

      const server = await createServer(container);
      const { accessToken, userId } = await UsersTableTestHelper.getAccessToken(
        { server },
      );

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-xxx/replies',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });

    it('should response 400 when payload did not contain needed property', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken, userId } = await UsersTableTestHelper.getAccessToken(
        { server },
      );

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: userId,
        threadId: 'thread-123',
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: {},
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat reply baru karena properti yang dibutuhkan tidak ada',
      );
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 when reply deleted successfully', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken, userId } = await UsersTableTestHelper.getAccessToken(
        {
          server,
        },
      );

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: userId,
        threadId: 'thread-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      const reply = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(reply.is_delete).toBe(true);
    });

    it('should response 401 when request does not have authentications', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 403 when user is not the owner of the reply', async () => {
      // Arrange
      const server = await createServer(container);

      // Add owner of the reply
      await UsersTableTestHelper.addUser({
        id: 'user-owner',
        username: 'owner',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-owner',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-owner',
        threadId: 'thread-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        owner: 'user-owner',
      });

      // Get access token for another user
      const { accessToken: intruderAccessToken } =
        await UsersTableTestHelper.getAccessToken({
          server,
        });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        headers: {
          Authorization: `Bearer ${intruderAccessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'anda tidak berhak mengakses resource ini',
      );
    });

    it('should response 404 when thread or comment or reply is not found', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken, userId } = await UsersTableTestHelper.getAccessToken(
        {
          server,
        },
      );

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: userId,
      });

      // Action (comment not added)
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-xxx/replies/reply-xxx',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });
  });
});
