import { BindPendingNode, BoundNode, isPending, ScopeNode } from './node';
import { log, LogSeverity, LogVerbosity, shortCtx } from '../../../utils/log';

export class Scope<NodeData extends { [key: string]: any }> {
  public static _forceDisableUnusedVarsElimination = false;
  public static readonly EV_USAGE = 'usage';
  public static readonly EV_DECL = 'declaration';
  public static readonly EV_UNBOUND_CREATED = 'unbound_created';
  public static readonly EV_BIND_UNBOUND = 'bind_unbound';
  /**
   * Identifier for terminal node. There should be no other variables or functions with this name.
   * Global terminal node is copied to every child scope by reference.
   */
  public static readonly tNode = '__#global_terminal__';
  /**
   * Identifier for terminal node. There should be no other variables or functions with this name.
   * Local terminal node is created in each scope independently and used for handling return statements.
   */
  protected _termNodeLocalName: string;
  public get tNodeLocal() {
    return this._termNodeLocalName;
  }
  /**
   * Declarations map containing all identifiers declared in current scope.
   * Identifier -> Node
   */
  public readonly declarations: Map<string, ScopeNode<NodeData>> = new Map();
  /**
   * List of child scopes spawned by functional identifiers.
   */
  public readonly childScopes: Set<Scope<NodeData>> = new Set();
  /**
   * Default custom data for declarations (aka graph nodes)
   */
  protected readonly _nodeDefaultData: NodeData;
  /**
   * Parent scope, if any. Root scope (module scope) should not have parent.
   */
  public readonly parentScope?: Scope<NodeData>;
  /**
   * Node which spawned current scope. May be undefined for root scope.
   */
  public readonly ownerNode?: ScopeNode<NodeData>;
  /**
   * Usage data of every ident. Needed to determine all vars that should be passed in closure
   */
  protected readonly identsUsed: Set<ScopeNode<NodeData>> = new Set();
  /**
   * User hooks to collect more precise usage data in upper scopes
   */
  protected listeners: Map<string, Set<(ident: string) => void>> = new Map();
  /**
   * Path to processed source file (mainly for logging and debug purposes)
   */
  public readonly sourceFile: string;

  protected constructor(sourceFile: string, nodeDefaultData: NodeData, parentScope?: Scope<NodeData>, ownerNode?: ScopeNode<NodeData>) {
    this._nodeDefaultData = nodeDefaultData;
    this.parentScope = parentScope;
    this.ownerNode = ownerNode;
    this.sourceFile = sourceFile;
  }

  /**
   * Static: create new root scope with new terminal node in it.
   * Typically, you should create new scope for every module (file) being processed.
   *
   * @param nodeDefaultData  Default custom data for declarations (aka graph nodes)
   * @param sourceFile       Path to processed source file
   * @param globalsList      Global vars that should be terminated to global scope
   */
  public static newRootScope<NodeData extends { [key: string]: any }>(nodeDefaultData: NodeData, sourceFile: string, globalsList: string[] = []): Scope<NodeData> {
    const scope = new Scope<NodeData>(sourceFile, nodeDefaultData);
    scope._termNodeLocalName = Scope.tNode; // For root scope, local and global termination nodes are the same node.
    const terminalNode = new BoundNode<NodeData>(Scope.tNode, scope, nodeDefaultData);
    scope.declarations.set(Scope.tNode, terminalNode);
    // Don't set dryRun here, because newRootScope is expected to be called only once before any runs
    globalsList.forEach((ident: string) => scope.addDeclaration(ident, [], { terminateGlobally: true, dryRun: true }));
    return scope;
  }

