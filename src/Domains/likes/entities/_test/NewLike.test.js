describe('NewLike', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      commentId: 'comment-123',
    };

    // Action & Assert
    expect(() => {
      // eslint-disable-next-line no-unused-vars
      const NewLike = require('../NewLike');
      // eslint-disable-next-line no-new
      new NewLike(payload);
    }).toThrow('NEW_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      commentId: 123,
      owner: 'user-123',
    };

    // Action & Assert
    expect(() => {
      // eslint-disable-next-line no-unused-vars
      const NewLike = require('../NewLike');
      // eslint-disable-next-line no-new
      new NewLike(payload);
    }).toThrow('NEW_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create new like object correctly', () => {
    // Arrange
    const payload = {
      commentId: 'comment-123',
      owner: 'user-123',
    };

    // Action
    const NewLike = require('../NewLike');
    const newLike = new NewLike(payload);

    // Assert
    expect(newLike.commentId).toEqual(payload.commentId);
    expect(newLike.owner).toEqual(payload.owner);
  });
});
