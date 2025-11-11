var __defProp = Object.defineProperty;
var __name = (target, value) =>
  __defProp(target, "name", { value, configurable: true });

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now
  ? globalThis.performance.now.bind(globalThis.performance)
  : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0,
  },
  detail: void 0,
  toJSON() {
    return this;
  },
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail,
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName
      ? this._entries.filter((e) => e.name !== markName)
      : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName
      ? this._entries.filter((e) => e.name !== measureName)
      : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter(
      (e) => e.entryType !== "resource" || e.entryType !== "navigation",
    );
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter(
      (e) => e.name === name && (!type || e.entryType === type),
    );
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]
        ?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end,
      },
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance =
  globalThis.performance && "addEventListener" in globalThis.performance
    ? globalThis.performance
    : new Performance();

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {}, { __unenv__: true });

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask =
  _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console =
  _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2,
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times,
});
var console_default = workerdConsole;

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ __name(function hrtime2(startTime) {
    const now = Date.now();
    const seconds = Math.trunc(now / 1e3);
    const nanos = (now % 1e3) * 1e6;
    if (startTime) {
      let diffSeconds = seconds - startTime[0];
      let diffNanos = nanos - startTime[0];
      if (diffNanos < 0) {
        diffSeconds = diffSeconds - 1;
        diffNanos = 1e9 + diffNanos;
      }
      return [diffSeconds, diffNanos];
    }
    return [seconds, nanos];
  }, "hrtime"),
  {
    bigint: /* @__PURE__ */ __name(function bigint() {
      return BigInt(Date.now() * 1e6);
    }, "bigint"),
  },
);

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {}
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [
      ...Object.getOwnPropertyNames(_Process.prototype),
      ...Object.getOwnPropertyNames(EventEmitter.prototype),
    ]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(
      `${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`,
    );
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return (this.#stdin ??= new ReadStream(0));
  }
  get stdout() {
    return (this.#stdout ??= new WriteStream(1));
  }
  get stderr() {
    return (this.#stderr ??= new WriteStream(2));
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {}
  unref() {}
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError(
      "process.setUncaughtExceptionCaptureCallback",
    );
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError(
      "process.hasUncaughtExceptionCaptureCallback",
    );
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = {
    has: /* @__PURE__ */ notImplemented("process.permission.has"),
  };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport"),
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented(
      "process.finalization.unregister",
    ),
    registerBeforeExit: /* @__PURE__ */ notImplemented(
      "process.finalization.registerBeforeExit",
    ),
  };
  memoryUsage = Object.assign(
    () => ({
      arrayBuffers: 0,
      rss: 0,
      external: 0,
      heapTotal: 0,
      heapUsed: 0,
    }),
    { rss: /* @__PURE__ */ __name(() => 0, "rss") },
  );
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var isWorkerdProcessV2 =
  globalThis.Cloudflare.compatibilityFlags.enable_nodejs_process_v2;
var unenvProcess = new Process({
  env: globalProcess.env,
  // `hrtime` is only available from workerd process v2
  hrtime: isWorkerdProcessV2 ? workerdProcess.hrtime : hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick,
});
var { exit, features, platform } = workerdProcess;
var {
  // Always implemented by workerd
  env,
  // Only implemented in workerd v2
  hrtime: hrtime3,
  // Always implemented by workerd
  nextTick,
} = unenvProcess;
var {
  _channel,
  _disconnect,
  _events,
  _eventsCount,
  _handleQueue,
  _maxListeners,
  _pendingMessage,
  _send,
  assert: assert2,
  disconnect,
  mainModule,
} = unenvProcess;
var {
  // @ts-expect-error `_debugEnd` is missing typings
  _debugEnd,
  // @ts-expect-error `_debugProcess` is missing typings
  _debugProcess,
  // @ts-expect-error `_exiting` is missing typings
  _exiting,
  // @ts-expect-error `_fatalException` is missing typings
  _fatalException,
  // @ts-expect-error `_getActiveHandles` is missing typings
  _getActiveHandles,
  // @ts-expect-error `_getActiveRequests` is missing typings
  _getActiveRequests,
  // @ts-expect-error `_kill` is missing typings
  _kill,
  // @ts-expect-error `_linkedBinding` is missing typings
  _linkedBinding,
  // @ts-expect-error `_preload_modules` is missing typings
  _preload_modules,
  // @ts-expect-error `_rawDebug` is missing typings
  _rawDebug,
  // @ts-expect-error `_startProfilerIdleNotifier` is missing typings
  _startProfilerIdleNotifier,
  // @ts-expect-error `_stopProfilerIdleNotifier` is missing typings
  _stopProfilerIdleNotifier,
  // @ts-expect-error `_tickCallback` is missing typings
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  availableMemory,
  // @ts-expect-error `binding` is missing typings
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  // @ts-expect-error `domain` is missing typings
  domain,
  emit,
  emitWarning,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  // @ts-expect-error `initgroups` is missing typings
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  memoryUsage,
  // @ts-expect-error `moduleLoadList` is missing typings
  moduleLoadList,
  off,
  on,
  once,
  // @ts-expect-error `openStdin` is missing typings
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  // @ts-expect-error `reallyExit` is missing typings
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions,
} = isWorkerdProcessV2 ? workerdProcess : unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding,
};
var process_default = _process;

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// src/middleware/cors.js
function corsMiddleware(request) {
  const origin = request.headers.get("Origin");
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://jun-oro.pages.dev",
    "https://jun-oro.com",
  ];
  const corsHeaders = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
    "Access-Control-Max-Age": "86400",
  };
  if (
    origin &&
    (allowedOrigins.includes(origin) || origin.includes("localhost"))
  ) {
    corsHeaders["Access-Control-Allow-Origin"] = origin;
    corsHeaders["Access-Control-Allow-Credentials"] = "true";
  } else {
    corsHeaders["Access-Control-Allow-Origin"] = "*";
  }
  return corsHeaders;
}
__name(corsMiddleware, "corsMiddleware");
function handleOptions(request) {
  const corsHeaders = corsMiddleware(request);
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
__name(handleOptions, "handleOptions");

// src/utils/response.js
function createResponse(data, status = 200, headers = {}) {
  const defaultHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    ...headers,
  };
  return new Response(JSON.stringify(data), {
    status,
    headers: defaultHeaders,
  });
}
__name(createResponse, "createResponse");
function successResponse(data, message = "Success") {
  return createResponse({
    success: true,
    message,
    data,
  });
}
__name(successResponse, "successResponse");
function errorResponse(message, status = 400, code = null) {
  return createResponse(
    {
      success: false,
      message,
      code,
      timestamp: /* @__PURE__ */ new Date().toISOString(),
    },
    status,
  );
}
__name(errorResponse, "errorResponse");
function unauthorizedResponse(message = "Unauthorized") {
  return createResponse(
    {
      success: false,
      message,
    },
    401,
  );
}
__name(unauthorizedResponse, "unauthorizedResponse");
function serverErrorResponse(message = "Internal server error") {
  return createResponse(
    {
      success: false,
      message,
    },
    500,
  );
}
__name(serverErrorResponse, "serverErrorResponse");

