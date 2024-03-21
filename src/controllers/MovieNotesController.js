const knex = require("../database/knex")

class MovieNotesController {
  async index(request, response) {
    const { user_id, search, tags } = request.query
    let movieNotes
    if (tags) {
      const filterTags = tags.split(",").filter(tag => tag.trim())

      movieNotes = await knex("movie_tags")
        .where("movie_notes.user_id", user_id)
        .whereLike("movie_notes.title", `%${search}%`)
        .whereIn("name", filterTags)
        .innerJoin("movie_notes", "movie_notes.id", "movie_tags.note_id")
        .orderBy("movie_notes.title")
    } else {
      movieNotes = await knex("movie_notes")
        .where({ user_id })
        .whereLike("title", `%${search}%`)
        .orderBy("title")
    }

    const userTags = await knex("movie_tags").where({ user_id })
    const movieNotesWithTags = movieNotes.map(movieNote => {
      const movieNoteTag = userTags.filter(tag => tag.note_id === movieNote.id)

      return {
        ...movieNote,
        tags: movieNoteTag
      }
    })

    return response.json(movieNotesWithTags)
  }

  async create(request, response) {
    const { title, description, rating, tags } = request.body
    const { user_id } = request.params

    const [note_id] = await knex("movie_notes").insert({
      title,
      description,
      rating,
      user_id
    })

    const tagsInsert = tags.map(tag => {
      return {
        user_id,
        note_id,
        name: tag.name
      }
    })

    await knex("movie_tags").insert(tagsInsert)

    return response.json()
  }

  async show(request, response) {
    const { id } = request.params

    const movieNote = await knex("movie_notes").where({ id }).first()
    const movieTags = await knex("movie_tags")
      .where({ note_id: id })
      .orderBy("name")

    return response.json({
      ...movieNote,
      movieTags
    })
  }

  async delete(request, response) {
    const { id } = request.params

    await knex("movie_notes").where({ id }).delete()

    return response.json()
  }
}

module.exports = MovieNotesController
