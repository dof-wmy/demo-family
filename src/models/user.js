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

      yield put({
        type: 'updateAuthority',
        payload: response,
      });

      // 更新菜单
      if (response.menuData) {
        yield put({
          type: 'menu/save',
          payload: {
            menuData: response.menuData,
          },
        });
      }
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
    updateAuthority(state, action) {
      const authority = action.payload.roles || [];
      authority.push('admin');
      setAuthority(authority);
      return {
        ...state,
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
