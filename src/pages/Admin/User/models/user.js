import { adminUsers, adminUsersDelete, adminUserSave } from '@/services/api';

export default {
  namespace: 'adminUser',

  state: {
    users: {
      list: [],
      pagination: {},
    },
    groupOptions: [],
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(adminUsers, payload);
      const pagination = Object.assign(
        {
          showSizeChanger: false,
          showQuickJumper: false,
        },
        response.pagination || {}
      );

      yield put({
        type: 'save',
        payload: {
          users: {
            list: response.users || [],
            pagination,
          },
          groupOptions: response.groupOptions || [],
        },
      });
    },
    *submitAdminUser({ payload, callback }, { call }) {
      const response = yield call(adminUserSave, payload);
      if (callback) callback(response);
    },
    *delete({ payload, callback }, { call }) {
      const response = yield call(adminUsersDelete, payload);
      if (callback) callback(response);
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
