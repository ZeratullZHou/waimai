/**
 * @author zhoukaiheng
 * @description
 *
 * @date 2019/3/29 11:46
 */
import React from 'react';
import {Button, Col, Form, Icon, List, Row} from 'antd';

import Record from './Record';
import Total from './Total';

function calculateMoney(currency, all, length) {
    const current = parseFloat(currency);
    const tax = parseFloat(all.tax);
    const off = parseFloat(all.off);
    const total = parseFloat(all.total);
    const newTotal = total - tax + off;
    const value = length === 1 ? total : current - current / newTotal * off + tax / length;
    return value.toFixed(2);
}

function clearEmptyElement(arr) {
    const array = arr.slice();
    for(let i = 0 ;i<array.length;i++) {
        if(array[i] === "" || typeof(array[i]) === "undefined") {
            array.splice(i,1);
            i= i-1;
        }
    }
    return array;
}

const formItemLayout = {
    labelCol: {
        xs: {span: 24},
        sm: {span: 4},
    },
    wrapperCol: {
        xs: {span: 24},
        sm: {span: 20},
    },
};
const formItemLayoutWithOutLabel = {
    wrapperCol: {
        xs: {span: 24, offset: 0},
        sm: {span: 20, offset: 4},
    },
};

class LayoutComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            names: [],
            total: {}
        };
        this.id = 0;
    }


    add = () => {
        const {form} = this.props;
        // can use data-binding to get
        const keys = form.getFieldValue('keys');
        const nextKeys = keys.concat(this.id++);
        // can use data-binding to set
        // important! notify form to detect changes
        form.setFieldsValue({
            keys: nextKeys,
        });
    };

    remove = (k) => {
        const {form} = this.props;
        // can use data-binding to get
        const keys = form.getFieldValue('keys');
        // We need at least one passenger
        if (keys.length === 1) {
            return;
        }

        // can use data-binding to set
        form.setFieldsValue({
            keys: keys.filter(key => key !== k),
        });
    };

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                values.names = clearEmptyElement(values.names);
                this.setState({
                    ...values,
                })
            }
        });
    };

    render() {
        const {form: {getFieldDecorator, getFieldValue}} = this.props;
        const {names, total} = this.state;
        getFieldDecorator('keys', {initialValue: []});
        const keys = getFieldValue('keys');
        const formItems = keys.map((k, index) => (
            <Form.Item
                {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                label={index === 0 ? '点外卖人员' : ''}
                required={false}
                key={k}
            >
                {getFieldDecorator(`names[${k}]`, {
                    validateTrigger: ['onChange', 'onBlur'],
                    rules: [{
                        required: true,
                        message: "请输入姓名和其所点外卖的总价格.",
                    }],
                })(
                    <Record/>
                )}
                {keys.length > 1 ? (
                    <Icon
                        className="dynamic-delete-button"
                        type="minus-circle-o"
                        disabled={keys.length === 1}
                        onClick={() => this.remove(k)}
                    />
                ) : null}
            </Form.Item>
        ));
        return (
            <div>
                <Form onSubmit={this.handleSubmit}>
                    {formItems}
                    <Form.Item {...formItemLayoutWithOutLabel}>
                        <Button type="dashed" onClick={this.add} style={{width: '40%'}}>
                            <Icon type="plus"/> 添加一行
                        </Button>
                    </Form.Item>
                    <Form.Item {...formItemLayoutWithOutLabel}>
                        {getFieldDecorator("total", {
                            rules: [{
                                required: true,
                                message: "请输入相关内容.",
                            }],
                            initialValue: {
                                tax: 0,
                                off: 0,
                                total: 0
                            }
                        })(
                            <Total/>
                        )}
                    </Form.Item>
                    {
                        !!this.id &&
                        <Form.Item {...formItemLayoutWithOutLabel}>
                            <Button type="primary" htmlType="submit">提交</Button>
                        </Form.Item>
                    }
                </Form>
                <Row>
                    <Col span={4}/>
                    <Col span={20}>
                        <List
                            style={{width: "80%"}}
                            header={<div>计算结果</div>}
                            bordered
                            dataSource={names}
                            renderItem={item => {
                                return (
                                    <List.Item>
                                        <p>
                                            <span>{`姓名:${item.name} `}</span>
                                            <span>{`原价:${parseFloat(eval(item.currency).toFixed(2))} `}</span>
                                            <span>{`实付:${calculateMoney(eval(item.currency), total, names.length)}`}</span>
                                        </p>
                                    </List.Item>
                                )
                            }}
                        />
                    </Col>
                </Row>
            </div>
        )
    }
}

export default Form.create()(LayoutComponent);