import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Table, Button } from '../../common/components/web';
import StudentJournalForm from './StudentJournalForm';

export default class StudentJournalsView extends React.PureComponent {
  static propTypes = {
    studentId: PropTypes.number.isRequired,
    journals: PropTypes.array.isRequired,
    journal: PropTypes.object,
    addJournal: PropTypes.func.isRequired,
    editJournal: PropTypes.func.isRequired,
    deleteJournal: PropTypes.func.isRequired,
    subscribeToMore: PropTypes.func.isRequired,
    onJournalSelect: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    /*console.log(
      "StudentJournalsViewWeb|constructor",
      "props",
      JSON.stringify(props)
    );*/
  }

  handleEditJournal = (id, subject, activity, activityDate, content) => {
    console.log(
      'StudentJournalsViewWeb',
      'handleEditJournal',
      'activityDate',
      activityDate,
      'subject',
      subject,
      'activity',
      activity,
      'content',
      content
    );
    const { onJournalSelect } = this.props;
    onJournalSelect({ id, subject, activity, activityDate, content });
  };

  handleDeleteJournal = id => {
    const { journal, onJournalSelect, deleteJournal } = this.props;

    if (journal.id === id) {
      onJournalSelect({
        id: null,
        subject: '',
        activity: '',
        activityDate: '',
        content: ''
      });
    }

    deleteJournal(id);
  };

  onSubmit = () => values => {
    const { journal, studentId, addJournal, editJournal, onJournalSelect } = this.props;

    if (journal.id === null) {
      addJournal(values.subject, values.activity, values.activityDate, values.content, studentId);
    } else {
      editJournal(journal.id, values.subject, values.activity, values.activityDate, values.content);
    }

    onJournalSelect({
      id: null,
      subject: '',
      activity: '',
      activityDate: '',
      content: ''
    });
  };

  render() {
    const { studentId, journals, journal, subjects, activitys } = this.props;
    let js = journals.map(j => {
      let tempActivityDate = j.activityDate;
      if (j.activityDate && !isNaN(j.activityDate)) {
        tempActivityDate = moment(parseInt(j.activityDate)).format('MM/DD/YYYY');
      }

      return {
        ...j,
        activityDate: tempActivityDate
      };
    });
    console.log('StudentJournalsViewWeb|render|journals', journals);

    console.log('StudentJournalsViewWeb|render|js', js);

    const columns = [
      {
        title: 'Activity Date',
        dataIndex: 'activityDate',
        key: 'activityDate'
      },
      {
        title: 'subject',
        dataIndex: 'subject',
        key: 'subject'
      },
      {
        title: 'activity',
        dataIndex: 'activity',
        key: 'activity'
      },
      {
        title: 'Content',
        dataIndex: 'content',
        key: 'content'
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 120,
        render: (text, record) => (
          <div style={{ width: 120 }}>
            <Button
              color="primary"
              size="sm"
              className="edit-journal"
              onClick={() =>
                this.handleEditJournal(record.id, record.subject, record.activity, record.activityDate, record.content)
              }
            >
              Edit
            </Button>{' '}
            <Button
              color="primary"
              size="sm"
              className="delete-journal"
              onClick={() => this.handleDeleteJournal(record.id)}
            >
              Delete
            </Button>
          </div>
        )
      }
    ];

    return (
      <div>
        <h3>Journals</h3>
        <StudentJournalForm
          studentId={studentId}
          onSubmit={this.onSubmit()}
          initialValues={journal}
          journal={journal}
          subjects={subjects}
          activitys={activitys}
        />
        <h1 />
        <Table dataSource={js} columns={columns} />
      </div>
    );
  }
}
