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

const GroupForm = Form.create()(props => {
  const {
    modalVisible,
    confirmLoading,
    form,
    handleGroupFormSubmit,
    handleModalVisible,
    groupData,
  } = props;
  const isAdd = !groupData || !groupData.id;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // form.resetFields();
      handleGroupFormSubmit(fieldsValue);
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
  let modalTitle = '新增管理组';
  if (!isAdd) {
    modalTitle = '编辑管理组';
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
            initialValue: groupData ? groupData.id : null,
          })(<Input type="hidden" />)}
        </FormItem>
      )}
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="标识">
        {form.getFieldDecorator('slug', {
          rules: [{ required: true, message: '标识不能为空' }],
          initialValue: groupData ? groupData.slug : '',
        })(<Input onKeyDown={onKeyDown} placeholder="请输入唯一标识" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="名称">
        {form.getFieldDecorator('name', {
          rules: [{ required: true, message: '名称不能为空' }],
          initialValue: groupData ? groupData.name : '',
        })(<Input onKeyDown={onKeyDown} placeholder="请输入名称" />)}
      </FormItem>
    </Modal>
  );
});

@Form.create()
@connect(({ adminGroup, loading }) => ({
  adminGroup,
  loading: loading.models.adminGroup,
}))
class Groups extends PureComponent {
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
      //
    },
    sorter: '',
    pagination: {
      page: 1,
    },
    selectedRows: [],
    modalVisible: false,
    confirmLoading: false,
    groupData: null,
  };

  componentDidMount() {
    this.fetchGroups();
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
        this.fetchGroups();
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
            this.fetchGroups({
              page: 1,
            });
          }
        );
      }
    });
  };

  fetchGroups = (options = {}) => {
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
      type: 'adminGroup/fetch',
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
        this.fetchGroups();
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
        this.deleteGroups(selectedRows, true);
        break;
      default:
        break;
    }
  };

  deleteGroups = (groups, resetSelectedRows = false) => {
    const { dispatch } = this.props;
    const groupsLabel = groups.map(group => (
      <Tag key={group.id} color="orange">
        {group.name}【{group.slug}】
      </Tag>
    ));
    const confirmContent = (
      <Row>
        <Col>确定要删除管理组 {groupsLabel} 吗？</Col>
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
          type: 'adminGroup/delete',
          payload: {
            ids: groups.map(row => row.id),
          },
          callback: response => {
            if (response && !response.error_message) {
              if (resetSelectedRows) {
                that.setState({
                  selectedRows: [],
                });
              }
              that.fetchGroups({
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
      groupData: null,
    });
  };

  handleUpdateModalVisible = (flag, record) => {
    this.setState({
      modalVisible: !!flag,
      groupData: record,
    });
  };

  handleGroupFormSubmit = fields => {
    const { dispatch } = this.props;
    this.setState({
      confirmLoading: true,
    });
    const that = this;
    dispatch({
      type: 'adminGroup/submitAdminGroup',
      payload: fields,
      callback: response => {
        that.setState({
          confirmLoading: false,
        });
        if (response && !response.error_message) {
          that.handleModalVisible();
          that.fetchGroups();
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
              })(<AutoComplete dataSource={[]} placeholder="标识/名称" />)}
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
      adminGroup: { groups },
      loading,
    } = this.props;
    const { selectedRows, modalVisible, confirmLoading, groupData } = this.state;
    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="delete">删除</Menu.Item>
      </Menu>
    );
    const columns = [
      {
        title: '标识',
        dataIndex: 'slug',
      },
      {
        title: '名称',
        dataIndex: 'name',
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
            {!record.disabled && <a onClick={() => this.deleteGroups([record])}>删除</a>}
          </Fragment>
        ),
      },
    ];

    const parentMethods = {
      handleGroupFormSubmit: this.handleGroupFormSubmit,
      handleModalVisible: this.handleModalVisible,
    };
    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={TableListStyles.tableList}>
            <div className={TableListStyles.tableListForm}>{this.renderForm()}</div>
            <div className={TableListStyles.tableListOperator}>
              <Button
                icon="usergroup-add"
                type="primary"
                onClick={() => this.handleModalVisible(true)}
              >
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
              data={groups}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        <GroupForm
          {...parentMethods}
          confirmLoading={confirmLoading}
          modalVisible={modalVisible}
          groupData={groupData}
        />
      </PageHeaderWrapper>
    );
  }
}

export default Groups;
