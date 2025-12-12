/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.addColumn('comments', {
    thread_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'threads(id)',
      onDelete: 'CASCADE',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('comments', ['thread_id']);
};
