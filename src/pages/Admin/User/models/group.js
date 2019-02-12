import { adminGroups, adminGroupsDelete, adminGroupSave } from '@/services/api';

export default {
  namespace: 'adminGroup',

  state: {
    groups: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(adminGroups, payload);
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
          groups: {
            list: response.groups || [],
            pagination,
          },
        },
      });
    },
    *submitAdminGroup({ payload, callback }, { call }) {
      const response = yield call(adminGroupSave, payload);
      if (callback) callback(response);
    },
    *delete({ payload, callback }, { call }) {
      const response = yield call(adminGroupsDelete, payload);
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
