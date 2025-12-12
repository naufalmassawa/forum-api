const DetailThread = require('../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../Domains/comments/entities/DetailComment');
const DetailReply = require('../../Domains/replies/entities/DetailReply');

class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;
    await this._threadRepository.verifyThreadExists(threadId);
    const thread = await this._threadRepository.getThreadById(threadId);
    const commentRows =
      await this._commentRepository.getCommentsByThreadId(threadId);

    const commentIds = commentRows.map((c) => c.id);
    const replyRows =
      commentIds.length > 0
        ? await this._replyRepository.getRepliesByCommentIds(commentIds)
        : [];

    // group replies by comment id
    const repliesByComment = replyRows.reduce((acc, row) => {
      const key = row.comment_id;
      if (!acc[key]) acc[key] = [];
      acc[key].push(
        new DetailReply({
          id: row.id,
          username: row.username,
          date: row.date.toISOString(),
          content: row.content,
          isDelete: row.is_delete,
        }),
      );
      return acc;
    }, {});

    const comments = commentRows.map(
      (row) =>
        new DetailComment({
          id: row.id,
          username: row.username,
          date: row.date.toISOString(),
          content: row.content,
          isDelete: row.is_delete,
          replies: repliesByComment[row.id] || [],
        }),
    );

    return new DetailThread({ ...thread, comments });
  }
}

module.exports = GetThreadDetailUseCase;
