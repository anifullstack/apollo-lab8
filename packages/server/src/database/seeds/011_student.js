import { truncateTables } from '../../sql/helpers';

export async function seed(knex, Promise) {
  await truncateTables(knex, Promise, ['student', 'journal']);

  await Promise.all(
    [...Array(20).keys()].map(async ii => {
      const student = await knex('student')
        .returning('id')
        .insert({
          title: `Student title ${ii + 1}`,
          content: `Student content ${ii + 1}`
        });

      await Promise.all(
        [...Array(2).keys()].map(async jj => {
          return knex('journal')
            .returning('id')
            .insert({
              student_id: student[0],
              content: `Journal title ${jj + 1} for student ${student[0]}`
            });
        })
      );
    })
  );
}
