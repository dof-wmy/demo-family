import {
  familyMembers,
  familyMemberSave,
  familyMemberDelete,
  getMembersRelation,
} from '@/services/api';

export default {
  namespace: 'familyMember',

  state: {
    members: {
      list: [],
      pagination: {},
    },
    families: [],
    sexes: [],
    motherMembers: [],
    fatherMembers: [],
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(familyMembers, payload);
      const pagination = Object.assign(
        {
          showSizeChanger: false,
          showQuickJumper: false,
          // hideOnSinglePage: true,
          showTotal: total => `总计 ${total} 人`,
        },
        response.meta.paginatorTransformer || {}
      );

      yield put({
        type: 'save',
        payload: {
          members: {
            list: response.data || [],
            pagination,
          },
          families: response.meta.families || [],
          sexes: response.meta.sexes || [],
          motherMembers: response.meta.mothers || [],
          fatherMembers: response.meta.fathers || [],
        },
      });
    },
    *submitFamilyMember({ payload, callback }, { call }) {
      const response = yield call(familyMemberSave, payload);
      if (callback) callback(response);
    },
    *delete({ payload, callback }, { call }) {
      const response = yield call(familyMemberDelete, payload);
      if (callback) callback(response);
    },
    *getMembersRelation({ payload, callback }, { call }) {
      const response = yield call(getMembersRelation, payload);
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
