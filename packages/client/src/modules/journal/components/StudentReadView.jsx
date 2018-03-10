import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

import StudentForm from './StudentForm';
import StudentJournals from '../containers/StudentJournals';

const onSubmit = (student, addStudent, editStudent) => values => {
  if (student) {
    editStudent(student.id, values.firstName, values.lastName, values.birthDate, values.content);
  } else {
    addStudent(values.firstName, values.lastName, values.birthDate, values.content);
  }
};

const StudentEditView = ({ loading, student, navigation, subscribeToMore, addStudent, editStudent }) => {
  let studentObj = student;

  // if new student was just added read it from router
  if (!studentObj && navigation.state) {
    studentObj = navigation.state.params.student;
  }

  if (loading && !studentObj) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  } else {
    return (
      <ScrollView style={styles.container}>
        <StudentForm onSubmit={onSubmit(studentObj, addStudent, editStudent)} student={student} />
        {studentObj && (
          <StudentJournals
            studentId={navigation.state.params.id}
            journals={studentObj.journals}
            subscribeToMore={subscribeToMore}
          />
        )}
      </ScrollView>
    );
  }
};

StudentEditView.propTypes = {
  loading: PropTypes.bool.isRequired,
  student: PropTypes.object,
  addStudent: PropTypes.func.isRequired,
  editStudent: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  subscribeToMore: PropTypes.func.isRequired
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column'
  }
});

export default StudentEditView;
