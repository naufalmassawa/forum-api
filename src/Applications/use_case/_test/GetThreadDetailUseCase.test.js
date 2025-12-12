const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const DetailReply = require('../../../Domains/replies/entities/DetailReply');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrating the get thread detail action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const mockThread = {
      id: 'thread-123',
      title: 'a thread title',
      body: 'a thread body',
      date: '2024-06-12T10:45:18.765Z',
      username: 'user-123',
    };

    const mockRepliesForComment1 = [
      new DetailReply({
        id: 'reply-123',
        username: 'johndoe',
        date: '2021-08-08T07:59:48.766Z',
        content: 'a reply',
        isDelete: false,
      }),
      new DetailReply({
        id: 'reply-456',
        username: 'johndoe',
        date: '2021-08-08T07:26:21.333Z',
        content: 'a reply',
        isDelete: true,
      }),
    ];

    const mockComments = [
      {
        id: 'comment-123',
        username: 'user-123',
        date: new Date('2024-06-12T10:45:18.765Z'),
        content: 'a comment',
        is_delete: false,
      },
      {
        id: 'comment-456',
        username: 'user-456',
        date: new Date('2024-06-12T10:45:18.765Z'),
        content: 'another comment',
        is_delete: true,
      },
    ];

    const mockReplies = [
      {
        id: 'reply-123',
        username: 'johndoe',
        date: new Date('2021-08-08T07:59:48.766Z'),
        content: 'a reply',
        comment_id: 'comment-123',
        is_delete: false,
      },
      {
        id: 'reply-456',
        username: 'johndoe',
        date: new Date('2021-08-08T07:26:21.333Z'),
        content: 'a reply',
        comment_id: 'comment-123',
        is_delete: true,
      },
    ];

    const mockCommentsForExpect = [
      new DetailComment({
        id: 'comment-123',
        username: 'user-123',
        date: '2024-06-12T10:45:18.765Z',
        content: 'a comment',
        isDelete: false,
        replies: mockRepliesForComment1,
      }),
      new DetailComment({
        id: 'comment-456',
        username: 'user-456',
        date: '2024-06-12T10:45:18.765Z',
        content: 'another comment',
        isDelete: true,
        replies: [],
      }),
    ];

    const mockExpectedDetailThread = new DetailThread({
      ...mockThread,
      comments: mockCommentsForExpect,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentsByThreadId = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockComments));
    mockReplyRepository.getRepliesByCommentIds = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockReplies));

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const detailThread = await getThreadDetailUseCase.execute(useCasePayload);

    // Assert
    expect(detailThread).toEqual(mockExpectedDetailThread);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
      useCasePayload.threadId,
    );
  });

  it('should return thread detail with empty comments when there are no comments', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const mockThread = {
      id: 'thread-123',
      title: 'a thread title',
      body: 'a thread body',
      date: '2024-06-12T10:45:18.765Z',
      username: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentsByThreadId = jest
      .fn()
      .mockImplementation(() => Promise.resolve([]));
    mockReplyRepository.getRepliesByCommentIds = jest.fn();

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const detailThread = await getThreadDetailUseCase.execute(useCasePayload);

    // Assert
    expect(detailThread).toEqual(
      new DetailThread({ ...mockThread, comments: [] }),
    );
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
      useCasePayload.threadId,
    );
    expect(mockReplyRepository.getRepliesByCommentIds).not.toBeCalled();
  });
});
