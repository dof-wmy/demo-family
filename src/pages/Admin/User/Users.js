import React, { PureComponent, Fragment } from 'react';
import Animate from 'rc-animate';
import { connect } from 'dva';
import moment from 'moment';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Icon,
  Button,
  Dropdown,
  Menu,
  AutoComplete,
  DatePicker,
  Modal,
  Divider,
  Tag,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import TableListStyles from './TableList.less';
// import { View } from '@antv/g2/src';

const { confirm } = Modal;
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';
const FormItem = Form.Item;
// const { Option } = Select;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

const UserForm = Form.create()(props => {
  const {
    modalVisible,
    confirmLoading,
    form,
    handleUserFormSubmit,
    handleModalVisible,
    resetPassword,
    userData,
    groupOptions,
  } = props;
  const isAdd = !userData || !userData.id;
  const showPassword = resetPassword || !userData;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // form.resetFields();
      handleUserFormSubmit(fieldsValue);
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
  let modalTitle = '新增管理员';
  if (!isAdd) {
    modalTitle = '编辑管理员';
  }
  if (resetPassword) {
    modalTitle = '重置密码';
  }
  return (
    <Modal
      destroyOnClose
      confirmLoading={confirmLoading}
      title={modalTitle}
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      {!isAdd && (
        <FormItem>
          {form.getFieldDecorator('id', {
            initialValue: userData ? userData.id : null,
          })(<Input type="hidden" />)}
        </FormItem>
      )}
      {!resetPassword && (
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="用户名">
          {form.getFieldDecorator('username', {
            rules: [{ required: true, message: '用户名不能为空' }],
            initialValue: userData ? userData.username : '',
          })(<Input onKeyDown={onKeyDown} placeholder="请输入用户名（登录账户）" />)}
        </FormItem>
      )}
      {!resetPassword && (
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="名称">
          {form.getFieldDecorator('name', {
            rules: [{ required: true, message: '名称不能为空' }],
            initialValue: userData ? userData.name : '',
          })(<Input onKeyDown={onKeyDown} placeholder="请输入名称" />)}
        </FormItem>
      )}
      {showPassword && (
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="密码">
          {form.getFieldDecorator('password', {
            rules: [{ required: true, pattern: /[\S]{6,}/, message: '密码至少六位' }],
          })(<Input type="password" onKeyDown={onKeyDown} placeholder="请输入密码" />)}
        </FormItem>
      )}
      {showPassword && (
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="确认密码">
          {form.getFieldDecorator('password_confirmation', {
            rules: [{ required: true, pattern: /[\S]{6,}/, message: '密码至少六位' }],
          })(<Input type="password" onKeyDown={onKeyDown} placeholder="请再次输入密码" />)}
        </FormItem>
      )}
      {!resetPassword && (
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="管理组">
          {form.getFieldDecorator('groups', {
            rules: [{ required: true, message: '请选择管理组' }],
            initialValue: userData ? userData.groups.map(item => item.id) : [],
          })(
            <Select
              style={{ width: '100%' }}
              mode="multiple"
              placeholder="请选择管理组"
              optionFilterProp="children"
              // onChange={this.handleChange}
            >
              {groupOptions.map(item => (
                <Select.Option key={item.value} value={item.value}>
                  {item.text}
                </Select.Option>
              ))}
            </Select>
          )}
        </FormItem>
      )}
    </Modal>
  );
});

@Form.create()
@connect(({ adminUser, loading }) => ({
  adminUser,
  loading: loading.models.adminUser,
}))
class Users extends PureComponent {
  state = {
    expandForm: false,
    formValues: {
      keywords: '',
      dateStart: '',
      // moment().date(1),
      dateEnd: '',
      // moment(),
      page: 1,
    },
    filters: {
      groups: [],
    },
    sorter: '',
    pagination: {
      page: 1,
    },
    selectedRows: [],
    modalVisible: false,
    confirmLoading: false,
    resetPassword: false,
    userData: null,
  };

