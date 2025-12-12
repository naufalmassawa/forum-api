const NewThread = require('../NewThread');

describe('a NewThread entity', () => {
  it('should throw error when payload did not contain needed property ', () => {
    // Arrange
    const payload = {
      title: 'A thread title',
    };

    // Action & Assert
    expect(() => new NewThread(payload)).toThrow(
      'NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      title: 123,
      body: {},
      owner: true,
    };

    // Action & Assert
    expect(() => new NewThread(payload)).toThrow(
      'NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create NewThread object correctly', () => {
    // Arrange
    const payload = {
      title: 'A thread title',
      body: 'A thread body',
      owner: 'user-123',
    };

    // Action
    const newThread = new NewThread(payload);

    // Assert
    expect(newThread.title).toEqual(payload.title);
    expect(newThread.body).toEqual(payload.body);
    expect(newThread.owner).toEqual(payload.owner);
  });
});
