const ReplyRepository = require('../ReplyRepository');

describe('ReplyRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const replyRepository = new ReplyRepository();

    // Action & Assert
    expect(replyRepository.addReply({})).rejects.toThrow(
      'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
    expect(replyRepository.getRepliesByCommentIds([])).rejects.toThrow(
      'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
    expect(replyRepository.getRepliesByCommentId('')).rejects.toThrow(
      'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
    expect(replyRepository.verifyReplyExists('')).rejects.toThrow(
      'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
    expect(replyRepository.verifyReplyOwner('', '')).rejects.toThrow(
      'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
    expect(replyRepository.deleteReplyById('')).rejects.toThrow(
      'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });
});
