import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Tabs, Form, Switch, Row, Col, Modal, Tag } from 'antd';

const { TabPane } = Tabs;
const { confirm } = Modal;
const FormItem = Form.Item;

const GroupForm = Form.create()(props => {
  const {
    loading,
    group,
    groupIndex,
    permissionOptions,
    onToggle,
    switchLoading,
    switchOnDisabled,
    switchOffDisabled,
    // switchChecked,
  } = props;

  return (
    <Form layout="inline">
      <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
        <Col md={8} lg={24} xl={48}>
          {permissionOptions.map(permission => {
            const switchChecked = group.permissions.indexOf(permission.value) !== -1;
            const switchDisabled =
              loading ||
              (switchChecked && switchOffDisabled) ||
              (!switchChecked && switchOnDisabled);
            return (
              <FormItem key={permission.value}>
                <Switch
                  checkedChildren={permission.text}
                  unCheckedChildren={permission.text}
                  // defaultChecked={group.permissions.indexOf(permission.value) !== -1}
                  checked={switchChecked}
                  disabled={switchDisabled}
                  loading={switchLoading[`${group.id}_${permission.value}`]}
                  onChange={(checked, event) =>
                    onToggle(
                      {
                        permission,
                        group,
                        groupIndex,
                      },
                      checked,
                      event
                    )
                  }
                />
              </FormItem>
            );
          })}
        </Col>
      </Row>
    </Form>
  );
});

@connect(({ user, adminGroup, loading }) => ({
  currentUser: user.currentUser,
  adminGroup,
  loading: loading.models.adminGroup,
}))
class Groups extends Component {
  constructor(props) {
    super(props);
    this.state = {
      switchLoading: {},
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'adminGroup/fetch',
      payload: {},
    });
  }

  componentWillUnmount() {}

  onToggle = (data, checked) => {
    const {
      dispatch,
      adminGroup: { groups },
    } = this.props;
    const { permission, group, groupIndex } = data;

    this.switchLoadingChange(group, permission);
    const confirmContent = (
      <Row>
        <Col>
          <b color="green">{group.text}</b>
          &nbsp;<Tag color={checked ? 'green' : 'red'}>{checked ? '授权' : '删除授权'}</Tag>
          <b color="blue">{permission.text}</b>
          吗？
        </Col>
      </Row>
    );
    const that = this;
    confirm({
      mask: false,
      icon: checked ? 'question-circle' : 'warning',
      title: checked ? '提示' : '警告',
      content: confirmContent,
      okText: checked ? '确定授权' : '⚠️删除授权',
      cancelText: '再想想',
      onOk() {
        dispatch({
          type: 'adminGroup/permission',
          payload: {
            group,
            permission,
            checked,
          },
          callback: response => {
            that.switchLoadingChange(group, permission, false);
            console.log(response, response.error_message, response.data);
            if (response && !response.error_message && response.data) {
              groups[groupIndex] = response.data;
              // TODO 更新对应group 打开生效 关闭未生效
              dispatch({
                type: 'adminGroup/save',
                payload: {
                  groups,
                },
              });
            }
          },
        });
      },
      onCancel() {
        that.switchLoadingChange(group, permission, false);
      },
    });
  };

  switchLoadingChange(group, permission, loading = true) {
    const switchLoading = {};
    switchLoading[`${group.id}_${permission.value}`] = loading;
    this.setState({
      switchLoading,
    });
  }

  render() {
    const {
      loading,
      adminGroup: { groups, permissionOptions },
      currentUser,
    } = this.props;
    const { switchLoading } = this.state;
    const switchOnDisabled =
      !currentUser ||
      !currentUser.permissions ||
      !currentUser.permissions.post_permission_of_admin_group;
    const switchOffDisabled =
      !currentUser ||
      !currentUser.permissions ||
      !currentUser.permissions.delete_permission_of_admin_group;
    return (
      <Card title="管理组权限分配">
        <Tabs tabPosition="top" style={{ height: 300 }}>
          {groups.map((group, groupIndex) => {
            return (
              <TabPane tab={group.text} key={group.id}>
                {group.isSuperAdmin ? (
                  '超级管理员拥有全部权限'
                ) : (
                  <GroupForm
                    loading={loading}
                    group={group}
                    groupIndex={groupIndex}
                    permissionOptions={permissionOptions}
                    onToggle={this.onToggle}
                    switchLoading={switchLoading}
                    switchOnDisabled={switchOnDisabled}
                    switchOffDisabled={switchOffDisabled}
                  />
                )}
              </TabPane>
            );
          })}
        </Tabs>
      </Card>
    );
  }
}

export default Groups;
