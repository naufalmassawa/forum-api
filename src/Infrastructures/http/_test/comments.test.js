const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'A comment',
      };
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

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.content).toEqual(
        requestPayload.content,
      );
    });

    it('should response 401 when request does not have authentication', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: { content: 'A comment' },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread is not found', async () => {
      // Arrange
      const requestPayload = {
        content: 'A comment',
      };
      const server = await createServer(container);

      const { accessToken } = await UsersTableTestHelper.getAccessToken({
        server,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-xxx/comments', // non-existent thread
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 400 when request payload did not contain needed property', async () => {
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

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: {}, // empty payload
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada',
      );
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 and delete comment', async () => {
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

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      const comment =
        await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comment[0].is_delete).toEqual(true);
    });

    it('should response 403 when user is not the owner of the comment', async () => {
      // Arrange
      const server = await createServer(container);

      // Add owner of the comment
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

      // Get access token for another user
      const { accessToken: intruderAccessToken } =
        await UsersTableTestHelper.getAccessToken({
          server,
          username: 'intruder',
        });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
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

    it('should response 404 when thread or comment is not found', async () => {
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

      // Action: delete comment from non-existent thread
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-xxx/comments/comment-123',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });
});
