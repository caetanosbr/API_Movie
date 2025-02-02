exports.up = knex =>
  knex.schema.createTable("users", table => {
    table.increments("id").primary()
    table.text("name")
    table.text("email").unique().collate("utf8_unicode_ci")
    table.text("password")
    table.text("avatar")

    table.timestamp("created_at").default(knex.fn.now())
    table.timestamp("updated_at").default(knex.fn.now())
  })

exports.down = knex => knex.schema.dropTable("users")