  public addEventListener(event: string, cb: (ident: string) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)?.add(cb);
  }

  public removeEventListener(event: string, cb: (ident: string) => void) {
    this.listeners.get(event)?.delete(cb);
  }

  protected _callListeners(event: string, ident: string) {
    const listeners = this.listeners.get(event);
    if (!listeners) {
      return;
    }

    listeners.forEach((cb) => cb(ident));
  }

  public isRoot() {
    return this.localTerminalNode === this.terminalNode;
  }

  public findByIdent(ident: string): [NodeData, Scope<NodeData>, ScopeNode<NodeData>] | null {
    const [foundNode, scope] = this._findNode(ident) || [];
    if (foundNode && scope) {
      return [foundNode.data, scope, foundNode];
    }

    return null;
  }

  public getClosure(): Map<string, NodeData> {
    const idents = new Map<string, NodeData>();
    let currentScope = this.parentScope; // Start with parent scope - because we don't need vars declared in current scope.

    while (currentScope) {
      this.identsUsed.forEach((node) => {
        if (node.homeScope !== this) {
          idents.set(node.ident, node.data);
        }
      });

      currentScope = currentScope.parentScope!;
    }

    return idents;
  }

  protected _findNode(ident: string): [ScopeNode<NodeData>, Scope<NodeData>] | null {
    let scope: Scope<NodeData> | undefined = this;
    while (scope) {
      if (scope.declarations.has(ident)) {
        return [scope.declarations.get(ident) as ScopeNode<NodeData>, scope];
      }
      scope = scope.parentScope;
    }

    return null;
  }

  /**
   * Find declaration in current scope or in any of parent scopes
   * @param ident
   * @private
   */
  protected _findOrInsertNode = (ident: string): ScopeNode<NodeData> => {
    const [foundNode] = this._findNode(ident) || [];
    if (foundNode) {
      return foundNode;
    }

    const node = new BindPendingNode(ident, this, this._nodeDefaultData);
    this.declarations.set(ident, node);
    this._callListeners(Scope.EV_UNBOUND_CREATED, ident);
    return node;
  };

  /**
   * Create new child scope and return it.
   * Should not be used by hand, use Node.spawnScope() instead.
   */
  public _addChildScope(sourceFile: string, ownerNode: ScopeNode<NodeData>): Scope<NodeData> {
    const child = new Scope(sourceFile, this._nodeDefaultData, this, ownerNode);
    child._termNodeLocalName = '__#retval@' + ownerNode.ident;
    const terminalNode = new BoundNode<NodeData>(child.tNodeLocal, child, this._nodeDefaultData);
    child.declarations.set(Scope.tNode, this.terminalNode);
    child.declarations.set(child.tNodeLocal, terminalNode);
    this.childScopes.add(child);
    return child;
  }

  protected _logAction(action: string, traceSourceIdent: string, dryRun: boolean, traceTargetIdents: Array<string | undefined>, terminateLocally: boolean, terminateGlobally: boolean) {
    if (!(log.verbosity! & LogVerbosity.WITH_ELIMINATION_HINTS)) {
      return;
    }
    const tgtIdents = traceTargetIdents.filter((id) => !!id);
    if (terminateGlobally) {
      tgtIdents.push(Scope.tNode);
    }
    if (terminateLocally) {
      tgtIdents.push(this.tNodeLocal);
    }
    log(`[${dryRun ? 'D' : ' '}] ${action}: ${traceSourceIdent} -> [${tgtIdents.join(', ')}]`, LogSeverity.INFO);
  }

  /**
   * Add declaration of identifier to current scope
   *
   * @param traceSourceIdent  Identifier: variable or function name
   * @param traceTargetIdents  What other identifiers are used to compute value.
   *                        All identifiers in expressions, all function args should be here.
   * @param terminateGlobally  Set this to true if variable or function is used in library methods or is exported
   * @param terminateLocally  Set this to true if variable or result of function call is returned as result.
   * @param dryRun  First pass of codegen?
   */
  public addDeclaration(traceSourceIdent: string, traceTargetIdents: Array<string | undefined>, { terminateGlobally = false, terminateLocally = false, dryRun = false } = {}): BoundNode<NodeData> | null {
    let node: BoundNode<NodeData>;
    const pendingNode = this.declarations.get(traceSourceIdent);

    if (dryRun) {
      this._logAction('Add declaration', traceSourceIdent, dryRun, traceTargetIdents, terminateLocally, terminateGlobally);
      if (pendingNode && !isPending(pendingNode)) {
        log(`Identifier ${traceSourceIdent} already declared @ ${pendingNode.homeScope.tNodeLocal}`, LogSeverity.ERROR, shortCtx(this.sourceFile));
        return null;
      }
    } else {
      if (!pendingNode) {
        log(`No identifier ${traceSourceIdent} declared while unused vars elimination: it's probably a bug in transpiler`, LogSeverity.ERROR, shortCtx(this.sourceFile));
        return null;
      }
      if (isPending(pendingNode)) {
        log(`Node ${traceSourceIdent} was not bound while unused vars elimination: it's probably a bug in transpiler`, LogSeverity.ERROR, shortCtx(this.sourceFile));
        return null;
      }
      return pendingNode as BoundNode<NodeData>;
    }

    // We should pass here only in dry run with pending or undefined node
    const traceTargetNodes = traceTargetIdents.filter((s): s is string => !!s).map(this._findOrInsertNode);
    if (pendingNode) {
      if (!isPending(pendingNode)) {
        return pendingNode as BoundNode<NodeData>;
      }
      node = pendingNode.latebind(traceTargetNodes);
      this.identsUsed.delete(pendingNode);
      this.identsUsed.add(node);
      this.declarations.set(traceSourceIdent, node);
      this._callListeners(Scope.EV_BIND_UNBOUND, traceSourceIdent);
    } else {
      node = new BoundNode(traceSourceIdent, this, this._nodeDefaultData, traceTargetNodes);
      this.declarations.set(traceSourceIdent, node);
      this._callListeners(Scope.EV_DECL, traceSourceIdent);
    }

    if (terminateGlobally) {
      this.terminalNode.addEdgeTo(node);
    }

    if (terminateLocally) {
      this.localTerminalNode.addEdgeTo(node);
    }

    return node;
  }

  /**
   * Add usage of identifier to current scope
   *
   * @param traceSourceIdent  Identifier: variable or function name
   * @param traceTargetIdents  What other identifiers are used to compute value.
   *                          All identifiers in expressions, all function args should be here.
   * @param terminateGlobally  Set this to true if variable or function is used in library methods
   * @param terminateLocally  Set this to true if variable or result of function call is returned as result.
   * @param dryRun  First pass of codegen?
   */
  public addUsage(traceSourceIdent: string, traceTargetIdents: string[], { terminateGlobally = false, terminateLocally = false, dryRun = false } = {}): void {
    if (!dryRun) {
      // We don't add usages on non-dry run, it's pointless
      return;
    }

    this._logAction('Add usage', traceSourceIdent, dryRun, traceTargetIdents, terminateLocally, terminateGlobally);

    let traceSourceNode = this._findOrInsertNode(traceSourceIdent);
    this.identsUsed.add(traceSourceNode);
    this._callListeners(Scope.EV_USAGE, traceSourceIdent);

    if (terminateGlobally) {
      this.terminalNode.addEdgeTo(traceSourceNode);
    }

    if (terminateLocally) {
      this.localTerminalNode.addEdgeTo(traceSourceNode);
    }

    traceTargetIdents
      .map(this._findOrInsertNode)
      .forEach((n) => traceSourceNode.addEdgeTo(n));
  }

  public terminateCall(traceTargetIdent: string, { traceSourceIdent, dryRun = false }: { traceSourceIdent?: string; dryRun?: boolean } = {}) {
    if (!dryRun) {
      // We don't add usages on non-dry run, it's pointless
      return;
    }

    if (!traceSourceIdent) {
      traceSourceIdent = this.tNodeLocal;
    }

    this._logAction('Terminate call', traceSourceIdent, dryRun, [traceTargetIdent], false, false);

    const traceTargetNode = this._findOrInsertNode(traceTargetIdent);
    const traceSourceNode = this._findOrInsertNode(traceSourceIdent);
    traceSourceNode.addEdgeTo(traceTargetNode);
  }

  /**
   * Used in components to attach component's return node to parent return node
   * @param dryRun
   */
  public terminateToParentTerminalNode(dryRun = false) {
    if (!dryRun) {
      return;
    }

    this._logAction('Terminate scope to local', this.parentScope?.tNodeLocal || '', dryRun, [this.tNodeLocal], false, false);

    const traceSourceNode = this.parentScope?.localTerminalNode;
    if (!traceSourceNode) {
      log('Trying to terminate root node to upper scope - this is error in transpiler', LogSeverity.ERROR, shortCtx(this.sourceFile));
      return;
    }

    const traceTargetNode = this.localTerminalNode;
    traceSourceNode.addEdgeTo(traceTargetNode);
  }

  /**
   * Reset usage flags for all nodes in all child scopes and current scope
   */
  public reset() {
    if (this.parentScope) {
      log('reset() is not intended to be used with non-root scope', LogSeverity.ERROR, shortCtx(this.sourceFile));
      return;
    }
    this.declarations.forEach((node) => node.reset());
    this.childScopes.forEach((scope) => scope.reset());
  }

  /**
   * Get global terminal node
   * Terminal nodes are always early-bound
   */
  public get terminalNode(): BoundNode<NodeData> {
    return this.declarations.get(Scope.tNode) as BoundNode<NodeData>;
  }

  /**
   * Get local terminal node
   * Terminal nodes are always early-bound
   */
  public get localTerminalNode(): BoundNode<NodeData> {
    return this.declarations.get(this.tNodeLocal) as BoundNode<NodeData>;
  }

  public checkUsage(varName: string): boolean {
    if (Scope._forceDisableUnusedVarsElimination) {
      return true;
    }
    return !!(this.declarations.has(varName) && this.declarations.get(varName)?.used);
  }
}
