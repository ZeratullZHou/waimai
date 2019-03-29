/**
 * @author zhoukaiheng
 * @description
 *
 * @date 2019/3/29 13:50
 */
import React from 'react';
import {Input} from 'antd';

class Total extends React.PureComponent {
    static getDerivedStateFromProps(nextProps) {
        if ('value' in nextProps) {
            return {
                ...(nextProps.value || {}),
            };
        }
        return null;
    }

    constructor(props) {
        super(props);

        const value = props.value || {};
        this.state = {
            tax: value.tax,
            off: value.off,
            total: value.total,
        };
    }

    handleTaxChange = (e) => {
        const tax = e.target.value;
        if (!('value' in this.props)) {
            this.setState({ tax });
        }
        this.triggerChange({ tax });
    };

    handleOffChange = (e) => {
        const off = e.target.value;
        if (!('value' in this.props)) {
            this.setState({ off });
        }
        this.triggerChange({ off });
    };

    handleTotalChange = (e) => {
        const total = e.target.value;
        if (!('value' in this.props)) {
            this.setState({ total });
        }
        this.triggerChange({ total });
    };

    triggerChange = (changedValue) => {
        const onChange = this.props.onChange;
        if (onChange) {
            onChange(Object.assign({}, this.state, changedValue));
        }
    };

    render() {
        const { tax, off, total } = this.state;
        return (
            <div>
                <span>配送费和包装费：</span><Input value={tax} style={{ width: '10%', marginRight: 8 }} onChange={this.handleTaxChange}/>
                <span>满减和红包：</span><Input value={off} style={{ width: '10%', marginRight: 8 }} onChange={this.handleOffChange}/>
                <span>实付总价：</span><Input value={total} style={{ width: '10%', marginRight: 8 }} onChange={this.handleTotalChange}/>
            </div>
        )
    }
}

export default Total;