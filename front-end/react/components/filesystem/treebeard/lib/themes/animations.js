'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports['default'] = {
    toggle: function toggle(props) {
        return {
            animation: { rotateZ: props.node.toggled ? 90 : 0 },
            duration: 300
        };
    },
    drawer: function drawer() /* props */{
        return {
            enter: {
                animation: 'slideDown',
                duration: 300
            },
            leave: {
                animation: 'slideUp',
                duration: 300
            }
        };
    }
};
module.exports = exports['default'];