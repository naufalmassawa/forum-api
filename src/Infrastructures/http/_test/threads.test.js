const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'A thread title',
        body: 'A thread body',
      };
      const server = await createServer(container);

      const { accessToken } = await UsersTableTestHelper.getAccessToken({
        server,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.title).toEqual(requestPayload.title);
    });

    it('should response 401 when request does not have authentication', async () => {
      // Arrange
      const requestPayload = {
        title: 'A thread title',
        body: 'A thread body',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload did not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'A thread title',
      };
      const server = await createServer(container);
      const { accessToken } = await UsersTableTestHelper.getAccessToken({
        server,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada',
      );
    });
  });

  describe('when GET /threads', () => {
    it('should response 200 and return thread detail', async () => {
      // Arrange
      const server = await createServer(container);
      const user = { id: 'user-123', username: 'user' };
      const thread = { id: 'thread-123', owner: user.id };
      const comment = {
        id: 'comment-123',
        owner: user.id,
        threadId: thread.id,
        isDelete: false,
      };
      const deletedComment = {
        id: 'comment-456',
        owner: user.id,
        threadId: thread.id,
        isDelete: true,
      };

      await UsersTableTestHelper.addUser(user);
      await ThreadsTableTestHelper.addThread(thread);
      await CommentsTableTestHelper.addComment(comment);
      await CommentsTableTestHelper.addComment(deletedComment);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${thread.id}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(2);
      expect(responseJson.data.thread.comments[0].content).toEqual('A comment');
      expect(responseJson.data.thread.comments[1].content).toEqual(
        '**komentar telah dihapus**',
      );
    });

    it('should response 404 when thread is not found', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-xxx',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });
});
