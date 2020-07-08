"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var renderSupportedNodes_1 = require("../../utils/renderSupportedNodes");
var log_1 = require("../../utils/log");
var _propName_1 = require("./_propName");
var _assert_1 = require("./_assert");
var ast_1 = require("../../utils/ast");
/**
 * String.prototype.includes support
 * Array.prototype.includes support
 *
 * @param node
 * @param self
 * @param context
 */
exports.arrayStringIncludes = function (node, self, context) {
    if (!_propName_1.propNameIs('includes', node)) {
        return undefined;
    }
    var nd = node.expression.expression;
    var type = context.checker.getTypeAtLocation(nd);
    var argsNodes = ast_1.getChildByType(self, ts.SyntaxKind.SyntaxList);
    var varNameNode = ast_1.getCallExpressionLeftSide(self);
    if (type.isStringLiteral() || context.checker.typeToString(type, nd, ts.TypeFormatFlags.None) === 'string') {
        var args = renderSupportedNodes_1.renderSupportedNodes((argsNodes === null || argsNodes === void 0 ? void 0 : argsNodes.children) || [], context);
        var varName = renderSupportedNodes_1.renderSupportedNodes([varNameNode], context);
        if (!args || !args[0]) {
            log_1.log('String.prototype.includes: can\'t find searchable element in call.', log_1.LogSeverity.ERROR, log_1.ctx(node));
            return 'null';
        }
        if (args[1]) {
            return "strpos(" + varName + ", " + args[0] + ", " + args[1] + ") !== -1";
        }
        else {
            return "strpos(" + varName + ", " + args[0] + ") !== -1";
        }
    }
    else {
        if (!_assert_1.assertArrayType(node.expression, context.checker)) {
            log_1.log('Left-hand expression must have string, array-like or iterable inferred type', log_1.LogSeverity.ERROR, log_1.ctx(node));
            return 'null';
        }
        var args = renderSupportedNodes_1.renderSupportedNodes((argsNodes === null || argsNodes === void 0 ? void 0 : argsNodes.children) || [], context);
        var varName = renderSupportedNodes_1.renderSupportedNodes([varNameNode], context);
        if (!args || !args[0]) {
            log_1.log('Array.prototype.includes: can\'t find searchable element in call.', log_1.LogSeverity.ERROR, log_1.ctx(node));
            return 'null';
        }
        if (args[1]) {
            return "in_array(" + args[0] + ", array_slice(" + varName + ", " + args[1] + "), true)";
        }
        else {
            return "in_array(" + args[0] + ", " + varName + ", true)";
        }
    }
};
