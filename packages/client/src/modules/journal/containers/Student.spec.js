import { expect } from 'chai';
import { step } from 'mocha-steps';
import _ from 'lodash';

import Renderer from '../../../testHelpers/Renderer';
import STUDENTS_SUBSCRIPTION from '../graphql/StudentsSubscription.graphql';
import STUDENT_SUBSCRIPTION from '../graphql/StudentSubscription.graphql';
import JOURNAL_SUBSCRIPTION from '../graphql/JournalSubscription.graphql';

const createNode = id => ({
  id: `${id}`,
  firstName: `Student firstName ${id}`,
  content: `Student content ${id}`,
  journals: [
    { id: id * 1000 + 1, content: 'Student journal 1', __typename: 'Journal' },
    { id: id * 1000 + 2, content: 'Student journal 2', __typename: 'Journal' }
  ],
  __typename: 'Student'
});

const mutations = {
  editStudent: true,
  addJournal: true,
  editJournal: true,
  onJournalSelect: true
};

const mocks = {
  Query: () => ({
    students(ignored, { after }) {
      const totalCount = 4;
      const edges = [];
      for (let i = +after + 1; i <= +after + 2; i++) {
        edges.push({
          cursor: i,
          node: createNode(i),
          __typename: 'StudentEdges'
        });
      }
      return {
        totalCount,
        edges,
        pageInfo: {
          endCursor: edges[edges.length - 1].cursor,
          hasNextPage: true,
          __typename: 'StudentPageInfo'
        },
        __typename: 'Students'
      };
    },
    student(obj, { id }) {
      return createNode(id);
    }
  }),
  Mutation: () => ({
    deleteStudent: (obj, { id }) => createNode(id),
    deleteJournal: (obj, { input }) => input,
    ...mutations
  })
};

