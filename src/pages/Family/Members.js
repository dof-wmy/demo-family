import React, { PureComponent, Fragment } from 'react';
import Animate from 'rc-animate';
import { connect } from 'dva';
import moment from 'moment';
import debounce from 'lodash/debounce';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Icon,
  Button,
  Dropdown,
  Menu,
  AutoComplete,
  DatePicker,
  Modal,
  Tag,
  Select,
  Alert,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import MembersStyles from './Members.less';

const dateFormat = 'YYYY-MM-DD';
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

let searchParentsPayload = {
  parentType: null,
  keywords: null,
};

const fetchParents = () => {
  console.log('searchParents', searchParentsPayload);
  // motherMembers = []
  // fatherMembers = []
};
const searchParents = () => {
  debounce(fetchParents, 1000);
};

const onSearchMother = keywords => {
  searchParentsPayload = {
    parentType: 'mother',
    keywords,
  };
  searchParents();
};
const onSearchFather = keywords => {
  searchParentsPayload = {
    parentType: 'father',
    keywords,
  };
  searchParents();
};

const MemberForm = Form.create()(props => {
  const {
    modalVisible,
    confirmLoading,
    form,
    handleMemberFormSubmit,
    handleModalVisible,
    memberItem,
    families,
    sexes,
    fatherMembers,
    motherMembers,
  } = props;
  const isAdd = !memberItem || !memberItem.id;

  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // form.resetFields();
      handleMemberFormSubmit(fieldsValue);
    });
  };
  const onKeyDown = event => {
    // console.log(event)
    if (event.keyCode === 32) {
      event.preventDefault();
      return false;
    }
    return true;
  };
  let modalTitle = '新增成员';
  if (!isAdd) {
    modalTitle = '编辑成员';
  }
  const defaultFamilyId = families.length === 1 ? families[0].value : null;
  return (
    <Modal
      destroyOnClose
      width={500}
      confirmLoading={confirmLoading}
      title={modalTitle}
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      {!isAdd &&
        form.getFieldDecorator('id', {
          initialValue: memberItem ? memberItem.id : null,
        })(<Input type="hidden" />)}
      {
        <Form.Item labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="家族">
          {form.getFieldDecorator('family_id', {
            rules: [{ required: true, type: 'number', message: '请选择家族' }],
            initialValue: memberItem ? memberItem.family_id : defaultFamilyId,
          })(
            <Select
              showSearch
              allowClear
              style={{ width: '100%' }}
              placeholder="请选择家族"
              optionFilterProp="children"
              // onChange={this.handleChange}
            >
              {families.map(item => (
                <Select.Option key={item.value} value={item.value}>
                  {item.text}
                </Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>
      }
      {
        <Form.Item labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="姓名">
          {form.getFieldDecorator('name', {
            rules: [{ required: true, message: '姓名不能为空' }],
            initialValue: memberItem ? memberItem.name : null,
          })(<Input onKeyDown={onKeyDown} placeholder="请输入姓名" />)}
        </Form.Item>
      }
      {
        <Form.Item labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="性别">
          {form.getFieldDecorator('sex', {
            rules: [{ required: true, type: 'number', message: '请选择性别' }],
            initialValue: memberItem ? memberItem.sex : null,
          })(
            <Select
              allowClear
              style={{ width: '100%' }}
              placeholder="请选择性别"
              optionFilterProp="children"
              // onChange={this.handleChange}
            >
              {sexes.map(item => (
                <Select.Option key={item.value} value={item.value}>
                  {item.text}
                </Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>
      }
      {
        <Form.Item labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="生日">
          {form.getFieldDecorator('birthday', {
            rules: [{ required: true, message: '请选择生日' }],
            initialValue: memberItem ? moment(memberItem.birthday) : null,
          })(<DatePicker style={{ width: '100%' }} format={dateFormat} />)}
        </Form.Item>
      }
      {
        <Form.Item labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="父亲">
          {form.getFieldDecorator('father_id', {
            rules: [{ type: 'number', message: '请选择父亲' }],
            initialValue: memberItem ? memberItem.father_id : null,
          })(
            <Select
              showSearch
              allowClear
              style={{ width: '100%' }}
              placeholder="请选择父亲"
              optionFilterProp="children"
              // onChange={this.handleChange}
              onSearch={onSearchFather}
            >
              {fatherMembers.map(item => (
                <Select.Option key={item.value} value={item.value}>
                  {item.text}
                </Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>
      }
      {
        <Form.Item labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="母亲">
          {form.getFieldDecorator('mother_id', {
            rules: [{ type: 'number', message: '请选择母亲' }],
            initialValue: memberItem ? memberItem.mother_id : null,
          })(
            <Select
              showSearch
              allowClear
              style={{ width: '100%' }}
              placeholder="请选择母亲"
              optionFilterProp="children"
              // onChange={this.handleChange}
              onSearch={onSearchMother}
            >
              {motherMembers.map(item => (
                <Select.Option key={item.value} value={item.value}>
                  {item.text}
                </Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>
      }
    </Modal>
  );
});

@Form.create()
@connect(({ user, familyMember, loading }) => ({
  currentUser: user.currentUser,
  familyMember,
  loading: loading.models.familyMember,
}))
class Members extends PureComponent {
  state = {
    expandForm: false,
    formValues: {
      keywords: null,
      dateStart: null,
      // moment().date(1),
      dateEnd: null,
      // moment(),
      page: 1,
    },
    filters: {
      families: [],
    },
    sorter: null,
    pagination: {
      page: 1,
    },
    selectedRows: [],
    modalVisible: false,
    memberItem: null,
  };

  componentDidMount() {
    this.fetchMembers();
  }

  componentWillUnmount() {}

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});
    this.setState(
      {
        filters,
        pagination,
        sorter,
      },
      () => {
        this.fetchMembers();
      }
    );
  };

  handleSearch = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) {
        console.log('formValidateFields err', err);
      } else {
        const formValues = {
          ...fieldsValue,
          dateStart: fieldsValue.dateBetween && fieldsValue.dateBetween[0].format(dateFormat),
          dateEnd: fieldsValue.dateBetween && fieldsValue.dateBetween[1].format(dateFormat),
        };
        if (Object.prototype.hasOwnProperty.call(formValues, 'dateBetween')) {
          delete formValues.dateBetween;
        }
        this.setState(
          {
            formValues,
          },
          () => {
            this.fetchMembers({
              page: 1,
            });
          }
        );
      }
    });
  };

  fetchMembers = (options = {}) => {
    const { dispatch } = this.props;
    const { formValues, filters, sorter, pagination } = this.state;
    const params = {
      ...formValues,
      ...filters,
      page: options.page || pagination.current,
    };
    if (sorter && sorter.field) {
      params.order = `${sorter.field},${sorter.order}`;
    }
    dispatch({
      type: 'familyMember/fetch',
      payload: params,
    });
  };

  handleFormReset = () => {
    const { form } = this.props;
    form.resetFields();
    this.setState(
      {
        formValues: {},
      },
      () => {
        this.fetchMembers();
      }
    );
  };

  toggleForm = () => {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleMenuClick = e => {
    const { selectedRows } = this.state;

    if (selectedRows.length === 0) return;
    switch (e.key) {
      case 'delete':
        this.deleteMembers(selectedRows, true);
        break;
      case 'relation':
        this.getMembersRelation(selectedRows);
        break;
      default:
        break;
    }
  };

  deleteMembers = (members, resetSelectedRows = false) => {
    const { dispatch, familyMember } = this.props;

    const { families } = familyMember;
    const membersLabel = members.map(user => (
      <Tag key={user.id} color="orange">
        {user.name}【{families.find(familyItem => familyItem.value === user.family_id).text}】
      </Tag>
    ));
    const confirmContent = (
      <Row>
        <Col>确定要删除成员 {membersLabel} 吗？</Col>
      </Row>
    );
    const that = this;
    Modal.confirm({
      icon: 'warning',
      title: '警告',
      content: confirmContent,
      okText: '⚠️确定删除',
      cancelText: '再想想',
      onOk() {
        dispatch({
          type: 'familyMember/delete',
          payload: {
            ids: members.map(row => row.id),
          },
          callback: response => {
            if (response && !response.error_message) {
              if (resetSelectedRows) {
                that.setState({
                  selectedRows: [],
                });
              }
              that.fetchMembers({
                page: 1,
              });
            }
          },
        });
      },
      onCancel() {},
    });
  };

  getMembersRelation = members => {
    const { dispatch } = this.props;

    dispatch({
      type: 'familyMember/getMembersRelation',
      payload: {
        ids: members.map(row => row.id),
      },
      callback: response => {
        if (response && !response.error_message) {
          // console.log('getMembersRelation', members, response)
        }
      },
    });
  };

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
      memberItem: null,
    });
  };

  handleUpdateModalVisible = (flag, record) => {
    this.setState({
      modalVisible: !!flag,
      memberItem: record,
    });
  };

  handleMemberFormSubmit = fields => {
    const { dispatch } = this.props;
    this.setState({
      confirmLoading: true,
    });
    const that = this;
    const newFields = fields;
    if (newFields.birthday) {
      newFields.birthday = newFields.birthday.format(dateFormat);
    }
    dispatch({
      type: 'familyMember/submitFamilyMember',
      payload: fields,
      callback: response => {
        that.setState({
          confirmLoading: false,
        });
        if (response && !response.error_message) {
          that.handleModalVisible();
          that.fetchMembers();
        }
      },
    });
  };

  renderForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { expandForm, formValues } = this.state;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={10} sm={24}>
            <Form.Item label="关键词">
              {getFieldDecorator('keywords', {
                initialValue: formValues.keywords,
              })(
                <AutoComplete dataSource={[]} placeholder="姓名（精确匹配，多个请使用空格隔开）" />
              )}
            </Form.Item>
          </Col>
          <Animate transitionName="fade">
            {expandForm && (
              <Col md={8} sm={24}>
                <Form.Item label="生日">
                  {getFieldDecorator('dateBetween', {
                    initialValue: [
                      // formValues.dateStart,
                      // formValues.dateEnd,
                      null,
                      moment(),
                    ],
                  })(<DatePicker.RangePicker format={dateFormat} />)}
                </Form.Item>
              </Col>
            )}
          </Animate>
          <Col md={6} sm={24}>
            <Row type="flex" justify="end">
              <Col>
                <span className={MembersStyles.submitButtons}>
                  <Button type="primary" htmlType="submit">
                    查询
                  </Button>
                  <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                    重置
                  </Button>
                  <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
                    <Icon type={expandForm ? 'left' : 'right'} />
                  </a>
                </span>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { currentUser, loading, familyMember } = this.props;
    const { members, families, sexes, fatherMembers, motherMembers } = familyMember;
    const { selectedRows, modalVisible, confirmLoading, memberItem } = this.state;
    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]} theme="light">
        {currentUser && selectedRows.length === 2 && <Menu.Item key="relation">两者关系</Menu.Item>}
        {currentUser && (
          <Menu.Item key="delete">
            <Icon type="delete" theme="twoTone" twoToneColor="#f00" /> 批量删除
          </Menu.Item>
        )}
      </Menu>
    );
    const columns = [
      {
        title: '家族',
        dataIndex: 'family_id',
        filters: families,
        filterMultiple: false,
        render(familyId) {
          const memberFamily = families.find(familyItem => familyItem.value === familyId);
          return (
            <Tag key={memberFamily.value} color="blue">
              {memberFamily.text}
            </Tag>
          );
        },
      },
      {
        title: '姓名',
        dataIndex: 'name',
      },
      {
        title: '性别',
        dataIndex: 'sex',
        filters: sexes,
        filterMultiple: false,
        render(sex) {
          const memberSex = sexes.find(sexItem => sexItem.value === sex);
          return (
            <Tag key={memberSex.value} color={sex === 1 ? 'red' : 'green'}>
              {memberSex.text}
            </Tag>
          );
        },
      },
      {
        title: '生日',
        dataIndex: 'birthday',
        sorter: true,
      },
      {
        title: '父亲',
        dataIndex: 'father_name',
      },
      {
        title: '母亲',
        dataIndex: 'mother_name',
      },
      {
        title: '创建日期',
        dataIndex: 'created_at',
        sorter: true,
        render: val => moment(val).format(dateFormat),
      },
      {
        title: '操作',
        render: (text, record) => (
          <Fragment>
            {currentUser && (
              <Icon
                type="edit"
                theme="twoTone"
                onClick={() => this.handleUpdateModalVisible(true, record)}
              />
            )}
          </Fragment>
        ),
      },
    ];

    const parentMethods = {
      handleMemberFormSubmit: this.handleMemberFormSubmit,
      handleModalVisible: this.handleModalVisible,
    };
    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={MembersStyles.tableList}>
            <div className={MembersStyles.tableListForm}>{this.renderForm()}</div>
            <div className={MembersStyles.tableListOperator}>
              <Button icon="user-add" type="primary" onClick={() => this.handleModalVisible(true)}>
                新增
              </Button>
              {selectedRows.length > 0 && currentUser && (
                <span>
                  <Dropdown overlay={menu}>
                    <Button type="dashed">
                      批量操作 <Icon type="down" />
                    </Button>
                  </Dropdown>
                </span>
              )}
            </div>
            <Alert message="选中两成员可在【批量操作】中获取两者关系" type="success" closable />
            <StandardTable
              rowKey="id"
              selectedRows={selectedRows}
              loading={loading}
              data={members}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        <MemberForm
          {...parentMethods}
          confirmLoading={confirmLoading}
          modalVisible={modalVisible}
          memberItem={memberItem}
          families={families}
          sexes={sexes}
          fatherMembers={fatherMembers}
          motherMembers={motherMembers}
        />
      </PageHeaderWrapper>
    );
  }
}

export default Members;
