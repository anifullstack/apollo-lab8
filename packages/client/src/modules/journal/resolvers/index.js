import JOURNAL_QUERY_CLIENT from '../graphql/JournalQuery.client.graphql';

const TYPE_NAME = 'JournalState';
const TYPE_NAME_JOURNAL = 'Journal';

const defaults = {
  journal: {
    id: null,
    subject: '',
    activity: '',
    activityDate: '',
    content: '',
    activity: '',
    __typename: TYPE_NAME_JOURNAL
  },
  __typename: TYPE_NAME
};

const resolvers = {
  Query: {
    journalState: (_, args, { cache }) => {
      const { journal: { journal } } = cache.readQuery({
        query: JOURNAL_QUERY_CLIENT
      });
      return {
        journal: {
          ...journal,
          __typename: TYPE_NAME_JOURNAL
        },
        __typename: TYPE_NAME
      };
    }
  },
  Mutation: {
    onJournalSelect: async (_, { journal }, { cache }) => {
      await cache.writeData({
        data: {
          journal: {
            ...journal,
            __typename: TYPE_NAME_JOURNAL
          },
          __typename: TYPE_NAME
        }
      });

      return null;
    }
  }
};

export default {
  defaults,
  resolvers
};
