"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var renderNodes_1 = require("../components/codegen/renderNodes");
exports.tJsxExpression = function (node, context) { return renderNodes_1.renderNode(node.expression, context); };
