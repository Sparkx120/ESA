'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _extends = require('babel-runtime/helpers/extends')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _velocityReact = require('velocity-react');

var _header = require('./header');

var _header2 = _interopRequireDefault(_header);

var TreeNode = (function (_React$Component) {
    _inherits(TreeNode, _React$Component);

    function TreeNode(props) {
        _classCallCheck(this, TreeNode);

        _get(Object.getPrototypeOf(TreeNode.prototype), 'constructor', this).call(this, props);
        this.onClick = this.onClick.bind(this);
    }

    _createClass(TreeNode, [{
        key: 'onClick',
        value: function onClick() {
            var toggled = !this.props.node.toggled;
            var onToggle = this.props.onToggle;
            if (onToggle) {
                onToggle(this.props.node, toggled);
            }
        }
    }, {
        key: 'animations',
        value: function animations() {
            var props = this.props;
            if (props.animations === false) {
                return false;
            }
            var anim = _Object$assign({}, props.animations, props.node.animations);
            return {
                toggle: anim.toggle(this.props),
                drawer: anim.drawer(this.props)
            };
        }
    }, {
        key: 'decorators',
        value: function decorators() {
            // Merge Any Node Based Decorators Into The Pack
            var props = this.props;
            var nodeDecorators = props.node.decorators || {};
            return _Object$assign({}, props.decorators, nodeDecorators);
        }
    }, {
        key: 'render',
        value: function render() {
            var decorators = this.decorators();
            var animations = this.animations();
            return _react2['default'].createElement(
                'li',
                { style: this.props.style.base, ref: 'topLevel' },
                this.renderHeader(decorators, animations),
                this.renderDrawer(decorators, animations)
            );
        }
    }, {
        key: 'renderDrawer',
        value: function renderDrawer(decorators, animations) {
            var toggled = this.props.node.toggled;
            if (!animations && !toggled) {
                return null;
            }
            if (!animations && toggled) {
                return this.renderChildren(decorators, animations);
            }
            return _react2['default'].createElement(
                _velocityReact.VelocityTransitionGroup,
                _extends({}, animations.drawer, { ref: 'velocity' }),
                toggled ? this.renderChildren(decorators, animations) : null
            );
        }
    }, {
        key: 'renderHeader',
        value: function renderHeader(decorators, animations) {
            return _react2['default'].createElement(_header2['default'], {
                decorators: decorators,
                animations: animations,
                style: this.props.style,
                node: _Object$assign({}, this.props.node),
                onClick: this.onClick
            });
        }
    }, {
        key: 'renderChildren',
        value: function renderChildren(decorators) {
            var _this = this;

            if (this.props.node.loading) {
                return this.renderLoading(decorators);
            }
            var children = this.props.node.children;
            if (!Array.isArray(children)) {
                children = children ? [children] : [];
            }
            return _react2['default'].createElement(
                'ul',
                { style: this.props.style.subtree, ref: 'subtree' },
                children.map(function (child, index) {
                    return _react2['default'].createElement(TreeNode, _extends({}, _this._eventBubbles(), {
                        key: child.id || index,
                        node: child,
                        decorators: _this.props.decorators,
                        animations: _this.props.animations,
                        style: _this.props.style
                    }));
                })
            );
        }
    }, {
        key: 'renderLoading',
        value: function renderLoading(decorators) {
            return _react2['default'].createElement(
                'ul',
                { style: this.props.style.subtree },
                _react2['default'].createElement(
                    'li',
                    null,
                    _react2['default'].createElement(decorators.Loading, { style: this.props.style.loading })
                )
            );
        }
    }, {
        key: '_eventBubbles',
        value: function _eventBubbles() {
            return { onToggle: this.props.onToggle };
        }
    }]);

    return TreeNode;
})(_react2['default'].Component);

TreeNode.propTypes = {
    style: _react2['default'].PropTypes.object.isRequired,
    node: _react2['default'].PropTypes.object.isRequired,
    decorators: _react2['default'].PropTypes.object.isRequired,
    animations: _react2['default'].PropTypes.oneOfType([_react2['default'].PropTypes.object, _react2['default'].PropTypes.bool]).isRequired,
    onToggle: _react2['default'].PropTypes.func
};

exports['default'] = TreeNode;
module.exports = exports['default'];