  componentDidMount() {
    this.fetchUsers();
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
        this.fetchUsers();
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
            this.fetchUsers({
              page: 1,
            });
          }
        );
      }
    });
  };

  fetchUsers = (options = {}) => {
    const { dispatch } = this.props;
    const { formValues, filters, sorter, pagination } = this.state;
    const params = {
      ...formValues,
      ...filters,
      page: options.page || pagination.current,
    };
    if (sorter.field) {
      params.order = `${sorter.field},${sorter.order}`;
    }
    // console.log(params);
    dispatch({
      type: 'adminUser/fetch',
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
        this.fetchUsers();
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
        this.deleteUsers(selectedRows, true);
        break;
      default:
        break;
    }
  };

  deleteUsers = (users, resetSelectedRows = false) => {
    const { dispatch } = this.props;
    const usersLabel = users.map(user => (
      <Tag key={user.id} color="orange">
        {user.name}【{user.username}】
      </Tag>
    ));
    const confirmContent = (
      <Row>
        <Col>确定要删除管理员 {usersLabel} 吗？</Col>
      </Row>
    );
    const that = this;
    confirm({
      title: '警告⚠️',
      content: confirmContent,
      okText: '确定',
      cancelText: '再想想',
      onOk() {
        dispatch({
          type: 'adminUser/delete',
          payload: {
            ids: users.map(row => row.id),
          },
          callback: response => {
            if (response && !response.error_message) {
              if (resetSelectedRows) {
                that.setState({
                  selectedRows: [],
                });
              }
              that.fetchUsers({
                page: 1,
              });
            }
          },
        });
      },
      onCancel() {},
    });
  };

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
      userData: null,
      resetPassword: false,
    });
  };

  handleUpdateModalVisible = (flag, record) => {
    this.setState({
      modalVisible: !!flag,
      userData: record,
    });
  };

  handleResetPasswordModalVisible = (flag, record) => {
    this.setState({
      modalVisible: !!flag,
      userData: record,
      resetPassword: true,
    });
  };

  handleUserFormSubmit = fields => {
    const { dispatch } = this.props;
    this.setState({
      confirmLoading: true,
    });
    const that = this;
    dispatch({
      type: 'adminUser/submitAdminUser',
      payload: fields,
      callback: response => {
        that.setState({
          confirmLoading: false,
        });
        if (response && !response.error_message) {
          that.handleModalVisible();
          that.fetchUsers();
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
          <Col md={8} sm={24}>
            <FormItem label="关键词">
              {getFieldDecorator('keywords', {
                initialValue: formValues.keywords,
              })(<AutoComplete dataSource={[]} placeholder="用户名/名称" />)}
            </FormItem>
          </Col>
          <Animate transitionName="fade">
            {expandForm && (
              <Col md={8} sm={24}>
                <FormItem label="创建日期">
                  {getFieldDecorator('dateBetween', {
                    // initialValue: [
                    //   formValues.dateStart,
                    //   formValues.dateEnd,
                    // ],
                  })(<RangePicker format={dateFormat} />)}
                </FormItem>
              </Col>
            )}
          </Animate>
          <Col md={8} sm={24}>
            <Row type="flex" justify="end">
              <Col>
                <span className={TableListStyles.submitButtons}>
                  <Button type="primary" htmlType="submit">
                    查询
                  </Button>
                  <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                    重置
                  </Button>
                  <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
                    {/* {expandForm ? "收起" : "展开"} */}
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
    const {
      adminUser: { users, groupOptions },
      loading,
    } = this.props;
    const { selectedRows, modalVisible, confirmLoading, resetPassword, userData } = this.state;
    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="delete">删除</Menu.Item>
      </Menu>
    );
    const columns = [
      {
        title: '用户名',
        dataIndex: 'username',
      },
      {
        title: '名称',
        dataIndex: 'name',
      },
      {
        title: '管理组',
        dataIndex: 'groups',
        filters: groupOptions,
        render(groups) {
          const groupsLabel = groups.map(group => (
            <Tag key={group.id} color="blue">
              {group.name}
            </Tag>
          ));
          return groupsLabel;
        },
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
            {!record.disabled && (
              <a onClick={() => this.handleUpdateModalVisible(true, record)}>编辑</a>
            )}
            {!record.disabled && <Divider type="vertical" />}
            {!record.disabled && (
              <a onClick={() => this.handleResetPasswordModalVisible(true, record)}>重置密码</a>
            )}
            {!record.disabled && <Divider type="vertical" />}
            {!record.disabled && <a onClick={() => this.deleteUsers([record])}>删除</a>}
          </Fragment>
        ),
      },
    ];

    const parentMethods = {
      handleUserFormSubmit: this.handleUserFormSubmit,
      handleModalVisible: this.handleModalVisible,
    };
    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={TableListStyles.tableList}>
            <div className={TableListStyles.tableListForm}>{this.renderForm()}</div>
            <div className={TableListStyles.tableListOperator}>
              <Button icon="user-add" type="primary" onClick={() => this.handleModalVisible(true)}>
                新增
              </Button>
              {selectedRows.length > 0 && (
                <span>
                  <Dropdown overlay={menu}>
                    <Button>
                      批量操作 <Icon type="down" />
                    </Button>
                  </Dropdown>
                </span>
              )}
            </div>
            <StandardTable
              rowKey="id"
              selectedRows={selectedRows}
              loading={loading}
              data={users}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        <UserForm
          {...parentMethods}
          confirmLoading={confirmLoading}
          modalVisible={modalVisible}
          resetPassword={resetPassword}
          userData={userData}
          groupOptions={groupOptions}
        />
      </PageHeaderWrapper>
    );
  }
}

export default Users;
