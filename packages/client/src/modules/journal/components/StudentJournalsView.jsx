import React from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  FlatList,
  Text,
  View,
  Keyboard,
  TouchableOpacity,
  Platform,
  TouchableWithoutFeedback
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { SwipeAction } from '../../common/components/native';

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

  keyExtractor = item => item.id;

  renderItemIOS = ({ item: { id, subject, activity, activityDate, content } }) => {
    const { journal, deleteJournal, onJournalSelect } = this.props;
    return (
      <SwipeAction
        onPress={() =>
          onJournalSelect({
            id: id,
            subject: subject,
            activity: activity,
            activityDate: activityDate,
            content: content
          })
        }
        right={{
          text: 'Delete',
          onPress: () => this.onJournalDelete(journal, deleteJournal, onJournalSelect, id)
        }}
      >
        {activity}
      </SwipeAction>
    );
  };

  renderItemAndroid = ({ item: { id, subject, activity, activityDate, content } }) => {
    const { deleteJournal, onJournalSelect, journal } = this.props;
    return (
      <TouchableWithoutFeedback
        onPress={() =>
          onJournalSelect({
            id: id,
            subject: subject,
            activity: activity,
            activityDate: activityDate,
            content: content
          })
        }
      >
        <View style={styles.studentWrapper}>
          <Text style={styles.text}>{activityDate}</Text>
          <Text style={styles.text}>{subject}</Text>
          <Text style={styles.text}>{activity}</Text>
          <Text style={styles.text}>{content}</Text>
          <TouchableOpacity
            style={styles.iconWrapper}
            onPress={() => this.onJournalDelete(journal, deleteJournal, onJournalSelect, id)}
          >
            <FontAwesome name="trash" size={20} style={{ color: '#3B5998' }} />
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  onJournalDelete = (journal, deleteJournal, onJournalSelect, id) => {
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

  onSubmit = (journal, studentId, addJournal, editJournal, onJournalSelect) => values => {
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
    Keyboard.dismiss();
  };

  render() {
    const { studentId, journal, addJournal, editJournal, journals, onJournalSelect } = this.props;
    const renderItem = Platform.OS === 'android' ? this.renderItemAndroid : this.renderItemIOS;

    return (
      <View>
        <Text style={styles.firstName}>Journal</Text>
        <StudentJournalForm
          studentId={studentId}
          onSubmit={this.onSubmit(journal, studentId, addJournal, editJournal, onJournalSelect)}
          journal={journal}
        />
        {journals.length > 0 && (
          <View style={styles.list} keyboardDismissMode="on-drag">
            <FlatList data={journals} keyExtractor={this.keyExtractor} renderItem={renderItem} />
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    margin: 10
  },
  list: {
    paddingTop: 10
  },
  text: {
    fontSize: 18
  },
  iconWrapper: {
    backgroundColor: 'transparent',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  studentWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomColor: '#000',
    borderBottomWidth: 0.3,
    height: 50,
    paddingLeft: 7
  }
});