// src/utils/auth.js
async function createJWT(payload, secret, expiresIn = "24h") {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };
  const now = Math.floor(Date.now() / 1e3);
  const exp = now + parseExpiration(expiresIn);
  const jwtPayload = {
    ...payload,
    iat: now,
    exp,
  };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(jwtPayload));
  const signature = await sign(`${encodedHeader}.${encodedPayload}`, secret);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}
__name(createJWT, "createJWT");
async function verifyJWT(token, secret) {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split(".");
    if (!encodedHeader || !encodedPayload || !signature) {
      throw new Error("Invalid token format");
    }
    const expectedSignature = await sign(
      `${encodedHeader}.${encodedPayload}`,
      secret,
    );
    if (signature !== expectedSignature) {
      throw new Error("Invalid signature");
    }
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1e3)) {
      throw new Error("Token expired");
    }
    return payload;
  } catch (error3) {
    throw new Error(`JWT verification failed: ${error3.message}`);
  }
}
__name(verifyJWT, "verifyJWT");
async function sign(data, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return base64UrlEncode(new Uint8Array(signature));
}
__name(sign, "sign");
function base64UrlEncode(data) {
  if (typeof data === "string") {
    data = new TextEncoder().encode(data);
  }
  const base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
__name(base64UrlEncode, "base64UrlEncode");
function base64UrlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) {
    str += "=";
  }
  return atob(str);
}
__name(base64UrlDecode, "base64UrlDecode");
function parseExpiration(expiresIn) {
  if (typeof expiresIn === "number") {
    return expiresIn;
  }
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error("Invalid expiration format");
  }
  const value = parseInt(match[1]);
  const unit = match[2];
  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 60 * 60;
    case "d":
      return value * 60 * 60 * 24;
    default:
      throw new Error("Invalid expiration unit");
  }
}
__name(parseExpiration, "parseExpiration");
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "jun-oro-salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hashPassword, "hashPassword");
async function verifyPassword(password, hash) {
  const hashedPassword = await hashPassword(password);
  return hashedPassword === hash;
}
__name(verifyPassword, "verifyPassword");
function generateSessionId() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}
__name(generateSessionId, "generateSessionId");
function generateUUID() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
    "",
  );
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}
__name(generateUUID, "generateUUID");
function extractToken(request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}
__name(extractToken, "extractToken");

