import { expect } from 'chai';
import { step } from 'mocha-steps';

import { getApollo } from '../../testHelpers/integrationSetup';
import POSTS_QUERY from '../../../../client/src/modules/student/graphql/StudentsQuery.graphql';
import POST_QUERY from '../../../../client/src/modules/student/graphql/StudentQuery.graphql';
import ADD_POST from '../../../../client/src/modules/student/graphql/AddStudent.graphql';
import EDIT_POST from '../../../../client/src/modules/student/graphql/EditStudent.graphql';
import DELETE_POST from '../../../../client/src/modules/student/graphql/DeleteStudent.graphql';
import POSTS_SUBSCRIPTION from '../../../../client/src/modules/student/graphql/StudentsSubscription.graphql';

describe('Student and journals example API works', () => {
  let apollo;

  before(() => {
    apollo = getApollo();
  });

  step('Query student list works', async () => {
    let result = await apollo.query({
      query: POSTS_QUERY,
      variables: { limit: 1, after: 0 }
    });

    expect(result.data).to.deep.equal({
      students: {
        totalCount: 20,
        edges: [
          {
            cursor: 20,
            node: {
              id: 20,
              firstName: 'Student firstName 20',
              content: 'Student content 20',
              __typename: 'Student'
            },
            __typename: 'StudentEdges'
          }
        ],
        pageInfo: {
          endCursor: 20,
          hasNextPage: true,
          __typename: 'StudentPageInfo'
        },
        __typename: 'Students'
      }
    });
  });

  step('Query single student with journals works', async () => {
    let result = await apollo.query({ query: POST_QUERY, variables: { id: 1 } });

    expect(result.data).to.deep.equal({
      student: {
        id: 1,
        firstName: 'Student firstName 1',
        content: 'Student content 1',
        __typename: 'Student',
        journals: [
          {
            id: 1,
            content: 'Journal firstName 1 for student 1',
            __typename: 'Journal'
          },
          {
            id: 2,
            content: 'Journal firstName 2 for student 1',
            __typename: 'Journal'
          }
        ]
      }
    });
  });

  step('Publishes student on add', done => {
    apollo.mutate({
      mutation: ADD_POST,
      variables: {
        input: {
          firstName: 'New student 1',
          content: 'New student content 1'
        }
      }
    });

    let subscription;

    subscription = apollo
      .subscribe({
        query: POSTS_SUBSCRIPTION,
        variables: { endCursor: 10 }
      })
      .subscribe({
        next(data) {
          expect(data).to.deep.equal({
            data: {
              studentsUpdated: {
                mutation: 'CREATED',
                node: {
                  id: 21,
                  firstName: 'New student 1',
                  content: 'New student content 1',
                  __typename: 'Student'
                },
                __typename: 'UpdateStudentPayload'
              }
            }
          });
          subscription.unsubscribe();
          done();
        }
      });
  });

  step('Adding student works', async () => {
    let result = await apollo.query({
      query: POSTS_QUERY,
      variables: { limit: 1, after: 0 },
      fetchPolicy: 'network-only'
    });
    expect(result.data.students).to.have.property('totalCount', 21);
    expect(result.data.students).to.have.nested.property('edges[0].node.firstName', 'New student 1');
    expect(result.data.students).to.have.nested.property('edges[0].node.content', 'New student content 1');
  });

  step('Publishes student on update', done => {
    apollo.mutate({
      mutation: EDIT_POST,
      variables: {
        input: {
          id: 21,
          firstName: 'New student 2',
          content: 'New student content 2'
        }
      }
    });

    let subscription;

    subscription = apollo
      .subscribe({
        query: POSTS_SUBSCRIPTION,
        variables: { endCursor: 10 }
      })
      .subscribe({
        next(data) {
          expect(data).to.deep.equal({
            data: {
              studentsUpdated: {
                mutation: 'UPDATED',
                node: {
                  id: 21,
                  firstName: 'New student 2',
                  content: 'New student content 2',
                  __typename: 'Student'
                },
                __typename: 'UpdateStudentPayload'
              }
            }
          });
          subscription.unsubscribe();
          done();
        }
      });
  });

  step('Updating student works', async () => {
    let result = await apollo.query({
      query: POSTS_QUERY,
      variables: { limit: 1, after: 0 },
      fetchPolicy: 'network-only'
    });
    expect(result.data.students).to.have.property('totalCount', 21);
    expect(result.data.students).to.have.nested.property('edges[0].node.firstName', 'New student 2');
    expect(result.data.students).to.have.nested.property('edges[0].node.content', 'New student content 2');
  });

  step('Publishes student on removal', done => {
    apollo.mutate({
      mutation: DELETE_POST,
      variables: { id: '21' }
    });

    let subscription;

    subscription = apollo
      .subscribe({
        query: POSTS_SUBSCRIPTION,
        variables: { endCursor: 10 }
      })
      .subscribe({
        next(data) {
          expect(data).to.deep.equal({
            data: {
              studentsUpdated: {
                mutation: 'DELETED',
                node: {
                  id: 21,
                  firstName: 'New student 2',
                  content: 'New student content 2',
                  __typename: 'Student'
                },
                __typename: 'UpdateStudentPayload'
              }
            }
          });
          subscription.unsubscribe();
          done();
        }
      });
  });

  step('Deleting student works', async () => {
    let result = await apollo.query({
      query: POSTS_QUERY,
      variables: { limit: 2, after: 0 },
      fetchPolicy: 'network-only'
    });
    expect(result.data.students).to.have.property('totalCount', 20);
    expect(result.data.students).to.have.nested.property('edges[0].node.firstName', 'Student firstName 20');
    expect(result.data.students).to.have.nested.property('edges[0].node.content', 'Student content 20');
  });
});
