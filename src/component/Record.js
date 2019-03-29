/**
 * @author zhoukaiheng
 * @description
 *
 * @date 2019/3/29 13:50
 */
import React from 'react';
import { Input } from 'antd';

class Record extends React.PureComponent {
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
            name: value.name || "",
            currency: value.currency || "",
        };
    }

    handleNameChange = (e) => {
        const name = e.target.value;
        if (!('value' in this.props)) {
            this.setState({ name });
        }
        this.triggerChange({ name });
    };

    handleCurrencyChange = (e) => {
        let currency = parseFloat(e.target.value);

        if (!('value' in this.props)) {
            this.setState({ currency });
        }
        this.triggerChange({ currency });
    };

    triggerChange = (changedValue) => {
        const onChange = this.props.onChange;
        if (onChange) {
            onChange(Object.assign({}, this.state, changedValue));
        }
    };

    render() {
        const { name, currency } = this.state;
        return (
            <React.Fragment>
                <Input placeholder="点外卖人员姓名" value={name} style={{ width: '10%', marginRight: 8 }} onChange={this.handleNameChange}/>
                <Input placeholder="价格" value={currency} style={{ width: '10%', marginRight: 8 }} onChange={this.handleCurrencyChange}/>
            </React.Fragment>
        )
    }
}

export default Record;