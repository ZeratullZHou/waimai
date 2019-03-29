/**
 * @author zhoukaiheng
 * @description
 *
 * @date 2019/3/29 11:42
 */

const { override, fixBabelImports } = require('customize-cra');

module.exports = override(
    fixBabelImports('import', {
        libraryName: 'antd',
    libraryDirectory: 'es',
    style: 'css',
    }),
);