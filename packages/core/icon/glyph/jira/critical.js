'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _index = require('../../es5/index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var JiraCriticalIcon = function JiraCriticalIcon(props) {
  return _react2.default.createElement(_index2.default, _extends({ dangerouslySetGlyph: '<svg width="24" height="24" viewBox="0 0 24 24" focusable="false" role="presentation"><g fill="currentColor" fill-rule="evenodd"><path d="M11.221 5.322L8.292 8.277a1.009 1.009 0 0 0 0 1.419.986.986 0 0 0 1.405 0l2.298-2.317 2.307 2.327a.989.989 0 0 0 1.407 0 1.01 1.01 0 0 0 0-1.419l-2.94-2.965A1.106 1.106 0 0 0 11.991 5c-.279 0-.557.107-.77.322z"/><rect x="11" y="7" width="2" height="8" rx="1"/><circle cx="12" cy="18" r="1"/></g></svg>' }, props));
};
JiraCriticalIcon.displayName = 'JiraCriticalIcon';
exports.default = JiraCriticalIcon;