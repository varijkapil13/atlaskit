'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _index = require('../es5/index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var VidPlayIcon = function VidPlayIcon(props) {
  return _react2.default.createElement(_index2.default, _extends({ dangerouslySetGlyph: '<svg width="24" height="24" viewBox="0 0 24 24" focusable="false" role="presentation"><path d="M8.595 19.522C7.162 20.364 6 19.702 6 18.04V5.963C6 4.3 7.158 3.635 8.595 4.479l11.083 6.51c.951.559.958 1.46 0 2.023l-11.083 6.51z" fill="currentColor" fill-rule="evenodd"/></svg>' }, props));
};
VidPlayIcon.displayName = 'VidPlayIcon';
exports.default = VidPlayIcon;