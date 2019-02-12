import React, { Component } from 'react';
import { Form, Input, Button } from 'antd';
import { connect } from 'dva';
import styles from './BaseView.less';

const FormItem = Form.Item;

@connect(({ user }) => ({
  currentUser: user.currentUser,
}))
@Form.create()
class BaseView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      submitLoading: false,
    };
  }

  componentDidMount() {
    this.setBaseInfo();
  }

  setBaseInfo = () => {
    const { currentUser, form } = this.props;
    Object.keys(form.getFieldsValue()).forEach(key => {
      const obj = {};
      obj[key] = currentUser[key] || null;
      form.setFieldsValue(obj);
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    form.validateFields((err, values) => {
      if (err) {
        console.log('formValidateFields err', err);
      } else {
        // console.log('Received values of form: ', values);
        this.setState({
          submitLoading: true,
        });
        const that = this;
        dispatch({
          type: 'user/updateMe',
          payload: values,
          callback: response => {
            that.setState({
              submitLoading: false,
            });
            if (response && !response.error_message) {
              dispatch({
                type: 'user/fetchCurrent',
              });
            }
          },
        });
      }
    });
  };

  getViewDom = ref => {
    this.view = ref;
  };

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { submitLoading } = this.state;
    const onKeyDown = event => {
      // console.log(event)
      if (event.keyCode === 32) {
        event.preventDefault();
        return false;
      }
      return true;
    };
    return (
      <div className={styles.baseView} ref={this.getViewDom}>
        <div className={styles.left}>
          <Form layout="vertical" onSubmit={this.handleSubmit} hideRequiredMark>
            <FormItem label="用户名">
              {getFieldDecorator('username', {
                rules: [
                  {
                    required: true,
                    message: '请输入用户名（登录账户）',
                  },
                ],
              })(<Input onKeyDown={onKeyDown} />)}
            </FormItem>
            <FormItem label="名称">
              {getFieldDecorator('name', {
                rules: [
                  {
                    required: true,
                    message: '请输入名称',
                  },
                ],
              })(<Input onKeyDown={onKeyDown} />)}
            </FormItem>
            <Button type="primary" htmlType="submit" loading={submitLoading}>
              更新
            </Button>
          </Form>
        </div>
        <div className={styles.right}>{/*  */}</div>
      </div>
    );
  }
}

export default BaseView;