// src/utils/validation.js
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
__name(validateEmail, "validateEmail");
function validateUsername(username) {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}
__name(validateUsername, "validateUsername");
function validatePassword(password) {
  return password && password.length >= 6;
}
__name(validatePassword, "validatePassword");
function validateRequired(value, fieldName) {
  if (!value || (typeof value === "string" && value.trim() === "")) {
    return `${fieldName} is required`;
  }
  return null;
}
__name(validateRequired, "validateRequired");
function validateGameData(gameData) {
  const errors = [];
  if (!gameData.title || gameData.title.trim() === "") {
    errors.push("Title is required");
  }
  if (gameData.rating !== void 0 && gameData.rating !== null) {
    const rating = parseFloat(gameData.rating);
    if (isNaN(rating) || rating < 0 || rating > 10) {
      errors.push("Rating must be between 0 and 10");
    }
  }
  if (gameData.release_date && !isValidDate(gameData.release_date)) {
    errors.push("Invalid release date format");
  }
  return errors;
}
__name(validateGameData, "validateGameData");
function validateUserRegistration(userData) {
  const errors = [];
  const requiredError = validateRequired(userData.username, "Username");
  if (requiredError) errors.push(requiredError);
  else if (!validateUsername(userData.username)) {
    errors.push(
      "Username must be 3-20 characters, alphanumeric and underscore only",
    );
  }
  const emailError = validateRequired(userData.email, "Email");
  if (emailError) errors.push(emailError);
  else if (!validateEmail(userData.email)) {
    errors.push("Invalid email format");
  }
  const passwordError = validateRequired(userData.password, "Password");
  if (passwordError) errors.push(passwordError);
  else if (!validatePassword(userData.password)) {
    errors.push("Password must be at least 6 characters");
  }
  return errors;
}
__name(validateUserRegistration, "validateUserRegistration");
function validateUserLogin(userData) {
  const errors = [];
  const usernameError = validateRequired(userData.username, "Username");
  if (usernameError) errors.push(usernameError);
  const passwordError = validateRequired(userData.password, "Password");
  if (passwordError) errors.push(passwordError);
  return errors;
}
__name(validateUserLogin, "validateUserLogin");
function validateGameLibraryEntry(entryData) {
  const errors = [];
  if (!entryData.game_id) {
    errors.push("Game ID is required");
  }
  if (
    entryData.status &&
    !["playing", "completed", "want_to_play", "dropped"].includes(
      entryData.status,
    )
  ) {
    errors.push(
      "Invalid status. Must be one of: playing, completed, want_to_play, dropped",
    );
  }
  if (entryData.rating !== void 0 && entryData.rating !== null) {
    const rating = parseFloat(entryData.rating);
    if (isNaN(rating) || rating < 0 || rating > 10) {
      errors.push("Rating must be between 0 and 10");
    }
  }
  if (
    entryData.play_time_hours !== void 0 &&
    entryData.play_time_hours !== null
  ) {
    const playTime = parseInt(entryData.play_time_hours);
    if (isNaN(playTime) || playTime < 0) {
      errors.push("Play time must be a non-negative number");
    }
  }
  return errors;
}
__name(validateGameLibraryEntry, "validateGameLibraryEntry");
function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}
__name(isValidDate, "isValidDate");
function sanitizeString(str) {
  if (typeof str !== "string") return str;
  return str.trim().replace(/[<>]/g, "");
}
__name(sanitizeString, "sanitizeString");
function validatePagination(query) {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)),
    // Max 100 items per page
    offset: (Math.max(1, page) - 1) * Math.min(100, Math.max(1, limit)),
  };
}
__name(validatePagination, "validatePagination");

// src/middleware/auth.js
async function authMiddleware(request, env2) {
  try {
    const token = extractToken(request);
    if (!token) {
      return unauthorizedResponse("Authorization token required");
    }
    const payload = await verifyJWT(token, env2.JWT_SECRET);
    const session = await env2.DB.prepare(
      'SELECT s.*, u.username, u.email, u.role, u.is_active FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.is_active = 1 AND s.expires_at > datetime("now")',
    )
      .bind(payload.sessionId)
      .first();
    if (!session) {
      return unauthorizedResponse("Invalid or expired session");
    }
    if (!session.is_active) {
      return unauthorizedResponse("User account is inactive");
    }
    request.user = {
      id: session.user_id,
      username: session.username,
      email: session.email,
      role: session.role,
      sessionId: session.id,
    };
    return null;
  } catch (error3) {
    console.error("Auth middleware error:", error3);
    return unauthorizedResponse("Invalid token");
  }
}
__name(authMiddleware, "authMiddleware");
async function adminMiddleware(request, env2) {
  const authResult = await authMiddleware(request, env2);
  if (authResult) return authResult;
  if (request.user.role !== "admin") {
    return unauthorizedResponse("Admin access required");
  }
  return null;
}
__name(adminMiddleware, "adminMiddleware");

