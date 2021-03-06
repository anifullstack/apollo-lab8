import React from 'react';
import PropTypes from 'prop-types';
import { graphql, compose } from 'react-apollo';

import StudentEditView from '../components/StudentEditView';
import StudentReadView from '../components/StudentReadView';

import { AddStudent } from './Student';

import STUDENT_QUERY from '../graphql/StudentQuery.graphql';
import ADD_STUDENT from '../graphql/AddStudent.graphql';
import EDIT_STUDENT from '../graphql/EditStudent.graphql';
import STUDENT_SUBSCRIPTION from '../graphql/StudentSubscription.graphql';

class StudentEdit extends React.Component {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    student: PropTypes.object,
    subscribeToMore: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.subscription = null;
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.loading) {
      // Check if props have changed and, if necessary, stop the subscription
      if (this.subscription && this.props.student.id !== nextProps.student.id) {
        this.subscription();
        this.subscription = null;
      }

      // Subscribe or re-subscribe
      if (!this.subscription && nextProps.student) {
        this.subscribeToStudentEdit(nextProps.student.id);
      }
    }
  }

  componentWillUnmount() {
    if (this.subscription) {
      // unsubscribe
      this.subscription();
    }
  }

  subscribeToStudentEdit = studentId => {
    const { subscribeToMore } = this.props;

    this.subscription = subscribeToMore({
      document: STUDENT_SUBSCRIPTION,
      variables: { id: studentId }
    });
  };

  render() {
    if (this.props && this.props.match && this.props.match.path && this.props.match.path.includes('journal')) {
      return <StudentReadView {...this.props} />;
    } else if (
      this.props &&
      this.props.navigation &&
      this.props.navigation.state &&
      this.props.navigation.state.routeName &&
      this.props.navigation.state.routeName.includes('StudentJournal')
    ) {
      return <StudentReadView {...this.props} />;
    } else return <StudentEditView {...this.props} />;
  }
}

export default compose(
  graphql(STUDENT_QUERY, {
    options: props => {
      let id = 0;
      if (props.match) {
        id = props.match.params.id;
      } else if (props.navigation) {
        id = props.navigation.state.params.id;
      }

      return {
        variables: { id }
      };
    },
    props({ data: { loading, error, student, subscribeToMore } }) {
      if (error) throw new Error(error);
      return { loading, student, subscribeToMore };
    }
  }),
  graphql(ADD_STUDENT, {
    props: ({ ownProps: { history, navigation }, mutate }) => ({
      addStudent: async (firstName, lastName, birthDate, content) => {
        let studentData = await mutate({
          variables: { input: { firstName, lastName, birthDate, content } },
          optimisticResponse: {
            __typename: 'Mutation',
            addStudent: {
              __typename: 'Student',
              id: null,
              firstName: firstName,
              lastName: lastName,
              birthDate: birthDate,
              content: content,
              journals: []
            }
          },
          updateQueries: {
            students: (prev, { mutationResult: { data: { addStudent } } }) => {
              return AddStudent(prev, addStudent);
            }
          }
        });

        if (history) {
          return history.push('/student/' + studentData.data.addStudent.id, {
            student: studentData.data.addStudent
          });
        } else if (navigation) {
          return navigation.setParams({
            id: studentData.data.addStudent.id,
            student: studentData.data.addStudent
          });
        }
      }
    })
  }),
  graphql(EDIT_STUDENT, {
    props: ({ ownProps: { history, navigation }, mutate }) => ({
      editStudent: async (id, firstName, lastName, birthDate, content) => {
        await mutate({
          variables: { input: { id, firstName, lastName, birthDate, content } }
        });
        if (history) {
          return history.push('/students');
        }
        if (navigation) {
          return navigation.goBack();
        }
      }
    })
  })
)(StudentEdit);
