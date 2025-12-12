/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123',
    content = 'a reply',
    commentId = 'comment-123',
    owner = 'user-123',
    date = new Date(),
    isDelete = false,
  }) {
    const query = {
      text: 'INSERT INTO replies(id, content, owner, comment_id, date, is_delete) VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, content, owner, commentId, date, isDelete],
    };

    await pool.query(query);
  },

  async findReplyById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows[0];
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies');
  },
};

module.exports = RepliesTableTestHelper;
