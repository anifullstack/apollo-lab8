exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema
      .createTable('student', table => {
        table.increments();
        table.string('firstName');
        table.string('lastName');
        table.integer('birthDate').notNullable();
        table.string('content');
        table.timestamps(false, true);
      })
      .createTable('journal', table => {
        table.increments();
        table
          .integer('student_id')
          .unsigned()
          .references('id')
          .inTable('student')
          .onDelete('CASCADE');
        table.integer('activityDate').notNullable();
        table.integer('subject');
        table.integer('activity');
        table.string('content');
        table.timestamps(false, true);
      })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('journal'), knex.schema.dropTable('student')]);
};
