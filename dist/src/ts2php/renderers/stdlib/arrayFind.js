"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var renderSupportedNodes_1 = require("../../utils/renderSupportedNodes");
var log_1 = require("../../utils/log");
var _propName_1 = require("./_propName");
var _assert_1 = require("./_assert");
var ast_1 = require("../../utils/ast");
/**
 * Array.prototype.find support
 *
 * @param node
 * @param self
 * @param context
 */
exports.arrayFind = function (node, self, context) {
    if (!_propName_1.propNameIs('find', node)) {
        return undefined;
    }
    if (!_assert_1.assertArrayType(node.expression, context.checker)) {
        log_1.log('Left-hand expression must have array-like or iterable inferred type', log_1.LogSeverity.ERROR, log_1.ctx(node));
        return 'null';
    }
    self.flags.name = 'array_find';
    var funcNode = ast_1.getCallExpressionCallbackArg(self);
    var varNode = ast_1.getCallExpressionLeftSide(self);
    var renderedFunc = renderSupportedNodes_1.renderSupportedNodes([funcNode], context).join('');
    var varName = renderSupportedNodes_1.renderSupportedNodes([varNode], context).join('');
    if (!self.flags.childCount) {
        log_1.log('Array.prototype.find: can\'t find iterable element in call.', log_1.LogSeverity.ERROR, log_1.ctx(node));
        return 'null';
    }
    return "Stdlib::arrayFind(" + varName + ", " + renderedFunc + ")";
};
