import React, { Component } from 'react';
import { connect } from 'dva';
import { Skeleton, Card, Row, Col, Avatar } from 'antd';

@connect(({ user, loading }) => ({
  currentUser: user.currentUser,
  loading: loading.models.user,
}))
class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  componentWillUnmount() {}

  render() {
    const { currentUser, loading } = this.props;
    return (
      <Card title="基本信息">
        <Skeleton avatar paragraph={{ rows: 1 }} loading={loading}>
          <Row>
            <Col span={2}>
              <Avatar size="large" src={currentUser.avatar} icon="user" alt={currentUser.username}>
                {currentUser.name}
              </Avatar>
            </Col>
            <Col span={22}>{currentUser.username}</Col>
            <Col span={22}>{currentUser.name}</Col>
          </Row>
        </Skeleton>
      </Card>
    );
  }
}

export default Index;
