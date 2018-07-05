import React from 'react';
import PropTypes from 'prop-types';
import { graphql, compose } from 'react-apollo';
import update from 'immutability-helper';

import StudentJournalsView from '../components/StudentJournalsView';

import ADD_JOURNAL from '../graphql/AddJournal.graphql';
import EDIT_JOURNAL from '../graphql/EditJournal.graphql';
import DELETE_JOURNAL from '../graphql/DeleteJournal.graphql';
import JOURNAL_SUBSCRIPTION from '../graphql/JournalSubscription.graphql';
import ADD_JOURNAL_CLIENT from '../graphql/AddJournal.client.graphql';
import JOURNAL_QUERY_CLIENT from '../graphql/JournalQuery.client.graphql';
import SUBJECTS_QUERY from '../graphql/SubjectsQuery.graphql';
import ACTIVITYS_QUERY from '../graphql/ActivitysQuery.graphql';

function AddJournal(prev, node) {
  // ignore if duplicate
  if (prev.student.journals.some(journal => journal.id === node.id)) {
    return prev;
  }

  const filteredJournals = prev.student.journals.filter(journal => journal.id);
  return update(prev, {
    student: {
      journals: {
        $set: [...filteredJournals, node]
      }
    }
  });
}

function DeleteJournal(prev, id) {
  const index = prev.student.journals.findIndex(x => x.id === id);

  // ignore if not found
  if (index < 0) {
    return prev;
  }

  return update(prev, {
    student: {
      journals: {
        $splice: [[index, 1]]
      }
    }
  });
}

class StudentJournals extends React.Component {
  static propTypes = {
    studentId: PropTypes.number.isRequired,
    journals: PropTypes.array.isRequired,
    journal: PropTypes.object.isRequired,
    onJournalSelect: PropTypes.func.isRequired,
    subscribeToMore: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    //console.log("StudentJournalsContainer", "props", JSON.stringify(props));
    this.subscription = null;
  }

  componentWillReceiveProps(nextProps) {
    // Check if props have changed and, if necessary, stop the subscription
    if (this.subscription && this.props.studentId !== nextProps.studentId) {
      this.subscription = null;
    }

    // Subscribe or re-subscribe
    if (!this.subscription) {
      this.subscribeToJournalList(nextProps.studentId);
    }
  }

  componentWillUnmount() {
    this.props.onJournalSelect({
      id: null,
      subject: '',
      activity: '',
      activityDate: '',
      content: ''
    });

    if (this.subscription) {
      // unsubscribe
      this.subscription();
    }
  }

  subscribeToJournalList = studentId => {
    const { subscribeToMore } = this.props;

    this.subscription = subscribeToMore({
      document: JOURNAL_SUBSCRIPTION,
      variables: { studentId },
      updateQuery: (prev, { subscriptionData: { data: { journalUpdated: { mutation, id, node } } } }) => {
        let newResult = prev;

        if (mutation === 'CREATED') {
          newResult = AddJournal(prev, node);
        } else if (mutation === 'DELETED') {
          newResult = DeleteJournal(prev, id);
        }

        return newResult;
      }
    });
  };

  render() {
    console.log(`StudentJournals|render|journals|${JSON.stringify(this.props.journals)}`);
    return <StudentJournalsView {...this.props} />;
  }
}

const StudentJournalsWithApollo = compose(
  graphql(ADD_JOURNAL, {
    props: ({ mutate }) => ({
      addJournal: (subject, activity, activityDate, content, studentId) =>
        mutate({
          variables: {
            input: { subject, activity, activityDate, content, studentId }
          },
          optimisticResponse: {
            __typename: 'Mutation',
            addJournal: {
              __typename: 'Journal',
              id: null,
              subject: subject,
              activity: activity,
              activityDate: activityDate,
              content: content
            }
          },
          updateQueries: {
            student: (prev, { mutationResult: { data: { addJournal } } }) => {
              if (prev.student) {
                return AddJournal(prev, addJournal);
              }
            }
          }
        })
    })
  }),
  graphql(EDIT_JOURNAL, {
    props: ({ ownProps: { studentId }, mutate }) => ({
      editJournal: (id, subject, activity, activityDate, content) =>
        mutate({
          variables: {
            input: { id, studentId, subject, activity, activityDate, content }
          },
          optimisticResponse: {
            __typename: 'Mutation',
            editJournal: {
              __typename: 'Journal',
              id: id,
              subject: subject,
              activity: activity,
              activityDate: activityDate,
              content: content
            }
          }
        })
    })
  }),
  graphql(DELETE_JOURNAL, {
    props: ({ ownProps: { studentId }, mutate }) => ({
      deleteJournal: id =>
        mutate({
          variables: { input: { id, studentId } },
          optimisticResponse: {
            __typename: 'Mutation',
            deleteJournal: {
              __typename: 'Journal',
              id: id
            }
          },
          updateQueries: {
            student: (prev, { mutationResult: { data: { deleteJournal } } }) => {
              if (prev.student) {
                return DeleteJournal(prev, deleteJournal.id);
              }
            }
          }
        })
    })
  }),
  graphql(ADD_JOURNAL_CLIENT, {
    props: ({ mutate }) => ({
      onJournalSelect: journal => {
        mutate({ variables: { journal: journal } });
      }
    })
  }),
  graphql(SUBJECTS_QUERY, {
    options: () => {
      return {
        variables: {}
      };
    },
    props: ({ data }) => {
      //console.log('StudentJournals', 'SUBJECTS_QUERY', 'data', data);
      const { loading, error, subjects } = data;
      if (error) throw new Error(error);
      return { loading, subjects };
    }
  }),
  graphql(ACTIVITYS_QUERY, {
    options: () => {
      return {
        variables: {}
      };
    },
    props: ({ data }) => {
      //console.log("StudentJournals", "ACTIVITYS_QUERY", "data", data);
      const { loading, error, activitys } = data;
      if (error) throw new Error(error);
      return { loading, activitys };
    }
  }),
  graphql(JOURNAL_QUERY_CLIENT, {
    props: ({ data: { journal } }) => ({ journal })
  })
)(StudentJournals);

export default StudentJournalsWithApollo;
