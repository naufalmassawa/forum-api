const DetailReply = require('../DetailReply');

describe('a DetailReply entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 'user-123',
      date: '2024-06-12T10:45:18.765Z',
    };

    // Action and Assert
    expect(() => new DetailReply(payload)).toThrowError(
      'DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      username: 'user-123',
      date: '2024-06-12T10:45:18.765Z',
      content: 'a reply',
      isDelete: 'false',
    };

    // Action and Assert
    expect(() => new DetailReply(payload)).toThrowError(
      'DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create detailReply object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 'user-123',
      date: '2024-06-12T10:45:18.765Z',
      content: 'a reply',
      isDelete: false,
    };

    // Action
    const detailReply = new DetailReply(payload);

    // Assert
    expect(detailReply.id).toEqual(payload.id);
    expect(detailReply.username).toEqual(payload.username);
    expect(detailReply.date).toEqual(payload.date);
    expect(detailReply.content).toEqual(payload.content);
  });

  it('should create detailReply object and replace content if reply is deleted', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 'user-123',
      date: '2024-06-12T10:45:18.765Z',
      content: 'a reply',
      isDelete: true,
    };
    const detailReply = new DetailReply(payload);
    expect(detailReply.content).toEqual('**balasan telah dihapus**');
  });
});
