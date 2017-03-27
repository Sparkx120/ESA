'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _radium = require('radium');

var _radium2 = _interopRequireDefault(_radium);

var _velocityReact = require('velocity-react');

var Loading = function Loading(props) {
    return _react2['default'].createElement(
        'div',
        { style: props.style },
        'loading...'
    );
};

Loading.propTypes = {
    style: _react2['default'].PropTypes.object
};

var Toggle = function Toggle(props) {
    var style = props.style;
    var height = style.height;
    var width = style.width;
    var midHeight = height * 0.5;
    var points = '0,0 0,' + height + ' ' + width + ',' + midHeight;
    return _react2['default'].createElement(
        'div',
        { style: style.base },
        _react2['default'].createElement(
            'div',
            { style: style.wrapper },
            _react2['default'].createElement(
                'svg',
                { height: height, width: width },
                _react2['default'].createElement('polygon', {
                    points: points,
                    style: style.arrow
                })
            )
        )
    );
};

Toggle.propTypes = {
    style: _react2['default'].PropTypes.object
};

var Header = function Header(props) {
    var style = props.style;
    return _react2['default'].createElement(
        'div',
        { style: style.base },
        _react2['default'].createElement(
            'div',
            { style: style.title },
            props.node.name
            // props.node.path
        )
    );
};

Header.propTypes = {
    style: _react2['default'].PropTypes.object,
    node: _react2['default'].PropTypes.object.isRequired
};

var Container = (function (_React$Component) {
    _inherits(Container, _React$Component);

    function Container(props) {
        _classCallCheck(this, _Container);

        _get(Object.getPrototypeOf(_Container.prototype), 'constructor', this).call(this, props);
    }

    _createClass(Container, [{
        key: 'render',
        value: function render() {
            var _props = this.props;
            var style = _props.style;
            var decorators = _props.decorators;
            var terminal = _props.terminal;
            var onClick = _props.onClick;
            var node = _props.node;

            return _react2['default'].createElement(
                'div',
                {
                    ref: 'clickable',
                    onClick: onClick,
                    style: style.container },
                !terminal ? this.renderToggle() : null,
                _react2['default'].createElement(decorators.Header, {
                    node: node,
                    style: style.header
                })
            );
        }
    }, {
        key: 'renderToggle',
        value: function renderToggle() {
            var animations = this.props.animations;
            if (!animations) {
                return this.renderToggleDecorator();
            }
            return _react2['default'].createElement(
                _velocityReact.VelocityComponent,
                { ref: 'velocity',
                    duration: animations.toggle.duration,
                    animation: animations.toggle.animation },
                this.renderToggleDecorator()
            );
        }
    }, {
        key: 'renderToggleDecorator',
        value: function renderToggleDecorator() {
            var _props2 = this.props;
            var style = _props2.style;
            var decorators = _props2.decorators;

            return _react2['default'].createElement(decorators.Toggle, { style: style.toggle });
        }
    }]);

    var _Container = Container;
    Container = (0, _radium2['default'])(Container) || Container;
    return Container;
})(_react2['default'].Component);

Container.propTypes = {
    style: _react2['default'].PropTypes.object.isRequired,
    decorators: _react2['default'].PropTypes.object.isRequired,
    terminal: _react2['default'].PropTypes.bool.isRequired,
    onClick: _react2['default'].PropTypes.func.isRequired,
    animations: _react2['default'].PropTypes.oneOfType([_react2['default'].PropTypes.object, _react2['default'].PropTypes.bool]).isRequired,
    node: _react2['default'].PropTypes.object.isRequired
};

exports['default'] = {
    Loading: Loading,
    Toggle: Toggle,
    Header: Header,
    Container: Container
};
module.exports = exports['default'];