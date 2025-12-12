const DeleteComment = require('../DeleteComment');

describe('A DeleteComment entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      owner: 'user-123',
    };

    // Action & Assert
    expect(() => new DeleteComment(payload)).toThrow(
      'DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      commentId: 123,
      threadId: true,
      owner: {},
    };

    // Action & Assert
    expect(() => new DeleteComment(payload)).toThrow(
      'DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create deleteComment object correctly', () => {
    // Arrange
    const payload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    // Action
    const deleteComment = new DeleteComment(payload);

    // Assert
    expect(deleteComment).toBeInstanceOf(DeleteComment);
    expect(deleteComment.commentId).toEqual(payload.commentId);
    expect(deleteComment.threadId).toEqual(payload.threadId);
    expect(deleteComment.owner).toEqual(payload.owner);
  });
});