describe('Students and journals example UI works', () => {
  const renderer = new Renderer(mocks, {});
  let app;
  let content;

  beforeEach(() => {
    // Reset spy mutations on each step
    Object.keys(mutations).forEach(key => delete mutations[key]);
    if (app) {
      app.update();
      content = app.find('#content').last();
    }
  });

  step('Students page renders without data', () => {
    app = renderer.mount();
    content = app.find('#content').last();
    renderer.history.push('/students');

    content.text().should.equal('Loading...');
  });

  step('Students page renders with data', () => {
    expect(content.text()).to.include('Student firstName 1');
    expect(content.text()).to.include('Student firstName 2');
    expect(content.text()).to.include('2 / 4');
  });

  step('Clicking load more works', () => {
    const loadMoreButton = content.find('#load-more').last();
    loadMoreButton.simulate('click');
  });

  step('Clicking load more loads more students', () => {
    expect(content.text()).to.include('Student firstName 3');
    expect(content.text()).to.include('Student firstName 4');
    expect(content.text()).to.include('4 / 4');
  });

  step('Check subscribed to student list updates', () => {
    expect(renderer.getSubscriptions(STUDENTS_SUBSCRIPTION)).has.lengthOf(1);
  });

  step('Updates student list on student delete from subscription', () => {
    const subscription = renderer.getSubscriptions(STUDENTS_SUBSCRIPTION)[0];
    subscription.next({
      data: {
        studentsUpdated: {
          mutation: 'DELETED',
          node: createNode(2),
          __typename: 'UpdateStudentPayload'
        }
      }
    });

    expect(content.text()).to.not.include('Student firstName 2');
    expect(content.text()).to.include('3 / 3');
  });

  step('Updates student list on student create from subscription', () => {
    const subscription = renderer.getSubscriptions(STUDENTS_SUBSCRIPTION)[0];
    subscription.next(
      _.cloneDeep({
        data: {
          studentsUpdated: {
            mutation: 'CREATED',
            node: createNode(2),
            __typename: 'UpdateStudentPayload'
          }
        }
      })
    );

    expect(content.text()).to.include('Student firstName 2');
    expect(content.text()).to.include('4 / 4');
  });

  step('Clicking delete optimistically removes student', () => {
    mutations.deleteStudent = (obj, { id }) => {
      return createNode(id);
    };

    const deleteButtons = content.find('.delete-button');
    expect(deleteButtons).has.lengthOf(12);
    deleteButtons.last().simulate('click');

    expect(content.text()).to.not.include('Student firstName 4');
    expect(content.text()).to.include('3 / 3');
  });

  step('Clicking delete removes the student', () => {
    expect(content.text()).to.include('Student firstName 3');
    expect(content.text()).to.not.include('Student firstName 4');
    expect(content.text()).to.include('3 / 3');
  });

  step('Clicking on student works', () => {
    const studentLinks = content.find('.student-link');
    studentLinks.last().simulate('click', { button: 0 });
  });

  step('Clicking on student opens student form', () => {
    const studentForm = content.find('form[name="student"]');

    expect(content.text()).to.include('Edit Student');
    expect(
      studentForm
        .find('[name="firstName"]')
        .last()
        .instance().value
    ).to.equal('Student firstName 3');
    expect(
      studentForm
        .find('[name="content"]')
        .last()
        .instance().value
    ).to.equal('Student content 3');
  });

  step('Check subscribed to student updates', () => {
    expect(renderer.getSubscriptions(STUDENT_SUBSCRIPTION)).has.lengthOf(1);
  });

  step('Updates student form on student updated from subscription', () => {
    const subscription = renderer.getSubscriptions(STUDENT_SUBSCRIPTION)[0];
    subscription.next({
      data: {
        studentUpdated: {
          id: '3',
          firstName: 'Student firstName 203',
          content: 'Student content 204',
          __typename: 'Student'
        }
      }
    });
    const studentForm = content.find('form[name="student"]');
    expect(
      studentForm
        .find('[name="firstName"]')
        .last()
        .instance().value
    ).to.equal('Student firstName 203');
    expect(
      studentForm
        .find('[name="content"]')
        .last()
        .instance().value
    ).to.equal('Student content 204');
  });

  step('Student editing form works', done => {
    mutations.editStudent = (obj, { input }) => {
      expect(input.id).to.equal(3);
      expect(input.firstName).to.equal('Student firstName 33');
      expect(input.content).to.equal('Student content 33');
      done();
      return input;
    };

    const studentForm = app.find('form[name="student"]').last();
    studentForm
      .find('[name="firstName"]')
      .last()
      .simulate('change', { target: { name: 'firstName', value: 'Student firstName 33' } });
    studentForm
      .find('[name="content"]')
      .last()
      .simulate('change', { target: { name: 'content', value: 'Student content 33' } });
    studentForm.simulate('submit');
  });

  step('Check opening student by URL', () => {
    renderer.history.push('/student/3');
  });

  step('Opening student by URL works', () => {
    const studentForm = content.find('form[name="student"]');

    expect(content.text()).to.include('Edit Student');
    expect(
      studentForm
        .find('[name="firstName"]')
        .last()
        .instance().value
    ).to.equal('Student firstName 33');
    expect(
      studentForm
        .find('[name="content"]')
        .last()
        .instance().value
    ).to.equal('Student content 33');
    expect(content.text()).to.include('Edit Student');
  });

  step('Journal adding works', done => {
    mutations.addJournal = (obj, { input }) => {
      expect(input.studentId).to.equal(3);
      expect(input.content).to.equal('Student journal 24');
      done();
      return input;
    };

    const journalForm = content.find('form[name="journal"]');
    journalForm
      .find('[name="content"]')
      .last()
      .simulate('change', { target: { name: 'content', value: 'Student journal 24' } });
    journalForm.last().simulate('submit');
  });

  step('Journal adding works after submit', () => {
    expect(content.text()).to.include('Student journal 24');
  });

  step('Updates journal form on journal added got from subscription', () => {
    const subscription = renderer.getSubscriptions(JOURNAL_SUBSCRIPTION)[0];
    subscription.next({
      data: {
        journalUpdated: {
          mutation: 'CREATED',
          id: 3003,
          studentId: 3,
          node: {
            id: 3003,
            content: 'Student journal 3',
            __typename: 'Journal'
          },
          __typename: 'UpdateJournalPayload'
        }
      }
    });

    expect(content.text()).to.include('Student journal 3');
  });

  step('Updates journal form on journal deleted got from subscription', () => {
    const subscription = renderer.getSubscriptions(JOURNAL_SUBSCRIPTION)[0];
    subscription.next({
      data: {
        journalUpdated: {
          mutation: 'DELETED',
          id: 3003,
          studentId: 3,
          node: {
            id: 3003,
            content: 'Student journal 3',
            __typename: 'Journal'
          },
          __typename: 'UpdateJournalPayload'
        }
      }
    });
    expect(content.text()).to.not.include('Student journal 3');
  });

  step('Journal deleting optimistically removes journal', () => {
    const deleteButtons = content.find('.delete-journal');
    expect(deleteButtons).has.lengthOf(9);
    deleteButtons.last().simulate('click');

    app.update();
    content = app.find('#content').last();
    expect(content.text()).to.not.include('Student journal 24');
    expect(content.find('.delete-journal')).has.lengthOf(6);
  });

  step('Clicking journal delete removes the journal', () => {
    expect(content.text()).to.not.include('Student journal 24');
    expect(content.find('.delete-journal')).has.lengthOf(6);
  });

  step('Journal editing works', async done => {
    mutations.editJournal = (obj, { input }) => {
      expect(input.studentId).to.equal(3);
      expect(input.content).to.equal('Edited journal 2');
      done();
      return input;
    };
    const editButtons = content.find('.edit-journal');
    expect(editButtons).has.lengthOf(6);
    editButtons.last().simulate('click');
    editButtons.last().simulate('click');
    const journalForm = content.find('form[name="journal"]');
    expect(
      journalForm
        .find('[name="content"]')
        .last()
        .instance().value
    ).to.equal('Student journal 2');
    journalForm
      .find('[name="content"]')
      .last()
      .simulate('change', { target: { name: 'content', value: 'Edited journal 2' } });
    journalForm.simulate('submit');
  });

  step('Journal editing works', () => {
    expect(content.text()).to.include('Edited journal 2');
  });

  step('Clicking back button takes to student list', () => {
    expect(content.text()).to.include('Edited journal 2');
    const backButton = content.find('#back-button');
    backButton.last().simulate('click', { button: 0 });
    app.update();
    content = app.find('#content').last();
    expect(content.text()).to.include('Student firstName 3');
  });
});
