/**
 * @author zhoukaiheng
 * @description
 *
 * @date 2019/3/29 11:46
 */
import React from 'react';
import { Button } from 'antd'

import './index.css';

class LayoutComponent extends React.Component {
    DestroyMap = () => {
        window.mapCtrl.HideWindow();
    };

    render() {
        console.log(window.mapCtrl);
        return (
            <div className="testBox">
                <Button style={{ backgroundColor: '#eee' }} htmlType="button" onClick={this.DestroyMap}>返回</Button>
            </div>
        )
    }
}

export default LayoutComponent;