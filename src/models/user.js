import { query as queryUsers, me, updateMe } from '@/services/user';
import { setAuthority } from '@/utils/authority';

import defaultSettings from '@/defaultSettings';

export default {
  namespace: 'user',

  state: {
    list: [],
    currentUser: {},
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *fetchCurrent(_, { call, put }) {
      const response = yield call(me);
      yield put({
        type: 'saveCurrentUser',
        payload: response,
      });

      const authority = response.groups;
      authority.push('admin');
      setAuthority(authority);
    },
    *updateMe({ payload, callback }, { call }) {
      const response = yield call(updateMe, payload);
      if (callback) callback(response);
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    saveCurrentUser(state, action) {
      const currentUser = Object.assign(
        {
          avatar: defaultSettings.user.avatar,
        },
        action.payload || {}
      );
      return {
        ...state,
        currentUser,
      };
    },
    changeNotifyCount(state, action) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload.totalCount,
          unreadCount: action.payload.unreadCount,
        },
      };
    },
  },
};
