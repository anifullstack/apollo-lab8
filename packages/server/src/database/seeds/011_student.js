import { truncateTables } from '../../sql/helpers';
import casual from 'casual';
import moment from 'moment';
import subjects from './../lookup/subjects';

export async function seed(knex, Promise) {
  await truncateTables(knex, Promise, ['student', 'journal']);

  await Promise.all(
    [...Array(20).keys()].map(async ii => {
      const student = await knex('student')
        .returning('id')
        .insert({
          firstName: `${casual.first_name}`,
          lastName: `${casual.last_name}`,
          birthDate: Math.round(
            moment()
              .subtract(casual.integer(1095, 2195), 'days')
              .valueOf()
          ),

          content: `Student content ${ii + 1}`
        });

      const randomSubject = casual.random_element(subjects);
      await Promise.all(
        [...Array(2).keys()].map(async jj => {
          const randomActivity = casual.random_element(randomSubject.activities);
          const delta = casual.integer(1, 60);
          const randomActivityDate = moment().subtract(delta, 'days');

          return knex('journal')
            .returning('id')
            .insert({
              student_id: student[0],
              subject: randomSubject.name,
              activity: randomActivity.name,
              activityDate: randomActivityDate.valueOf(),
              content: `content ${jj + 1} for student ${student[0]}`
            });
        })
      );
    })
  );
}
