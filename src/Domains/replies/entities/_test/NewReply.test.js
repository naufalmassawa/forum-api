const NewReply = require('../NewReply');

describe('a NewReply entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'a reply',
    };

    // Action & Assert
    expect(() => new NewReply(payload)).toThrow(
      'NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 123,
      owner: true,
      commentId: {},
    };

    // Action & Assert
    expect(() => new NewReply(payload)).toThrow(
      'NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create NewReply object correctly', () => {
    // Arrange
    const payload = {
      content: 'a reply',
      owner: 'user-123',
      commentId: 'comment-123',
    };

    // Action
    const newReply = new NewReply(payload);

    // Assert
    expect(newReply.content).toEqual(payload.content);
    expect(newReply.owner).toEqual(payload.owner);
    expect(newReply.commentId).toEqual(payload.commentId);
  });
});
