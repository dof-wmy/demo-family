import { adminUsers, adminUsersDelete, adminUserSave } from '@/services/api';

export default {
  namespace: 'adminUser',

  state: {
    users: {
      list: [],
      pagination: {},
    },
    trashOptions: [],
    groupOptions: [],
    permissionOptions: [],
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(adminUsers, payload);
      const pagination = Object.assign(
        {
          showSizeChanger: false,
          showQuickJumper: false,
        },
        response.meta.paginatorTransformer || {}
      );

      yield put({
        type: 'save',
        payload: {
          users: {
            list: response.data || [],
            pagination,
          },
          trashOptions: response.meta.trashOptions || [],
          groupOptions: response.meta.groupOptions || [],
          permissionOptions: response.meta.permissionOptions || [],
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
