/*eslint-disable react/display-name*/
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesome } from '@expo/vector-icons';
import { StyleSheet, FlatList, Text, View, Platform, TouchableOpacity } from 'react-native';
import { SwipeAction } from '../../common/components/native';

export default class StudentList extends React.PureComponent {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    students: PropTypes.object,
    navigation: PropTypes.object,
    deleteStudent: PropTypes.func.isRequired,
    loadMoreRows: PropTypes.func.isRequired
  };

  onEndReachedCalledDuringMomentum = false;

  keyExtractor = item => item.node.id;

  renderItemIOS = ({ item: { node: { id, firstName, lastName } } }) => {
    const { deleteStudent, navigation } = this.props;
    return (
      <SwipeAction
        onPress={() => navigation.navigate('StudentEdit', { id })}
        right={{
          text: 'Delete',
          onPress: () => deleteStudent(id)
        }}
      >
        {firstName} {lastName}
      </SwipeAction>
    );
  };

  renderItemAndroid = ({ item: { node: { id, firstName, lastName } } }) => {
    const { deleteStudent, navigation } = this.props;
    return (
      <TouchableOpacity style={styles.studentWrapper} onPress={() => navigation.navigate('StudentJournal', { id })}>
        <Text style={styles.text}>
          {firstName} {lastName}
        </Text>
        <TouchableOpacity style={styles.iconWrapper} onPress={() => navigation.navigate('StudentEdit', { id })}>
          <FontAwesome name="edit" size={20} style={{ color: '#3B5998' }} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconWrapper} onPress={() => deleteStudent(id)}>
          <FontAwesome name="trash" size={20} style={{ color: '#3B5998' }} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  render() {
    const { loading, students, loadMoreRows } = this.props;
    const renderItem = Platform.OS === 'android' ? this.renderItemAndroid : this.renderItemIOS;
    if (loading) {
      return (
        <View style={styles.container}>
          <Text>Loading...</Text>
        </View>
      );
    } else {
      return (
        <FlatList
          data={students.edges}
          style={{ marginTop: 5 }}
          keyExtractor={this.keyExtractor}
          renderItem={renderItem}
          onEndReachedThreshold={0.5}
          onMomentumScrollBegin={() => {
            this.onEndReachedCalledDuringMomentum = false;
          }}
          onEndReached={() => {
            if (!this.onEndReachedCalledDuringMomentum) {
              if (students.pageInfo.hasNextPage) {
                this.onEndReachedCalledDuringMomentum = true;
                return loadMoreRows();
              }
            }
          }}
        />
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
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
