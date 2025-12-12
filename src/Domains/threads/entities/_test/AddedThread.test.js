const AddedThread = require('../AddedThread');

describe('a AddedThread entity', () => {
  it('should throw error when did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'A thread title',
    };

    // Action & Assert
    expect(() => new AddedThread(payload)).toThrow(
      'ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      title: true,
      owner: {},
    };

    // Action & Assert
    expect(() => new AddedThread(payload)).toThrow(
      'ADDED_THREAD.DID_NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create an AddedThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'A thread title',
      owner: 'user-123',
    };

    // Action
    const addedThread = new AddedThread(payload);

    // Assert
    expect(addedThread.id).toEqual(payload.id);
    expect(addedThread.title).toEqual(payload.title);
    expect(addedThread.owner).toEqual(payload.owner);
  });
});
