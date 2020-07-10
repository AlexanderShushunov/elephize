import * as ts from 'typescript';
import { Declaration } from '../types';
import { Context } from '../components/context';
import { renderNode } from '../components/codegen/renderNodes';

export const tSpreadAssignment = (node: ts.SpreadAssignment, context: Context<Declaration>) => renderNode(node.expression, context);
