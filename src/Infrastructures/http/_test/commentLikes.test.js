const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentsTableLikesTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('PUT /threads/{threadId}/comments/{commentId}/likes', () => {
  afterEach(async () => {
    await CommentsTableLikesTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when user likes a comment', () => {
    it('should return 200 and success status when user successfully likes a comment', async () => {
      // Arrange
      const server = await createServer(container);
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await UsersTableTestHelper.addUser({
        id: userId,
        username: 'dicoding',
        password: 'secret_password',
        fullName: 'Dicoding Indonesia',
      });
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: 'sebuah thread',
        body: 'sebuah body thread',
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        content: 'sebuah comment',
        owner: userId,
        threadId,
      });

      const { accessToken } = await server
        .inject({
          method: 'POST',
          url: '/authentications',
          payload: {
            username: 'dicoding',
            password: 'secret_password',
          },
        })
        .then((res) => JSON.parse(res.payload).data);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });

  describe('when user unlikes a comment', () => {
    it('should return 200 and success status when user successfully unlikes a comment', async () => {
      // Arrange
      const server = await createServer(container);
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await UsersTableTestHelper.addUser({
        id: userId,
        username: 'dicoding',
        password: 'secret_password',
        fullName: 'Dicoding Indonesia',
      });
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: 'sebuah thread',
        body: 'sebuah body thread',
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        content: 'sebuah comment',
        owner: userId,
        threadId,
      });
      await CommentsTableLikesTestHelper.addLike({
        commentId,
        userId,
      });

      const { accessToken } = await server
        .inject({
          method: 'POST',
          url: '/authentications',
          payload: {
            username: 'dicoding',
            password: 'secret_password',
          },
        })
        .then((res) => JSON.parse(res.payload).data);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });

  describe('when user is not authenticated', () => {
    it('should return 401 when user does not provide access token', async () => {
      // Arrange
      const server = await createServer(container);
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });
  });

  describe('when comment does not exist', () => {
    it('should return 404 when comment not found', async () => {
      // Arrange
      const server = await createServer(container);
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await UsersTableTestHelper.addUser({
        id: userId,
        username: 'dicoding',
        password: 'secret_password',
        fullName: 'Dicoding Indonesia',
      });

      const { accessToken } = await server
        .inject({
          method: 'POST',
          url: '/authentications',
          payload: {
            username: 'dicoding',
            password: 'secret_password',
          },
        })
        .then((res) => JSON.parse(res.payload).data);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toEqual(404);
    });
  });

  describe('when thread does not exist', () => {
    it('should return 404 when thread not found', async () => {
      // Arrange
      const server = await createServer(container);
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await UsersTableTestHelper.addUser({
        id: userId,
        username: 'dicoding',
        password: 'secret_password',
        fullName: 'Dicoding Indonesia',
      });

      const { accessToken } = await server
        .inject({
          method: 'POST',
          url: '/authentications',
          payload: {
            username: 'dicoding',
            password: 'secret_password',
          },
        })
        .then((res) => JSON.parse(res.payload).data);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toEqual(404);
    });
  });
});
