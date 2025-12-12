const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist new thread and return added thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const newThread = new NewThread({
        title: 'A thread title',
        body: 'A thread body',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(newThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
      expect(addedThread).toStrictEqual(
        new AddedThread({
          id: 'thread-123',
          title: 'A thread title',
          owner: 'user-123',
        }),
      );
    });
  });

  describe('verifyThreadExists function', () => {
    it('should throw NotFoundError when thread not exist', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        threadRepositoryPostgres.verifyThreadExists('thread-123'),
      ).rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError when thread exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        threadRepositoryPostgres.verifyThreadExists('thread-123'),
      ).resolves.not.toThrow(NotFoundError);
    });
  });

  describe('getThreadById function', () => {
    it('should return thread detail correctly', async () => {
      // Arrange
      const thread = {
        id: 'thread-123',
        title: 'A thread title',
        body: 'A thread body',
        owner: 'user-123',
        date: new Date('2024-06-12T10:00:00.000Z'),
      };
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'user' });
      await ThreadsTableTestHelper.addThread(thread);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const threadDetail =
        await threadRepositoryPostgres.getThreadById('thread-123');

      // Assert
      expect(threadDetail.id).toEqual(thread.id);
      expect(threadDetail.title).toEqual(thread.title);
      expect(threadDetail.body).toEqual(thread.body);
      expect(threadDetail.date).toEqual(thread.date.toISOString());
      expect(threadDetail.username).toEqual('user');
    });
  });
});
