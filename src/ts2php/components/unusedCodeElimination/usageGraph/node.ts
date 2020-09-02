import { Scope } from './scope';
import { log, LogSeverity, LogVerbosity, shortCtx } from '../../../utils/log';

export const isBound = <T>(node: ScopeNode<T>): node is BoundNode<T> => node._type === 'early_bound';
export const isPending = <T>(node: ScopeNode<T>): node is BindPendingNode<T> => node._type === 'late_bound';

export class ScopeNode<T extends { [key: string]: any }> {
  public readonly _type: 'abstract' | 'early_bound' | 'late_bound' = 'abstract';
  /**
   * Edges list: contains nodes connected to current node. Directed.
   */
  protected _edges: Set<ScopeNode<T>> = new Set();
  /**
   * Custom data for current node. May contain some user-defined flags or be empty.
   */
  public readonly data: T;
  /**
   * Variable or func name, unique in its scope.
   */
  public readonly ident: string;
  /**
   * Functional scope this var belongs to.
   */
  public readonly homeScope: Scope<T>;
  /**
   * Traverse mark: common flag, used in DFS
   */
  protected _traverseMark = false;

  public constructor(ident: string, homeScope: Scope<T>, data: T) {
    this.ident = ident;
    this.homeScope = homeScope;
    this.data = { ...data };
  }

  public spawnScope(sourceFile: string, dryRun: boolean): Scope<T> {
    throw new Error((dryRun ? '[dry]' : '') +'Can\'t spawn new scope on unbound node!');
  }

  /**
   *
   * @param node
   * @private
   */
  protected _genCharString(node: ScopeNode<T>) {
    return `${node.ident}[${node._type === 'early_bound' ? 'B' : 'b'}${node.used ? 'U' : 'u'}]`;
  }

  /**
   * Small letters indicate false boolean flag, capitals indicate true
   * B: bound
   * U: used
   */
  public toString(): string {
    return this._genCharString(this) +
      `\n\t-> [ ${Array.from(this._edges).map((n) => this._genCharString(n)).join(', ')} ]`;
  }

  /**
   * Add dependency: current node depends on given node (uses it somehow).
   * @param node
   */
  public addEdgeTo(node: ScopeNode<T>) {
    if (isBound(node) && node._ownedScope) {
      this._edges.add(node._ownedScope.localTerminalNode); // for proper handling of return instructions
    }
    if (isPending(node)) {
      node.revdep(this);
    }
    this._edges.add(node);
  }

  /**
   * Remove dependency of this node on some another node
   * @param node
   */
  public removeEdgeTo(node: ScopeNode<T>) {
    if (isBound(node) && node._ownedScope) {
      this._edges.delete(node._ownedScope.localTerminalNode); // for proper handling of return instructions
    }
    this._edges.delete(node);
  }

  /**
   * Simple DFS with marks
   * @param cb
   * @param traversedNodeList
   * @param bailOnUnbound
   * @private
   */
  protected _traverse(cb: (node: ScopeNode<T>) => boolean, traversedNodeList: Set<ScopeNode<T>>, bailOnUnbound: boolean) {
    this._edges.forEach((node) => {
      if (bailOnUnbound && !isBound(node)) {
        log(`Identifier "${node.ident}" was used but was never declared. This is compile error`, LogSeverity.ERROR, shortCtx(this.homeScope.sourceFile));
        return;
      }
      if (node._traverseMark) {
        return;
      }
      node._traverseMark = true;
      traversedNodeList.add(node);
      if (cb(node)) {
        node._traverse(cb, traversedNodeList, bailOnUnbound);
      }
    });
  }

  /**
   * Traverse usage graph with DFS and then reset traverse
   * marks to ensure proper work of following traversals.
   * @param cb
   * @param bail
   */
  public traverse(cb: (node: BoundNode<T>) => boolean, bail = true) {
    const nodeList: Set<ScopeNode<T>> = new Set();
    this._traverse(cb, nodeList, bail);
    nodeList.forEach((node) => node._traverseMark = false); // reset traverse marks
  }

