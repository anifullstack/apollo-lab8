exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable("activity", table => {
      table.increments();
      table.string("subject");
      table.string("name");
      table.string("type");

      table.string("description");
      table.timestamps(false, true);
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable("activity")]);
};
