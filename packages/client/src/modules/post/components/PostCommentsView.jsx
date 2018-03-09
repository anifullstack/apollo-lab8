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

import PostCommentForm from './PostCommentForm';

export default class PostCommentsView extends React.PureComponent {
  static propTypes = {
    postId: PropTypes.number.isRequired,
    comments: PropTypes.array.isRequired,
    comment: PropTypes.object,
    addComment: PropTypes.func.isRequired,
    editComment: PropTypes.func.isRequired,
    deleteComment: PropTypes.func.isRequired,
    subscribeToMore: PropTypes.func.isRequired,
    onCommentSelect: PropTypes.func.isRequired
  };

  keyExtractor = item => item.id;

  renderItemIOS = ({ item: { id, content } }) => {
    const { comment, deleteComment, onCommentSelect } = this.props;
    return (
      <SwipeAction
        onPress={() => onCommentSelect({ id: id, content: content })}
        right={{
          text: 'Delete',
          onPress: () => this.onCommentDelete(comment, deleteComment, onCommentSelect, id)
        }}
      >
        {content}
      </SwipeAction>
    );
  };

  renderItemAndroid = ({ item: { id, content } }) => {
    const { deleteComment, onCommentSelect, comment } = this.props;
    return (
      <TouchableWithoutFeedback onPress={() => onCommentSelect({ id: id, content: content })}>
        <View style={styles.postWrapper}>
          <Text style={styles.text}>{content}</Text>
          <TouchableOpacity
            style={styles.iconWrapper}
            onPress={() => this.onCommentDelete(comment, deleteComment, onCommentSelect, id)}
          >
            <FontAwesome name="trash" size={20} style={{ color: '#3B5998' }} />
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  onCommentDelete = (comment, deleteComment, onCommentSelect, id) => {
    if (comment.id === id) {
      onCommentSelect({ id: null, content: '' });
    }

    deleteComment(id);
  };

  onSubmit = (comment, postId, addComment, editComment, onCommentSelect) => values => {
    if (comment.id === null) {
      addComment(values.content, postId);
    } else {
      editComment(comment.id, values.content);
    }

    onCommentSelect({ id: null, content: '' });
    Keyboard.dismiss();
  };

  render() {
    const { postId, comment, addComment, editComment, comments, onCommentSelect } = this.props;
    const renderItem = Platform.OS === 'android' ? this.renderItemAndroid : this.renderItemIOS;

    return (
      <View>
        <Text style={styles.title}>Comments</Text>
        <PostCommentForm
          postId={postId}
          onSubmit={this.onSubmit(comment, postId, addComment, editComment, onCommentSelect)}
          comment={comment}
        />
        {comments.length > 0 && (
          <View style={styles.list} keyboardDismissMode="on-drag">
            <FlatList data={comments} keyExtractor={this.keyExtractor} renderItem={renderItem} />
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
  postWrapper: {
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
