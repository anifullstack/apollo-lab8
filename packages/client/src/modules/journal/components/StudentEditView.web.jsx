import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';

import { PageLayout } from '../../common/components/web';
import StudentForm from './StudentForm';
import StudentJournals from '../containers/StudentJournals';
import settings from '../../../../../../settings';

const onSubmit = (student, addStudent, editStudent) => values => {
  if (student) {
    editStudent(student.id, values.firstName, values.lastName, values.birthDate, values.content);
  } else {
    addStudent(values.firstName, values.lastName, values.birthDate, values.content);
  }
};

const StudentEditView = ({ loading, student, match, location, subscribeToMore, addStudent, editStudent }) => {
  let studentObj = student;
  // if new student was just added read it from router
  if (!studentObj && location.state) {
    studentObj = location.state.student;
  }

  const renderMetaData = () => (
    <Helmet
      title={`${settings.app.name} - Edit student`}
      meta={[
        {
          name: 'description',
          content: 'Edit student example page'
        }
      ]}
    />
  );

  if (loading && !studentObj) {
    return (
      <PageLayout>
        {renderMetaData()}
        <div className="text-center">Loading...</div>
      </PageLayout>
    );
  } else {
    return (
      <PageLayout>
        {renderMetaData()}
        <Link id="back-button" to="/students">
          Back
        </Link>
        <h2>{student ? 'Edit' : 'Create'} Student</h2>
        <StudentForm onSubmit={onSubmit(studentObj, addStudent, editStudent)} student={student} />
        <br />
        {studentObj && (
          <StudentJournals
            studentId={Number(match.params.id)}
            journals={studentObj.journals}
            subscribeToMore={subscribeToMore}
          />
        )}
      </PageLayout>
    );
  }
};

StudentEditView.propTypes = {
  loading: PropTypes.bool.isRequired,
  student: PropTypes.object,
  addStudent: PropTypes.func.isRequired,
  editStudent: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  subscribeToMore: PropTypes.func.isRequired
};

export default StudentEditView;
