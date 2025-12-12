const DetailThread = require('../DetailThread');

describe('a DetailThread entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'a thread title',
      body: 'a thread body',
      date: '2021-08-08T07:59:16.198Z',
      username: 'user-123',
    };

    // Action and Assert
    expect(() => new DetailThread(payload)).toThrowError(
      'DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      title: 'a thread title',
      body: 'a thread body',
      date: '2024-06-12T10:45:18.765Z',
      username: 'user-123',
      comments: {},
    };

    // Action and Assert
    expect(() => new DetailThread(payload)).toThrowError(
      'DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create detailThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'a thread title',
      body: 'a thread body',
      date: '2021-08-08T07:59:16.198Z',
      username: 'user-123',
      comments: [],
    };

    // Action
    const detailThread = new DetailThread(payload);

    // Assert
    expect(detailThread).toEqual(payload);
  });
});
