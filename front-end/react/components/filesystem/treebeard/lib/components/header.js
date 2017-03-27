'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _shallowequal = require('shallowequal');

var _shallowequal2 = _interopRequireDefault(_shallowequal);

var _deepEqual = require('deep-equal');

var _deepEqual2 = _interopRequireDefault(_deepEqual);

var NodeHeader = (function (_React$Component) {
    _inherits(NodeHeader, _React$Component);

    function NodeHeader(props) {
        _classCallCheck(this, NodeHeader);

        _get(Object.getPrototypeOf(NodeHeader.prototype), 'constructor', this).call(this, props);
    }

    _createClass(NodeHeader, [{
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps) {
            var props = this.props;
            var nextPropKeys = _Object$keys(nextProps);
            for (var i = 0; i < nextPropKeys.length; i++) {
                var key = nextPropKeys[i];
                if (key === 'animations') {
                    continue;
                }
                var isEqual = (0, _shallowequal2['default'])(props[key], nextProps[key]);
                if (!isEqual) {
                    return true;
                }
            }
            return !(0, _deepEqual2['default'])(props.animations, nextProps.animations, { strict: true });
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var style = _props.style;
            var decorators = _props.decorators;

            var terminal = !this.props.node.children;
            var active = this.props.node.active;
            var container = [style.link, active ? style.activeLink : null];
            var headerStyles = _Object$assign({ container: container }, this.props.style);
            return _react2['default'].createElement(decorators.Container, {
                style: headerStyles,
                decorators: decorators,
                terminal: terminal,
                onClick: this.props.onClick,
                animations: this.props.animations,
                node: this.props.node
            });
        }
    }]);

    return NodeHeader;
})(_react2['default'].Component);

NodeHeader.propTypes = {
    style: _react2['default'].PropTypes.object.isRequired,
    decorators: _react2['default'].PropTypes.object.isRequired,
    animations: _react2['default'].PropTypes.oneOfType([_react2['default'].PropTypes.object, _react2['default'].PropTypes.bool]).isRequired,
    node: _react2['default'].PropTypes.object.isRequired,
    onClick: _react2['default'].PropTypes.func
};

exports['default'] = NodeHeader;
module.exports = exports['default'];