// src/routes/auth.js
async function handleRegister(request, env2) {
  try {
    const userData = await request.json();
    const validationErrors = validateUserRegistration(userData);
    if (validationErrors.length > 0) {
      return errorResponse("Validation failed", 400, {
        errors: validationErrors,
      });
    }
    const existingUser = await env2.DB.prepare(
      "SELECT id FROM users WHERE username = ? OR email = ?",
    )
      .bind(userData.username, userData.email)
      .first();
    if (existingUser) {
      return errorResponse("Username or email already exists", 409);
    }
    const hashedPassword = await hashPassword(userData.password);
    const userId = generateUUID();
    await env2.DB.prepare(
      'INSERT INTO users (id, username, email, password_hash, role, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime("now"))',
    )
      .bind(
        userId,
        userData.username,
        userData.email,
        hashedPassword,
        "user",
        1,
      )
      .run();
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1e3);
    await env2.DB.prepare(
      'INSERT INTO sessions (id, user_id, is_active, expires_at, created_at) VALUES (?, ?, ?, ?, datetime("now"))',
    )
      .bind(sessionId, userId, 1, expiresAt.toISOString())
      .run();
    const token = await createJWT(
      { userId, sessionId },
      env2.JWT_SECRET,
      "24h",
    );
    return successResponse("User registered successfully", {
      user: {
        id: userId,
        username: userData.username,
        email: userData.email,
        role: "user",
      },
      token,
    });
  } catch (error3) {
    console.error("Register error:", error3);
    return serverErrorResponse("Registration failed");
  }
}
__name(handleRegister, "handleRegister");
async function handleLogin(request, env2) {
  try {
    const loginData = await request.json();
    const validationErrors = validateUserLogin(loginData);
    if (validationErrors.length > 0) {
      return errorResponse("Validation failed", 400, {
        errors: validationErrors,
      });
    }
    const user = await env2.DB.prepare(
      "SELECT id, username, email, password_hash, role, is_active FROM users WHERE username = ? OR email = ?",
    )
      .bind(loginData.username, loginData.username)
      .first();
    if (!user) {
      return errorResponse("Invalid credentials", 401);
    }
    if (!user.is_active) {
      return errorResponse("Account is inactive", 401);
    }
    const isValidPassword = await verifyPassword(
      loginData.password,
      user.password_hash,
    );
    if (!isValidPassword) {
      return errorResponse("Invalid credentials", 401);
    }
    await env2.DB.prepare(
      "UPDATE sessions SET is_active = 0 WHERE user_id = ? AND is_active = 1",
    )
      .bind(user.id)
      .run();
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1e3);
    await env2.DB.prepare(
      'INSERT INTO sessions (id, user_id, is_active, expires_at, created_at) VALUES (?, ?, ?, ?, datetime("now"))',
    )
      .bind(sessionId, user.id, 1, expiresAt.toISOString())
      .run();
    const token = await createJWT(
      { userId: user.id, sessionId },
      env2.JWT_SECRET,
      "24h",
    );
    return successResponse("Login successful", {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error3) {
    console.error("Login error:", error3);
    return serverErrorResponse("Login failed");
  }
}
__name(handleLogin, "handleLogin");
async function handleLogout(request, env2) {
  try {
    const authResult = await authMiddleware(request, env2);
    if (authResult) return authResult;
    await env2.DB.prepare("UPDATE sessions SET is_active = 0 WHERE id = ?")
      .bind(request.user.sessionId)
      .run();
    return successResponse("Logout successful");
  } catch (error3) {
    console.error("Logout error:", error3);
    return serverErrorResponse("Logout failed");
  }
}
__name(handleLogout, "handleLogout");
async function handleMe(request, env2) {
  try {
    const authResult = await authMiddleware(request, env2);
    if (authResult) return authResult;
    const user = await env2.DB.prepare(
      "SELECT id, username, email, role, created_at FROM users WHERE id = ?",
    )
      .bind(request.user.id)
      .first();
    if (!user) {
      return errorResponse("User not found", 404);
    }
    return successResponse("User details retrieved", { user });
  } catch (error3) {
    console.error("Me endpoint error:", error3);
    return serverErrorResponse("Failed to get user details");
  }
}
__name(handleMe, "handleMe");

// src/routes/games.js
async function handleGetGames(request, env2) {
  try {
    const url = new URL(request.url);
    const { page, limit, offset } = validatePagination(url.searchParams);
    const search = sanitizeString(url.searchParams.get("search") || "");
    const genre = sanitizeString(url.searchParams.get("genre") || "");
    const platform2 = sanitizeString(url.searchParams.get("platform") || "");
    const sortBy = url.searchParams.get("sort") || "title";
    const sortOrder = url.searchParams.get("order") === "desc" ? "DESC" : "ASC";
    let query = "SELECT * FROM games WHERE 1=1";
    const params = [];
    if (search) {
      query += " AND (title LIKE ? OR description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    if (genre) {
      query += " AND genre LIKE ?";
      params.push(`%${genre}%`);
    }
    if (platform2) {
      query += " AND platforms LIKE ?";
      params.push(`%${platform2}%`);
    }
    const allowedSortFields = ["title", "release_date", "rating", "created_at"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "title";
    query += ` ORDER BY ${sortField} ${sortOrder}`;
    query += " LIMIT ? OFFSET ?";
    params.push(limit, offset);
    const games = await env2.DB.prepare(query)
      .bind(...params)
      .all();
    let countQuery = "SELECT COUNT(*) as total FROM games WHERE 1=1";
    const countParams = [];
    if (search) {
      countQuery += " AND (title LIKE ? OR description LIKE ?)";
      countParams.push(`%${search}%`, `%${search}%`);
    }
    if (genre) {
      countQuery += " AND genre LIKE ?";
      countParams.push(`%${genre}%`);
    }
    if (platform2) {
      countQuery += " AND platforms LIKE ?";
      countParams.push(`%${platform2}%`);
    }
    const totalResult = await env2.DB.prepare(countQuery)
      .bind(...countParams)
      .first();
    const total = totalResult.total;
    return successResponse("Games retrieved successfully", {
      games: games.results || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error3) {
    console.error("Get games error:", error3);
    return serverErrorResponse("Failed to retrieve games");
  }
}
__name(handleGetGames, "handleGetGames");
async function handleGetGame(request, env2) {
  try {
    const url = new URL(request.url);
    const gameId = url.pathname.split("/").pop();
    if (!gameId) {
      return errorResponse("Game ID is required", 400);
    }
    const game = await env2.DB.prepare("SELECT * FROM games WHERE id = ?")
      .bind(gameId)
      .first();
    if (!game) {
      return errorResponse("Game not found", 404);
    }
    const tags = await env2.DB.prepare(
      "SELECT gt.name FROM game_tags gt JOIN games_game_tags ggt ON gt.id = ggt.tag_id WHERE ggt.game_id = ?",
    )
      .bind(gameId)
      .all();
    game.tags = tags.results?.map((tag) => tag.name) || [];
    return successResponse("Game retrieved successfully", { game });
  } catch (error3) {
    console.error("Get game error:", error3);
    return serverErrorResponse("Failed to retrieve game");
  }
}
__name(handleGetGame, "handleGetGame");
async function handleCreateGame(request, env2) {
  try {
    const authResult = await adminMiddleware(request, env2);
    if (authResult) return authResult;
    const gameData = await request.json();
    const validationErrors = validateGameData(gameData);
    if (validationErrors.length > 0) {
      return errorResponse("Validation failed", 400, {
        errors: validationErrors,
      });
    }
    const gameId = crypto.randomUUID();
    await env2.DB.prepare(
      `
      INSERT INTO games (
        id, title, description, genre, platforms, release_date, 
        developer, publisher, rating, image_url, trailer_url, 
        steam_url, epic_url, gog_url, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))
    `,
    )
      .bind(
        gameId,
        gameData.title,
        gameData.description || null,
        gameData.genre || null,
        gameData.platforms || null,
        gameData.release_date || null,
        gameData.developer || null,
        gameData.publisher || null,
        gameData.rating || null,
        gameData.image_url || null,
        gameData.trailer_url || null,
        gameData.steam_url || null,
        gameData.epic_url || null,
        gameData.gog_url || null,
      )
      .run();
    if (gameData.tags && Array.isArray(gameData.tags)) {
      for (const tagName of gameData.tags) {
        let tag = await env2.DB.prepare(
          "SELECT id FROM game_tags WHERE name = ?",
        )
          .bind(tagName)
          .first();
        if (!tag) {
          const tagId = crypto.randomUUID();
          await env2.DB.prepare(
            'INSERT INTO game_tags (id, name, created_at) VALUES (?, ?, datetime("now"))',
          )
            .bind(tagId, tagName)
            .run();
          tag = { id: tagId };
        }
        await env2.DB.prepare(
          "INSERT INTO games_game_tags (game_id, tag_id) VALUES (?, ?)",
        )
          .bind(gameId, tag.id)
          .run();
      }
    }
    const createdGame = await env2.DB.prepare(
      "SELECT * FROM games WHERE id = ?",
    )
      .bind(gameId)
      .first();
    return successResponse(
      "Game created successfully",
      { game: createdGame },
      201,
    );
  } catch (error3) {
    console.error("Create game error:", error3);
    return serverErrorResponse("Failed to create game");
  }
}
__name(handleCreateGame, "handleCreateGame");
async function handleUpdateGame(request, env2) {
  try {
    const authResult = await adminMiddleware(request, env2);
    if (authResult) return authResult;
    const url = new URL(request.url);
    const gameId = url.pathname.split("/").pop();
    const gameData = await request.json();
    if (!gameId) {
      return errorResponse("Game ID is required", 400);
    }
    const existingGame = await env2.DB.prepare(
      "SELECT id FROM games WHERE id = ?",
    )
      .bind(gameId)
      .first();
    if (!existingGame) {
      return errorResponse("Game not found", 404);
    }
    const validationErrors = validateGameData(gameData);
    if (validationErrors.length > 0) {
      return errorResponse("Validation failed", 400, {
        errors: validationErrors,
      });
    }
    await env2.DB.prepare(
      `
      UPDATE games SET 
        title = ?, description = ?, genre = ?, platforms = ?, 
        release_date = ?, developer = ?, publisher = ?, rating = ?, 
        image_url = ?, trailer_url = ?, steam_url = ?, epic_url = ?, 
        gog_url = ?, updated_at = datetime("now")
      WHERE id = ?
    `,
    )
      .bind(
        gameData.title,
        gameData.description || null,
        gameData.genre || null,
        gameData.platforms || null,
        gameData.release_date || null,
        gameData.developer || null,
        gameData.publisher || null,
        gameData.rating || null,
        gameData.image_url || null,
        gameData.trailer_url || null,
        gameData.steam_url || null,
        gameData.epic_url || null,
        gameData.gog_url || null,
        gameId,
      )
      .run();
    const updatedGame = await env2.DB.prepare(
      "SELECT * FROM games WHERE id = ?",
    )
      .bind(gameId)
      .first();
    return successResponse("Game updated successfully", { game: updatedGame });
  } catch (error3) {
    console.error("Update game error:", error3);
    return serverErrorResponse("Failed to update game");
  }
}
__name(handleUpdateGame, "handleUpdateGame");
async function handleDeleteGame(request, env2) {
  try {
    const authResult = await adminMiddleware(request, env2);
    if (authResult) return authResult;
    const url = new URL(request.url);
    const gameId = url.pathname.split("/").pop();
    if (!gameId) {
      return errorResponse("Game ID is required", 400);
    }
    const existingGame = await env2.DB.prepare(
      "SELECT id FROM games WHERE id = ?",
    )
      .bind(gameId)
      .first();
    if (!existingGame) {
      return errorResponse("Game not found", 404);
    }
    await env2.DB.prepare("DELETE FROM games WHERE id = ?").bind(gameId).run();
    return successResponse("Game deleted successfully");
  } catch (error3) {
    console.error("Delete game error:", error3);
    return serverErrorResponse("Failed to delete game");
  }
}
__name(handleDeleteGame, "handleDeleteGame");

// src/routes/library.js
async function handleGetUserLibrary(request, env2) {
  try {
    const authResult = await authMiddleware(request, env2);
    if (authResult) return authResult;
    const url = new URL(request.url);
    const { page, limit, offset } = validatePagination(url.searchParams);
    const status = url.searchParams.get("status");
    const sortBy = url.searchParams.get("sort") || "added_at";
    const sortOrder = url.searchParams.get("order") === "desc" ? "DESC" : "ASC";
    let query = `
      SELECT 
        ugl.*,
        g.title, g.description, g.genre, g.platforms, g.release_date,
        g.developer, g.publisher, g.image_url, g.steam_url, g.epic_url, g.gog_url
      FROM user_game_library ugl
      JOIN games g ON ugl.game_id = g.id
      WHERE ugl.user_id = ?
    `;
    const params = [request.user.id];
    if (status) {
      query += " AND ugl.status = ?";
      params.push(status);
    }
    const allowedSortFields = [
      "added_at",
      "rating",
      "play_time_hours",
      "title",
    ];
    const sortField = allowedSortFields.includes(sortBy)
      ? sortBy === "title"
        ? "g.title"
        : `ugl.${sortBy}`
      : "ugl.added_at";
    query += ` ORDER BY ${sortField} ${sortOrder}`;
    query += " LIMIT ? OFFSET ?";
    params.push(limit, offset);
    const libraryEntries = await env2.DB.prepare(query)
      .bind(...params)
      .all();
    let countQuery =
      "SELECT COUNT(*) as total FROM user_game_library WHERE user_id = ?";
    const countParams = [request.user.id];
    if (status) {
      countQuery += " AND status = ?";
      countParams.push(status);
    }
    const totalResult = await env2.DB.prepare(countQuery)
      .bind(...countParams)
      .first();
    const total = totalResult.total;
    return successResponse("Library retrieved successfully", {
      library: libraryEntries.results || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error3) {
    console.error("Get user library error:", error3);
    return serverErrorResponse("Failed to retrieve library");
  }
}
__name(handleGetUserLibrary, "handleGetUserLibrary");
async function handleAddToLibrary(request, env2) {
  try {
    const authResult = await authMiddleware(request, env2);
    if (authResult) return authResult;
    const entryData = await request.json();
    const validationErrors = validateGameLibraryEntry(entryData);
    if (validationErrors.length > 0) {
      return errorResponse("Validation failed", 400, {
        errors: validationErrors,
      });
    }
    const game = await env2.DB.prepare("SELECT id FROM games WHERE id = ?")
      .bind(entryData.game_id)
      .first();
    if (!game) {
      return errorResponse("Game not found", 404);
    }
    const existingEntry = await env2.DB.prepare(
      "SELECT id FROM user_game_library WHERE user_id = ? AND game_id = ?",
    )
      .bind(request.user.id, entryData.game_id)
      .first();
    if (existingEntry) {
      return errorResponse("Game already in library", 409);
    }
    const entryId = crypto.randomUUID();
    await env2.DB.prepare(
      `
      INSERT INTO user_game_library (
        id, user_id, game_id, status, rating, notes, 
        play_time_hours, added_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime("now"))
    `,
    )
      .bind(
        entryId,
        request.user.id,
        entryData.game_id,
        entryData.status || "want_to_play",
        entryData.rating || null,
        entryData.notes || null,
        entryData.play_time_hours || 0,
      )
      .run();
    const createdEntry = await env2.DB.prepare(
      `
      SELECT 
        ugl.*,
        g.title, g.description, g.genre, g.platforms, g.release_date,
        g.developer, g.publisher, g.image_url
      FROM user_game_library ugl
      JOIN games g ON ugl.game_id = g.id
      WHERE ugl.id = ?
    `,
    )
      .bind(entryId)
      .first();
    return successResponse(
      "Game added to library",
      { entry: createdEntry },
      201,
    );
  } catch (error3) {
    console.error("Add to library error:", error3);
    return serverErrorResponse("Failed to add game to library");
  }
}
__name(handleAddToLibrary, "handleAddToLibrary");
async function handleUpdateLibraryEntry(request, env2) {
  try {
    const authResult = await authMiddleware(request, env2);
    if (authResult) return authResult;
    const url = new URL(request.url);
    const entryId = url.pathname.split("/").pop();
    const entryData = await request.json();
    if (!entryId) {
      return errorResponse("Entry ID is required", 400);
    }
    const existingEntry = await env2.DB.prepare(
      "SELECT id FROM user_game_library WHERE id = ? AND user_id = ?",
    )
      .bind(entryId, request.user.id)
      .first();
    if (!existingEntry) {
      return errorResponse("Library entry not found", 404);
    }
    const validationErrors = [];
    if (
      entryData.status &&
      !["playing", "completed", "want_to_play", "dropped"].includes(
        entryData.status,
      )
    ) {
      validationErrors.push("Invalid status");
    }
    if (entryData.rating !== void 0 && entryData.rating !== null) {
      const rating = parseFloat(entryData.rating);
      if (isNaN(rating) || rating < 0 || rating > 10) {
        validationErrors.push("Rating must be between 0 and 10");
      }
    }
    if (validationErrors.length > 0) {
      return errorResponse("Validation failed", 400, {
        errors: validationErrors,
      });
    }
    const updateFields = [];
    const params = [];
    if (entryData.status !== void 0) {
      updateFields.push("status = ?");
      params.push(entryData.status);
    }
    if (entryData.rating !== void 0) {
      updateFields.push("rating = ?");
      params.push(entryData.rating);
    }
    if (entryData.notes !== void 0) {
      updateFields.push("notes = ?");
      params.push(entryData.notes);
    }
    if (entryData.play_time_hours !== void 0) {
      updateFields.push("play_time_hours = ?");
      params.push(entryData.play_time_hours);
    }
    if (updateFields.length === 0) {
      return errorResponse("No fields to update", 400);
    }
    updateFields.push('updated_at = datetime("now")');
    params.push(entryId);
    await env2.DB.prepare(
      `UPDATE user_game_library SET ${updateFields.join(", ")} WHERE id = ?`,
    )
      .bind(...params)
      .run();
    const updatedEntry = await env2.DB.prepare(
      `
      SELECT 
        ugl.*,
        g.title, g.description, g.genre, g.platforms, g.release_date,
        g.developer, g.publisher, g.image_url
      FROM user_game_library ugl
      JOIN games g ON ugl.game_id = g.id
      WHERE ugl.id = ?
    `,
    )
      .bind(entryId)
      .first();
    return successResponse("Library entry updated", { entry: updatedEntry });
  } catch (error3) {
    console.error("Update library entry error:", error3);
    return serverErrorResponse("Failed to update library entry");
  }
}
__name(handleUpdateLibraryEntry, "handleUpdateLibraryEntry");
async function handleRemoveFromLibrary(request, env2) {
  try {
    const authResult = await authMiddleware(request, env2);
    if (authResult) return authResult;
    const url = new URL(request.url);
    const entryId = url.pathname.split("/").pop();
    if (!entryId) {
      return errorResponse("Entry ID is required", 400);
    }
    const existingEntry = await env2.DB.prepare(
      "SELECT id FROM user_game_library WHERE id = ? AND user_id = ?",
    )
      .bind(entryId, request.user.id)
      .first();
    if (!existingEntry) {
      return errorResponse("Library entry not found", 404);
    }
    await env2.DB.prepare("DELETE FROM user_game_library WHERE id = ?")
      .bind(entryId)
      .run();
    return successResponse("Game removed from library");
  } catch (error3) {
    console.error("Remove from library error:", error3);
    return serverErrorResponse("Failed to remove game from library");
  }
}
__name(handleRemoveFromLibrary, "handleRemoveFromLibrary");
async function handleGetLibraryStats(request, env2) {
  try {
    const authResult = await authMiddleware(request, env2);
    if (authResult) return authResult;
    const stats = await env2.DB.prepare(
      `
      SELECT 
        COUNT(*) as total_games,
        COUNT(CASE WHEN status = 'playing' THEN 1 END) as currently_playing,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'want_to_play' THEN 1 END) as want_to_play,
        COUNT(CASE WHEN status = 'dropped' THEN 1 END) as dropped,
        SUM(play_time_hours) as total_play_time,
        AVG(CASE WHEN rating IS NOT NULL THEN rating END) as average_rating
      FROM user_game_library 
      WHERE user_id = ?
    `,
    )
      .bind(request.user.id)
      .first();
    return successResponse("Library statistics retrieved", { stats });
  } catch (error3) {
    console.error("Get library stats error:", error3);
    return serverErrorResponse("Failed to retrieve library statistics");
  }
}
__name(handleGetLibraryStats, "handleGetLibraryStats");

// src/index.js
var src_default = {
  async fetch(request, env2, ctx) {
    try {
      const url = new URL(request.url);
      const method = request.method;
      const path = url.pathname;
      if (method === "OPTIONS") {
        return handleOptions(request);
      }
      const corsHeaders = corsMiddleware(request);
      if (path === "/health" && method === "GET") {
        return new Response(
          JSON.stringify({
            status: "healthy",
            timestamp: /* @__PURE__ */ new Date().toISOString(),
            version: "2.0.0",
          }),
          {
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          },
        );
      }
      let response;
      if (path === "/auth/register" && method === "POST") {
        response = await handleRegister(request, env2);
      } else if (path === "/auth/login" && method === "POST") {
        response = await handleLogin(request, env2);
      } else if (path === "/auth/logout" && method === "POST") {
        response = await handleLogout(request, env2);
      } else if (path === "/auth/me" && method === "GET") {
        response = await handleMe(request, env2);
      } else if (path === "/games" && method === "GET") {
        response = await handleGetGames(request, env2);
      } else if (path === "/games" && method === "POST") {
        response = await handleCreateGame(request, env2);
      } else if (path.startsWith("/games/") && method === "GET") {
        response = await handleGetGame(request, env2);
      } else if (path.startsWith("/games/") && method === "PUT") {
        response = await handleUpdateGame(request, env2);
      } else if (path.startsWith("/games/") && method === "DELETE") {
        response = await handleDeleteGame(request, env2);
      } else if (path === "/library" && method === "GET") {
        response = await handleGetUserLibrary(request, env2);
      } else if (path === "/library" && method === "POST") {
        response = await handleAddToLibrary(request, env2);
      } else if (path === "/library/stats" && method === "GET") {
        response = await handleGetLibraryStats(request, env2);
      } else if (path.startsWith("/library/") && method === "PUT") {
        response = await handleUpdateLibraryEntry(request, env2);
      } else if (path.startsWith("/library/") && method === "DELETE") {
        response = await handleRemoveFromLibrary(request, env2);
      } else {
        response = errorResponse("Route not found", 404);
      }
      if (response) {
        const newHeaders = new Headers(response.headers);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          newHeaders.set(key, value);
        });
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      }
      return errorResponse("Internal server error", 500);
    } catch (error3) {
      console.error("Worker error:", error3);
      const corsHeaders = corsMiddleware(request);
      const errorResponse2 = serverErrorResponse("Internal server error");
      const newHeaders = new Headers(errorResponse2.headers);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        newHeaders.set(key, value);
      });
      return new Response(errorResponse2.body, {
        status: errorResponse2.status,
        statusText: errorResponse2.statusText,
        headers: newHeaders,
      });
    }
  },
};

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(
  async (request, env2, _ctx, middlewareCtx) => {
    try {
      return await middlewareCtx.next(request, env2);
    } finally {
      try {
        if (request.body !== null && !request.bodyUsed) {
          const reader = request.body.getReader();
          while (!(await reader.read()).done) {}
        }
      } catch (e) {
        console.error("Failed to drain the unused request body.", e);
      }
    }
  },
  "drainBody",
);
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause),
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(
  async (request, env2, _ctx, middlewareCtx) => {
    try {
      return await middlewareCtx.next(request, env2);
    } catch (e) {
      const error3 = reduceError(e);
      return Response.json(error3, {
        status: 500,
        headers: { "MF-Experimental-Error-Stack": "true" },
      });
    }
  },
  "jsonError",
);
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-Nh65Jx/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default,
];
var middleware_insertion_facade_default = src_default;

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    },
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware,
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-Nh65Jx/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (
    __INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 ||
    __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0
  ) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function (request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function (type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {},
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    },
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (
    __INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 ||
    __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0
  ) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {},
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher,
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default,
};
//# sourceMappingURL=index.js.map
