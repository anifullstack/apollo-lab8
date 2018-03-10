import { truncateTables } from "../../sql/helpers";
import casual from "casual";
import moment from "moment";
export async function seed(knex, Promise) {
  await truncateTables(knex, Promise, ["student", "journal"]);

  await Promise.all(
    [...Array(20).keys()].map(async ii => {
      const student = await knex("student")
        .returning("id")
        .insert({
          firstName: `${casual.first_name}`,
          lastName: `${casual.last_name}`,
          birthDate: moment()
            .subtract(casual.integer(1095, 2195), "days")
            .valueOf(),

          content: `Student content ${ii + 1}`
        });

      await Promise.all(
        [...Array(2).keys()].map(async jj => {
          return knex("journal")
            .returning("id")
            .insert({
              student_id: student[0],
              content: `Journal ${jj + 1} for student ${student[0]}`
            });
        })
      );
    })
  );
}
