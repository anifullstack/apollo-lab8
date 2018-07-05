import { orderedFor } from "../../sql/helpers";
import knex from "../../sql/connector";

export default class Student {
  studentsPagination(limit, after) {
    let where = "";
    if (after > 0) {
      where = `id < ${after}`;
    }

    return knex
      .select("id", "firstName", "lastName", "birthDate", "content")
      .from("student")
      .whereRaw(where)
      .orderBy("id", "desc")
      .limit(limit);
  }

  async getJournalsForStudentIds(studentIds) {
    const res = await knex
      .select(
        "id",
        "subject",
        "activity",
        "activityDate",
        "content",
        "student_id AS studentId"
      )
      .from("journal")
      .whereIn("student_id", studentIds)
      .orderBy("activityDate", "desc");

    return orderedFor(res, studentIds, "studentId", false);
  }

  getTotal() {
    return knex("student")
      .countDistinct("id as count")
      .first();
  }

  getNextPageFlag(id) {
    return knex("student")
      .countDistinct("id as count")
      .where("id", "<", id)
      .first();
  }

  student(id) {
    return knex
      .select("id", "firstName", "lastName", "birthDate", "content")
      .from("student")
      .where("id", "=", id)
      .first();
  }

  addStudent({ firstName, lastName, birthDate, content }) {
    return knex("student")
      .insert({ firstName, lastName, birthDate, content })
      .returning("id");
  }

  deleteStudent(id) {
    return knex("student")
      .where("id", "=", id)
      .del();
  }

  editStudent({ id, firstName, lastName, birthDate, content }) {
    return knex("student")
      .where("id", "=", id)
      .update({
        firstName: firstName,
        lastName: lastName,
        birthDate: birthDate,
        content: content
      });
  }

  addJournal({ subject, activity, activityDate, content, studentId }) {
    return knex("journal")
      .insert({
        subject,
        activity,
        activityDate,
        content,
        student_id: studentId
      })
      .returning("id");
  }

  getJournal(id) {
    return knex
      .select("id", "subject", "activity", "activityDate", "content")
      .from("journal")
      .where("id", "=", id)
      .first();
  }

  deleteJournal(id) {
    return knex("journal")
      .where("id", "=", id)
      .del();
  }

  editJournal({ id, subject, activity, activityDate, content }) {
    return knex("journal")
      .where("id", "=", id)
      .update({
        content: content,
        subject: subject,
        activity: activity,
        activityDate: activityDate
      });
  }
}