  public _dump(printer = console.log) {
    printer(this.toString());
    return this.traverse((node) => {
      printer(node.toString());
      return true;
    }, false);
  }

  /**
   * Flag for usage mark
   * True if current identifier is used by some other identifier or by terminal node
   */
  protected _usageMark = false;
  public get used() { return this._usageMark; }
  protected _markUsed() {
    if (log.verbosity! & LogVerbosity.WITH_USAGE_GRAPH_DUMP) {
      log('Marking node as used: ' + this.ident, LogSeverity.INFO);
    }
    this._usageMark = true;
  }
  public reset() {
    if (log.verbosity! & LogVerbosity.WITH_USAGE_GRAPH_DUMP) {
      log('Resetting node usage: ' + this.ident, LogSeverity.INFO);
    }
    this._usageMark = false;
  }

  /**
   * Call this method on terminal node to travers and mark all used identifiers in all scopes.
   * Use homeScope.reset() to uncheck usage marks
   */
  public markUsage() {
    if (this.ident !== Scope.tNode) {
      log('Mark usage method is not expected to be applied to non-terminal nodes', LogSeverity.ERROR, shortCtx(this.homeScope.sourceFile));
      return;
    }

    if (isBound(this)) {
      this._markUsed();
    } else {
      log(`Undeclared or dropped identifier encountered: ${this.ident}`, LogSeverity.ERROR, shortCtx(this.homeScope.sourceFile));
    }

    this.traverse((node: ScopeNode<T>) => {
      if (isBound(node)) {
        node._markUsed();
      } else {
        log(`Undeclared or dropped identifier encountered: ${node.ident}`, LogSeverity.ERROR, shortCtx(this.homeScope.sourceFile));
      }
      return true;
    });
  }
}

export class BoundNode<T extends { [key: string]: any }> extends ScopeNode<T> {
  public readonly _type = 'early_bound';

  public constructor(ident: string, homeScope: Scope<T>, data: T, traceTargetNodes: Array<ScopeNode<T>> = []) {
    super(ident, homeScope, data);
    traceTargetNodes.forEach((node) => this.addEdgeTo(node));
  }

  /**
   * Scope created with this var.
   * Applicable only to bound functional identifiers.
   */
  public _ownedScope?: Scope<T>;
  /**
   * Get scope created by this identifier
   */
  public get ownedScope() {
    return this._ownedScope;
  }

  /**
   * Create scope for this identifier.
   * Equivalent to adding new stack frame to the call stack.
   */
  public spawnScope(sourceFile: string, dryRun: boolean) {
    if (dryRun) {
      this._ownedScope = this.homeScope._addChildScope(sourceFile, this);
    } // else: owned scope is expected to already exist

    if (!this._ownedScope) {
      throw new Error('Failed to get owned scope!');
    }
    return this._ownedScope;
  }
}

// Late-bound graph node
export class BindPendingNode<T extends { [key: string]: any }> extends ScopeNode<T> {
  public readonly _type = 'late_bound';
  protected _tmpTraceTargetNodes: Set<ScopeNode<T>> = new Set();

  public revdep(node: ScopeNode<T>) {
    this._tmpTraceTargetNodes.add(node);
  }

  public makeBoundNode(traceTargetNodes: Array<ScopeNode<T>>, withHomeScope: Scope<T>): BoundNode<T> {
    return new BoundNode<T>(
      this.ident,
      withHomeScope,
      this.data,
      Array.from(this._edges).concat(traceTargetNodes)
    );
  }

  public replaceWith(node: BoundNode<T>) {
    this._tmpTraceTargetNodes.forEach((n) => {
      n.removeEdgeTo(this);
      n.addEdgeTo(node);
    });
  }
}