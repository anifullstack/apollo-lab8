import { orderedFor } from '../../sql/helpers';
import knex from '../../sql/connector';

export default class Student {
  studentsPagination(limit, after) {
    let where = '';
    if (after > 0) {
      where = `id < ${after}`;
    }

    return knex
      .select('id', 'title', 'content')
      .from('student')
      .whereRaw(where)
      .orderBy('id', 'desc')
      .limit(limit);
  }

  async getJournalsForStudentIds(studentIds) {
    const res = await knex
      .select('id', 'content', 'student_id AS studentId')
      .from('journal')
      .whereIn('student_id', studentIds);

    return orderedFor(res, studentIds, 'studentId', false);
  }

  getTotal() {
    return knex('student')
      .countDistinct('id as count')
      .first();
  }

  getNextPageFlag(id) {
    return knex('student')
      .countDistinct('id as count')
      .where('id', '<', id)
      .first();
  }

  student(id) {
    return knex
      .select('id', 'title', 'content')
      .from('student')
      .where('id', '=', id)
      .first();
  }

  addStudent({ title, content }) {
    return knex('student')
      .insert({ title, content })
      .returning('id');
  }

  deleteStudent(id) {
    return knex('student')
      .where('id', '=', id)
      .del();
  }

  editStudent({ id, title, content }) {
    return knex('student')
      .where('id', '=', id)
      .update({
        title: title,
        content: content
      });
  }

  addJournal({ content, studentId }) {
    return knex('journal')
      .insert({ content, student_id: studentId })
      .returning('id');
  }

  getJournal(id) {
    return knex
      .select('id', 'content')
      .from('journal')
      .where('id', '=', id)
      .first();
  }

  deleteJournal(id) {
    return knex('journal')
      .where('id', '=', id)
      .del();
  }

  editJournal({ id, content }) {
    return knex('journal')
      .where('id', '=', id)
      .update({
        content: content
      });
  }
}
