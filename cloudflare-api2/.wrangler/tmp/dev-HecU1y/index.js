var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) =>
  key in obj
    ? __defProp(obj, key, {
        enumerable: true,
        configurable: true,
        writable: true,
        value,
      })
    : (obj[key] = value);
var __name = (target, value) =>
  __defProp(target, "name", { value, configurable: true });
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// .wrangler/tmp/bundle-SweE9s/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray),
    ]);
  },
});

// node_modules/unenv/dist/runtime/_internal/utils.mjs
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
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
__name(PerformanceEntry, "PerformanceEntry");
var PerformanceMark = /* @__PURE__ */ __name(
  class PerformanceMark2 extends PerformanceEntry {
    entryType = "mark";
    constructor() {
      super(...arguments);
    }
    get duration() {
      return 0;
    }
  },
  "PerformanceMark",
);
var PerformanceMeasure = class extends PerformanceEntry {
  entryType = "measure";
};
__name(PerformanceMeasure, "PerformanceMeasure");
var PerformanceResourceTiming = class extends PerformanceEntry {
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
__name(PerformanceResourceTiming, "PerformanceResourceTiming");
var PerformanceObserverEntryList = class {
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
__name(PerformanceObserverEntryList, "PerformanceObserverEntryList");
var Performance = class {
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
__name(Performance, "Performance");
var PerformanceObserver = class {
  __unenv__ = true;
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
__name(PerformanceObserver, "PerformanceObserver");
__publicField(PerformanceObserver, "supportedEntryTypes", []);
var performance =
  globalThis.performance && "addEventListener" in globalThis.performance
    ? globalThis.performance
    : new Performance();

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {}, { __unenv__: true });

// node_modules/unenv/dist/runtime/node/console.mjs
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

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
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

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
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

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
import { Socket } from "node:net";
var ReadStream = class extends Socket {
  fd;
  constructor(fd) {
    super();
    this.fd = fd;
  }
  isRaw = false;
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
  isTTY = false;
};
__name(ReadStream, "ReadStream");

// node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
import { Socket as Socket2 } from "node:net";
var WriteStream = class extends Socket2 {
  fd;
  constructor(fd) {
    super();
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
  columns = 80;
  rows = 24;
  isTTY = false;
};
__name(WriteStream, "WriteStream");

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class extends EventEmitter {
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [
      ...Object.getOwnPropertyNames(Process.prototype),
      ...Object.getOwnPropertyNames(EventEmitter.prototype),
    ]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
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
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
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
    return "";
  }
  get versions() {
    return {};
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
  ref() {}
  unref() {}
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
    { rss: () => 0 },
  );
  mainModule = void 0;
  domain = void 0;
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
__name(Process, "Process");

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var { exit, platform, nextTick } = getBuiltinModule("node:process");
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  nextTick,
});
var {
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
  finalization,
  features,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  on,
  off,
  once,
  pid,
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
} = unenvProcess;
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

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
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

// node_modules/unenv/dist/runtime/node/internal/crypto/node.mjs
var webcrypto = new Proxy(globalThis.crypto, {
  get(_, key) {
    if (key === "CryptoKey") {
      return globalThis.CryptoKey;
    }
    if (typeof globalThis.crypto[key] === "function") {
      return globalThis.crypto[key].bind(globalThis.crypto);
    }
    return globalThis.crypto[key];
  },
});
var createCipher = /* @__PURE__ */ notImplemented("crypto.createCipher");
var createDecipher = /* @__PURE__ */ notImplemented("crypto.createDecipher");
var pseudoRandomBytes = /* @__PURE__ */ notImplemented(
  "crypto.pseudoRandomBytes",
);
var createCipheriv = /* @__PURE__ */ notImplemented("crypto.createCipheriv");
var createDecipheriv = /* @__PURE__ */ notImplemented(
  "crypto.createDecipheriv",
);
var createECDH = /* @__PURE__ */ notImplemented("crypto.createECDH");
var createSign = /* @__PURE__ */ notImplemented("crypto.createSign");
var createVerify = /* @__PURE__ */ notImplemented("crypto.createVerify");
var diffieHellman = /* @__PURE__ */ notImplemented("crypto.diffieHellman");
var getCipherInfo = /* @__PURE__ */ notImplemented("crypto.getCipherInfo");
var privateDecrypt = /* @__PURE__ */ notImplemented("crypto.privateDecrypt");
var privateEncrypt = /* @__PURE__ */ notImplemented("crypto.privateEncrypt");
var publicDecrypt = /* @__PURE__ */ notImplemented("crypto.publicDecrypt");
var publicEncrypt = /* @__PURE__ */ notImplemented("crypto.publicEncrypt");
var sign = /* @__PURE__ */ notImplemented("crypto.sign");
var verify = /* @__PURE__ */ notImplemented("crypto.verify");
var hash = /* @__PURE__ */ notImplemented("crypto.hash");
var Cipher = /* @__PURE__ */ notImplementedClass("crypto.Cipher");
var Cipheriv = /* @__PURE__ */ notImplementedClass(
  "crypto.Cipheriv",
  // @ts-expect-error not typed yet
);
var Decipher = /* @__PURE__ */ notImplementedClass("crypto.Decipher");
var Decipheriv = /* @__PURE__ */ notImplementedClass(
  "crypto.Decipheriv",
  // @ts-expect-error not typed yet
);
var ECDH = /* @__PURE__ */ notImplementedClass("crypto.ECDH");
var Sign = /* @__PURE__ */ notImplementedClass("crypto.Sign");
var Verify = /* @__PURE__ */ notImplementedClass("crypto.Verify");

// node_modules/unenv/dist/runtime/node/internal/crypto/constants.mjs
var SSL_OP_ALL = 2147485776;
var SSL_OP_ALLOW_NO_DHE_KEX = 1024;
var SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION = 262144;
var SSL_OP_CIPHER_SERVER_PREFERENCE = 4194304;
var SSL_OP_CISCO_ANYCONNECT = 32768;
var SSL_OP_COOKIE_EXCHANGE = 8192;
var SSL_OP_CRYPTOPRO_TLSEXT_BUG = 2147483648;
var SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS = 2048;
var SSL_OP_LEGACY_SERVER_CONNECT = 4;
var SSL_OP_NO_COMPRESSION = 131072;
var SSL_OP_NO_ENCRYPT_THEN_MAC = 524288;
var SSL_OP_NO_QUERY_MTU = 4096;
var SSL_OP_NO_RENEGOTIATION = 1073741824;
var SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION = 65536;
var SSL_OP_NO_SSLv2 = 0;
var SSL_OP_NO_SSLv3 = 33554432;
var SSL_OP_NO_TICKET = 16384;
var SSL_OP_NO_TLSv1 = 67108864;
var SSL_OP_NO_TLSv1_1 = 268435456;
var SSL_OP_NO_TLSv1_2 = 134217728;
var SSL_OP_NO_TLSv1_3 = 536870912;
var SSL_OP_PRIORITIZE_CHACHA = 2097152;
var SSL_OP_TLS_ROLLBACK_BUG = 8388608;
var ENGINE_METHOD_RSA = 1;
var ENGINE_METHOD_DSA = 2;
var ENGINE_METHOD_DH = 4;
var ENGINE_METHOD_RAND = 8;
var ENGINE_METHOD_EC = 2048;
var ENGINE_METHOD_CIPHERS = 64;
var ENGINE_METHOD_DIGESTS = 128;
var ENGINE_METHOD_PKEY_METHS = 512;
var ENGINE_METHOD_PKEY_ASN1_METHS = 1024;
var ENGINE_METHOD_ALL = 65535;
var ENGINE_METHOD_NONE = 0;
var DH_CHECK_P_NOT_SAFE_PRIME = 2;
var DH_CHECK_P_NOT_PRIME = 1;
var DH_UNABLE_TO_CHECK_GENERATOR = 4;
var DH_NOT_SUITABLE_GENERATOR = 8;
var RSA_PKCS1_PADDING = 1;
var RSA_NO_PADDING = 3;
var RSA_PKCS1_OAEP_PADDING = 4;
var RSA_X931_PADDING = 5;
var RSA_PKCS1_PSS_PADDING = 6;
var RSA_PSS_SALTLEN_DIGEST = -1;
var RSA_PSS_SALTLEN_MAX_SIGN = -2;
var RSA_PSS_SALTLEN_AUTO = -2;
var POINT_CONVERSION_COMPRESSED = 2;
var POINT_CONVERSION_UNCOMPRESSED = 4;
var POINT_CONVERSION_HYBRID = 6;
var defaultCoreCipherList = "";
var defaultCipherList = "";
var OPENSSL_VERSION_NUMBER = 0;
var TLS1_VERSION = 0;
var TLS1_1_VERSION = 0;
var TLS1_2_VERSION = 0;
var TLS1_3_VERSION = 0;

// node_modules/unenv/dist/runtime/node/crypto.mjs
var constants = {
  OPENSSL_VERSION_NUMBER,
  SSL_OP_ALL,
  SSL_OP_ALLOW_NO_DHE_KEX,
  SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION,
  SSL_OP_CIPHER_SERVER_PREFERENCE,
  SSL_OP_CISCO_ANYCONNECT,
  SSL_OP_COOKIE_EXCHANGE,
  SSL_OP_CRYPTOPRO_TLSEXT_BUG,
  SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS,
  SSL_OP_LEGACY_SERVER_CONNECT,
  SSL_OP_NO_COMPRESSION,
  SSL_OP_NO_ENCRYPT_THEN_MAC,
  SSL_OP_NO_QUERY_MTU,
  SSL_OP_NO_RENEGOTIATION,
  SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION,
  SSL_OP_NO_SSLv2,
  SSL_OP_NO_SSLv3,
  SSL_OP_NO_TICKET,
  SSL_OP_NO_TLSv1,
  SSL_OP_NO_TLSv1_1,
  SSL_OP_NO_TLSv1_2,
  SSL_OP_NO_TLSv1_3,
  SSL_OP_PRIORITIZE_CHACHA,
  SSL_OP_TLS_ROLLBACK_BUG,
  ENGINE_METHOD_RSA,
  ENGINE_METHOD_DSA,
  ENGINE_METHOD_DH,
  ENGINE_METHOD_RAND,
  ENGINE_METHOD_EC,
  ENGINE_METHOD_CIPHERS,
  ENGINE_METHOD_DIGESTS,
  ENGINE_METHOD_PKEY_METHS,
  ENGINE_METHOD_PKEY_ASN1_METHS,
  ENGINE_METHOD_ALL,
  ENGINE_METHOD_NONE,
  DH_CHECK_P_NOT_SAFE_PRIME,
  DH_CHECK_P_NOT_PRIME,
  DH_UNABLE_TO_CHECK_GENERATOR,
  DH_NOT_SUITABLE_GENERATOR,
  RSA_PKCS1_PADDING,
  RSA_NO_PADDING,
  RSA_PKCS1_OAEP_PADDING,
  RSA_X931_PADDING,
  RSA_PKCS1_PSS_PADDING,
  RSA_PSS_SALTLEN_DIGEST,
  RSA_PSS_SALTLEN_MAX_SIGN,
  RSA_PSS_SALTLEN_AUTO,
  defaultCoreCipherList,
  TLS1_VERSION,
  TLS1_1_VERSION,
  TLS1_2_VERSION,
  TLS1_3_VERSION,
  POINT_CONVERSION_COMPRESSED,
  POINT_CONVERSION_UNCOMPRESSED,
  POINT_CONVERSION_HYBRID,
  defaultCipherList,
};

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/crypto.mjs
var workerdCrypto = process.getBuiltinModule("node:crypto");
var {
  Certificate,
  DiffieHellman,
  DiffieHellmanGroup,
  Hash,
  Hmac,
  KeyObject,
  X509Certificate,
  checkPrime,
  checkPrimeSync,
  createDiffieHellman,
  createDiffieHellmanGroup,
  createHash,
  createHmac,
  createPrivateKey,
  createPublicKey,
  createSecretKey,
  generateKey,
  generateKeyPair,
  generateKeyPairSync,
  generateKeySync,
  generatePrime,
  generatePrimeSync,
  getCiphers,
  getCurves,
  getDiffieHellman,
  getFips,
  getHashes,
  hkdf,
  hkdfSync,
  pbkdf2,
  pbkdf2Sync,
  randomBytes,
  randomFill,
  randomFillSync,
  randomInt,
  randomUUID,
  scrypt,
  scryptSync,
  secureHeapUsed,
  setEngine,
  setFips,
  subtle,
  timingSafeEqual,
} = workerdCrypto;
var getRandomValues = workerdCrypto.getRandomValues.bind(
  workerdCrypto.webcrypto,
);
var webcrypto2 = {
  // @ts-expect-error unenv has unknown type
  CryptoKey: webcrypto.CryptoKey,
  getRandomValues,
  randomUUID,
  subtle,
};
var fips = workerdCrypto.fips;
var crypto_default = {
  /**
   * manually unroll unenv-polyfilled-symbols to make it tree-shakeable
   */
  Certificate,
  Cipher,
  Cipheriv,
  Decipher,
  Decipheriv,
  ECDH,
  Sign,
  Verify,
  X509Certificate,
  // @ts-expect-error @types/node is out of date - this is a bug in typings
  constants,
  // @ts-expect-error unenv has unknown type
  createCipheriv,
  // @ts-expect-error unenv has unknown type
  createDecipheriv,
  // @ts-expect-error unenv has unknown type
  createECDH,
  // @ts-expect-error unenv has unknown type
  createSign,
  // @ts-expect-error unenv has unknown type
  createVerify,
  // @ts-expect-error unenv has unknown type
  diffieHellman,
  // @ts-expect-error unenv has unknown type
  getCipherInfo,
  // @ts-expect-error unenv has unknown type
  hash,
  // @ts-expect-error unenv has unknown type
  privateDecrypt,
  // @ts-expect-error unenv has unknown type
  privateEncrypt,
  // @ts-expect-error unenv has unknown type
  publicDecrypt,
  // @ts-expect-error unenv has unknown type
  publicEncrypt,
  scrypt,
  scryptSync,
  // @ts-expect-error unenv has unknown type
  sign,
  // @ts-expect-error unenv has unknown type
  verify,
  // default-only export from unenv
  // @ts-expect-error unenv has unknown type
  createCipher,
  // @ts-expect-error unenv has unknown type
  createDecipher,
  // @ts-expect-error unenv has unknown type
  pseudoRandomBytes,
  /**
   * manually unroll workerd-polyfilled-symbols to make it tree-shakeable
   */
  DiffieHellman,
  DiffieHellmanGroup,
  Hash,
  Hmac,
  KeyObject,
  checkPrime,
  checkPrimeSync,
  createDiffieHellman,
  createDiffieHellmanGroup,
  createHash,
  createHmac,
  createPrivateKey,
  createPublicKey,
  createSecretKey,
  generateKey,
  generateKeyPair,
  generateKeyPairSync,
  generateKeySync,
  generatePrime,
  generatePrimeSync,
  getCiphers,
  getCurves,
  getDiffieHellman,
  getFips,
  getHashes,
  getRandomValues,
  hkdf,
  hkdfSync,
  pbkdf2,
  pbkdf2Sync,
  randomBytes,
  randomFill,
  randomFillSync,
  randomInt,
  randomUUID,
  secureHeapUsed,
  setEngine,
  setFips,
  subtle,
  timingSafeEqual,
  // default-only export from workerd
  fips,
  // special-cased deep merged symbols
  webcrypto: webcrypto2,
};

// node_modules/bcryptjs/index.js
var randomFallback = null;
function randomBytes2(len) {
  try {
    return crypto.getRandomValues(new Uint8Array(len));
  } catch {}
  try {
    return crypto_default.randomBytes(len);
  } catch {}
  if (!randomFallback) {
    throw Error(
      "Neither WebCryptoAPI nor a crypto module is available. Use bcrypt.setRandomFallback to set an alternative",
    );
  }
  return randomFallback(len);
}
__name(randomBytes2, "randomBytes");
function setRandomFallback(random) {
  randomFallback = random;
}
__name(setRandomFallback, "setRandomFallback");
function genSaltSync(rounds, seed_length) {
  rounds = rounds || GENSALT_DEFAULT_LOG2_ROUNDS;
  if (typeof rounds !== "number")
    throw Error(
      "Illegal arguments: " + typeof rounds + ", " + typeof seed_length,
    );
  if (rounds < 4) rounds = 4;
  else if (rounds > 31) rounds = 31;
  var salt = [];
  salt.push("$2b$");
  if (rounds < 10) salt.push("0");
  salt.push(rounds.toString());
  salt.push("$");
  salt.push(base64_encode(randomBytes2(BCRYPT_SALT_LEN), BCRYPT_SALT_LEN));
  return salt.join("");
}
__name(genSaltSync, "genSaltSync");
function genSalt(rounds, seed_length, callback) {
  if (typeof seed_length === "function")
    ((callback = seed_length), (seed_length = void 0));
  if (typeof rounds === "function") ((callback = rounds), (rounds = void 0));
  if (typeof rounds === "undefined") rounds = GENSALT_DEFAULT_LOG2_ROUNDS;
  else if (typeof rounds !== "number")
    throw Error("illegal arguments: " + typeof rounds);
  function _async(callback2) {
    nextTick2(function () {
      try {
        callback2(null, genSaltSync(rounds));
      } catch (err) {
        callback2(err);
      }
    });
  }
  __name(_async, "_async");
  if (callback) {
    if (typeof callback !== "function")
      throw Error("Illegal callback: " + typeof callback);
    _async(callback);
  } else
    return new Promise(function (resolve, reject) {
      _async(function (err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
}
__name(genSalt, "genSalt");
function hashSync(password, salt) {
  if (typeof salt === "undefined") salt = GENSALT_DEFAULT_LOG2_ROUNDS;
  if (typeof salt === "number") salt = genSaltSync(salt);
  if (typeof password !== "string" || typeof salt !== "string")
    throw Error("Illegal arguments: " + typeof password + ", " + typeof salt);
  return _hash(password, salt);
}
__name(hashSync, "hashSync");
function hash2(password, salt, callback, progressCallback) {
  function _async(callback2) {
    if (typeof password === "string" && typeof salt === "number")
      genSalt(salt, function (err, salt2) {
        _hash(password, salt2, callback2, progressCallback);
      });
    else if (typeof password === "string" && typeof salt === "string")
      _hash(password, salt, callback2, progressCallback);
    else
      nextTick2(
        callback2.bind(
          this,
          Error("Illegal arguments: " + typeof password + ", " + typeof salt),
        ),
      );
  }
  __name(_async, "_async");
  if (callback) {
    if (typeof callback !== "function")
      throw Error("Illegal callback: " + typeof callback);
    _async(callback);
  } else
    return new Promise(function (resolve, reject) {
      _async(function (err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
}
__name(hash2, "hash");
function safeStringCompare(known, unknown) {
  var diff = known.length ^ unknown.length;
  for (var i = 0; i < known.length; ++i) {
    diff |= known.charCodeAt(i) ^ unknown.charCodeAt(i);
  }
  return diff === 0;
}
__name(safeStringCompare, "safeStringCompare");
function compareSync(password, hash3) {
  if (typeof password !== "string" || typeof hash3 !== "string")
    throw Error("Illegal arguments: " + typeof password + ", " + typeof hash3);
  if (hash3.length !== 60) return false;
  return safeStringCompare(
    hashSync(password, hash3.substring(0, hash3.length - 31)),
    hash3,
  );
}
__name(compareSync, "compareSync");
function compare(password, hashValue, callback, progressCallback) {
  function _async(callback2) {
    if (typeof password !== "string" || typeof hashValue !== "string") {
      nextTick2(
        callback2.bind(
          this,
          Error(
            "Illegal arguments: " + typeof password + ", " + typeof hashValue,
          ),
        ),
      );
      return;
    }
    if (hashValue.length !== 60) {
      nextTick2(callback2.bind(this, null, false));
      return;
    }
    hash2(
      password,
      hashValue.substring(0, 29),
      function (err, comp) {
        if (err) callback2(err);
        else callback2(null, safeStringCompare(comp, hashValue));
      },
      progressCallback,
    );
  }
  __name(_async, "_async");
  if (callback) {
    if (typeof callback !== "function")
      throw Error("Illegal callback: " + typeof callback);
    _async(callback);
  } else
    return new Promise(function (resolve, reject) {
      _async(function (err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
}
__name(compare, "compare");
function getRounds(hash3) {
  if (typeof hash3 !== "string")
    throw Error("Illegal arguments: " + typeof hash3);
  return parseInt(hash3.split("$")[2], 10);
}
__name(getRounds, "getRounds");
function getSalt(hash3) {
  if (typeof hash3 !== "string")
    throw Error("Illegal arguments: " + typeof hash3);
  if (hash3.length !== 60)
    throw Error("Illegal hash length: " + hash3.length + " != 60");
  return hash3.substring(0, 29);
}
__name(getSalt, "getSalt");
function truncates(password) {
  if (typeof password !== "string")
    throw Error("Illegal arguments: " + typeof password);
  return utf8Length(password) > 72;
}
__name(truncates, "truncates");
var nextTick2 =
  typeof process !== "undefined" &&
  process &&
  typeof process.nextTick === "function"
    ? typeof setImmediate === "function"
      ? setImmediate
      : process.nextTick
    : setTimeout;
function utf8Length(string) {
  var len = 0,
    c = 0;
  for (var i = 0; i < string.length; ++i) {
    c = string.charCodeAt(i);
    if (c < 128) len += 1;
    else if (c < 2048) len += 2;
    else if (
      (c & 64512) === 55296 &&
      (string.charCodeAt(i + 1) & 64512) === 56320
    ) {
      ++i;
      len += 4;
    } else len += 3;
  }
  return len;
}
__name(utf8Length, "utf8Length");
function utf8Array(string) {
  var offset = 0,
    c1,
    c2;
  var buffer = new Array(utf8Length(string));
  for (var i = 0, k = string.length; i < k; ++i) {
    c1 = string.charCodeAt(i);
    if (c1 < 128) {
      buffer[offset++] = c1;
    } else if (c1 < 2048) {
      buffer[offset++] = (c1 >> 6) | 192;
      buffer[offset++] = (c1 & 63) | 128;
    } else if (
      (c1 & 64512) === 55296 &&
      ((c2 = string.charCodeAt(i + 1)) & 64512) === 56320
    ) {
      c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
      ++i;
      buffer[offset++] = (c1 >> 18) | 240;
      buffer[offset++] = ((c1 >> 12) & 63) | 128;
      buffer[offset++] = ((c1 >> 6) & 63) | 128;
      buffer[offset++] = (c1 & 63) | 128;
    } else {
      buffer[offset++] = (c1 >> 12) | 224;
      buffer[offset++] = ((c1 >> 6) & 63) | 128;
      buffer[offset++] = (c1 & 63) | 128;
    }
  }
  return buffer;
}
__name(utf8Array, "utf8Array");
var BASE64_CODE =
  "./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");
var BASE64_INDEX = [
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, 0, 1, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63,
  -1, -1, -1, -1, -1, -1, -1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, -1, -1, -1, -1, -1, -1, 28,
  29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
  48, 49, 50, 51, 52, 53, -1, -1, -1, -1, -1,
];
function base64_encode(b, len) {
  var off2 = 0,
    rs = [],
    c1,
    c2;
  if (len <= 0 || len > b.length) throw Error("Illegal len: " + len);
  while (off2 < len) {
    c1 = b[off2++] & 255;
    rs.push(BASE64_CODE[(c1 >> 2) & 63]);
    c1 = (c1 & 3) << 4;
    if (off2 >= len) {
      rs.push(BASE64_CODE[c1 & 63]);
      break;
    }
    c2 = b[off2++] & 255;
    c1 |= (c2 >> 4) & 15;
    rs.push(BASE64_CODE[c1 & 63]);
    c1 = (c2 & 15) << 2;
    if (off2 >= len) {
      rs.push(BASE64_CODE[c1 & 63]);
      break;
    }
    c2 = b[off2++] & 255;
    c1 |= (c2 >> 6) & 3;
    rs.push(BASE64_CODE[c1 & 63]);
    rs.push(BASE64_CODE[c2 & 63]);
  }
  return rs.join("");
}
__name(base64_encode, "base64_encode");
function base64_decode(s, len) {
  var off2 = 0,
    slen = s.length,
    olen = 0,
    rs = [],
    c1,
    c2,
    c3,
    c4,
    o,
    code;
  if (len <= 0) throw Error("Illegal len: " + len);
  while (off2 < slen - 1 && olen < len) {
    code = s.charCodeAt(off2++);
    c1 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    code = s.charCodeAt(off2++);
    c2 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    if (c1 == -1 || c2 == -1) break;
    o = (c1 << 2) >>> 0;
    o |= (c2 & 48) >> 4;
    rs.push(String.fromCharCode(o));
    if (++olen >= len || off2 >= slen) break;
    code = s.charCodeAt(off2++);
    c3 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    if (c3 == -1) break;
    o = ((c2 & 15) << 4) >>> 0;
    o |= (c3 & 60) >> 2;
    rs.push(String.fromCharCode(o));
    if (++olen >= len || off2 >= slen) break;
    code = s.charCodeAt(off2++);
    c4 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    o = ((c3 & 3) << 6) >>> 0;
    o |= c4;
    rs.push(String.fromCharCode(o));
    ++olen;
  }
  var res = [];
  for (off2 = 0; off2 < olen; off2++) res.push(rs[off2].charCodeAt(0));
  return res;
}
__name(base64_decode, "base64_decode");
var BCRYPT_SALT_LEN = 16;
var GENSALT_DEFAULT_LOG2_ROUNDS = 10;
var BLOWFISH_NUM_ROUNDS = 16;
var MAX_EXECUTION_TIME = 100;
var P_ORIG = [
  608135816, 2242054355, 320440878, 57701188, 2752067618, 698298832, 137296536,
  3964562569, 1160258022, 953160567, 3193202383, 887688300, 3232508343,
  3380367581, 1065670069, 3041331479, 2450970073, 2306472731,
];
var S_ORIG = [
  3509652390, 2564797868, 805139163, 3491422135, 3101798381, 1780907670,
  3128725573, 4046225305, 614570311, 3012652279, 134345442, 2240740374,
  1667834072, 1901547113, 2757295779, 4103290238, 227898511, 1921955416,
  1904987480, 2182433518, 2069144605, 3260701109, 2620446009, 720527379,
  3318853667, 677414384, 3393288472, 3101374703, 2390351024, 1614419982,
  1822297739, 2954791486, 3608508353, 3174124327, 2024746970, 1432378464,
  3864339955, 2857741204, 1464375394, 1676153920, 1439316330, 715854006,
  3033291828, 289532110, 2706671279, 2087905683, 3018724369, 1668267050,
  732546397, 1947742710, 3462151702, 2609353502, 2950085171, 1814351708,
  2050118529, 680887927, 999245976, 1800124847, 3300911131, 1713906067,
  1641548236, 4213287313, 1216130144, 1575780402, 4018429277, 3917837745,
  3693486850, 3949271944, 596196993, 3549867205, 258830323, 2213823033,
  772490370, 2760122372, 1774776394, 2652871518, 566650946, 4142492826,
  1728879713, 2882767088, 1783734482, 3629395816, 2517608232, 2874225571,
  1861159788, 326777828, 3124490320, 2130389656, 2716951837, 967770486,
  1724537150, 2185432712, 2364442137, 1164943284, 2105845187, 998989502,
  3765401048, 2244026483, 1075463327, 1455516326, 1322494562, 910128902,
  469688178, 1117454909, 936433444, 3490320968, 3675253459, 1240580251,
  122909385, 2157517691, 634681816, 4142456567, 3825094682, 3061402683,
  2540495037, 79693498, 3249098678, 1084186820, 1583128258, 426386531,
  1761308591, 1047286709, 322548459, 995290223, 1845252383, 2603652396,
  3431023940, 2942221577, 3202600964, 3727903485, 1712269319, 422464435,
  3234572375, 1170764815, 3523960633, 3117677531, 1434042557, 442511882,
  3600875718, 1076654713, 1738483198, 4213154764, 2393238008, 3677496056,
  1014306527, 4251020053, 793779912, 2902807211, 842905082, 4246964064,
  1395751752, 1040244610, 2656851899, 3396308128, 445077038, 3742853595,
  3577915638, 679411651, 2892444358, 2354009459, 1767581616, 3150600392,
  3791627101, 3102740896, 284835224, 4246832056, 1258075500, 768725851,
  2589189241, 3069724005, 3532540348, 1274779536, 3789419226, 2764799539,
  1660621633, 3471099624, 4011903706, 913787905, 3497959166, 737222580,
  2514213453, 2928710040, 3937242737, 1804850592, 3499020752, 2949064160,
  2386320175, 2390070455, 2415321851, 4061277028, 2290661394, 2416832540,
  1336762016, 1754252060, 3520065937, 3014181293, 791618072, 3188594551,
  3933548030, 2332172193, 3852520463, 3043980520, 413987798, 3465142937,
  3030929376, 4245938359, 2093235073, 3534596313, 375366246, 2157278981,
  2479649556, 555357303, 3870105701, 2008414854, 3344188149, 4221384143,
  3956125452, 2067696032, 3594591187, 2921233993, 2428461, 544322398, 577241275,
  1471733935, 610547355, 4027169054, 1432588573, 1507829418, 2025931657,
  3646575487, 545086370, 48609733, 2200306550, 1653985193, 298326376,
  1316178497, 3007786442, 2064951626, 458293330, 2589141269, 3591329599,
  3164325604, 727753846, 2179363840, 146436021, 1461446943, 4069977195,
  705550613, 3059967265, 3887724982, 4281599278, 3313849956, 1404054877,
  2845806497, 146425753, 1854211946, 1266315497, 3048417604, 3681880366,
  3289982499, 290971e4, 1235738493, 2632868024, 2414719590, 3970600049,
  1771706367, 1449415276, 3266420449, 422970021, 1963543593, 2690192192,
  3826793022, 1062508698, 1531092325, 1804592342, 2583117782, 2714934279,
  4024971509, 1294809318, 4028980673, 1289560198, 2221992742, 1669523910,
  35572830, 157838143, 1052438473, 1016535060, 1802137761, 1753167236,
  1386275462, 3080475397, 2857371447, 1040679964, 2145300060, 2390574316,
  1461121720, 2956646967, 4031777805, 4028374788, 33600511, 2920084762,
  1018524850, 629373528, 3691585981, 3515945977, 2091462646, 2486323059,
  586499841, 988145025, 935516892, 3367335476, 2599673255, 2839830854,
  265290510, 3972581182, 2759138881, 3795373465, 1005194799, 847297441,
  406762289, 1314163512, 1332590856, 1866599683, 4127851711, 750260880,
  613907577, 1450815602, 3165620655, 3734664991, 3650291728, 3012275730,
  3704569646, 1427272223, 778793252, 1343938022, 2676280711, 2052605720,
  1946737175, 3164576444, 3914038668, 3967478842, 3682934266, 1661551462,
  3294938066, 4011595847, 840292616, 3712170807, 616741398, 312560963,
  711312465, 1351876610, 322626781, 1910503582, 271666773, 2175563734,
  1594956187, 70604529, 3617834859, 1007753275, 1495573769, 4069517037,
  2549218298, 2663038764, 504708206, 2263041392, 3941167025, 2249088522,
  1514023603, 1998579484, 1312622330, 694541497, 2582060303, 2151582166,
  1382467621, 776784248, 2618340202, 3323268794, 2497899128, 2784771155,
  503983604, 4076293799, 907881277, 423175695, 432175456, 1378068232,
  4145222326, 3954048622, 3938656102, 3820766613, 2793130115, 2977904593,
  26017576, 3274890735, 3194772133, 1700274565, 1756076034, 4006520079,
  3677328699, 720338349, 1533947780, 354530856, 688349552, 3973924725,
  1637815568, 332179504, 3949051286, 53804574, 2852348879, 3044236432,
  1282449977, 3583942155, 3416972820, 4006381244, 1617046695, 2628476075,
  3002303598, 1686838959, 431878346, 2686675385, 1700445008, 1080580658,
  1009431731, 832498133, 3223435511, 2605976345, 2271191193, 2516031870,
  1648197032, 4164389018, 2548247927, 300782431, 375919233, 238389289,
  3353747414, 2531188641, 2019080857, 1475708069, 455242339, 2609103871,
  448939670, 3451063019, 1395535956, 2413381860, 1841049896, 1491858159,
  885456874, 4264095073, 4001119347, 1565136089, 3898914787, 1108368660,
  540939232, 1173283510, 2745871338, 3681308437, 4207628240, 3343053890,
  4016749493, 1699691293, 1103962373, 3625875870, 2256883143, 3830138730,
  1031889488, 3479347698, 1535977030, 4236805024, 3251091107, 2132092099,
  1774941330, 1199868427, 1452454533, 157007616, 2904115357, 342012276,
  595725824, 1480756522, 206960106, 497939518, 591360097, 863170706, 2375253569,
  3596610801, 1814182875, 2094937945, 3421402208, 1082520231, 3463918190,
  2785509508, 435703966, 3908032597, 1641649973, 2842273706, 3305899714,
  1510255612, 2148256476, 2655287854, 3276092548, 4258621189, 236887753,
  3681803219, 274041037, 1734335097, 3815195456, 3317970021, 1899903192,
  1026095262, 4050517792, 356393447, 2410691914, 3873677099, 3682840055,
  3913112168, 2491498743, 4132185628, 2489919796, 1091903735, 1979897079,
  3170134830, 3567386728, 3557303409, 857797738, 1136121015, 1342202287,
  507115054, 2535736646, 337727348, 3213592640, 1301675037, 2528481711,
  1895095763, 1721773893, 3216771564, 62756741, 2142006736, 835421444,
  2531993523, 1442658625, 3659876326, 2882144922, 676362277, 1392781812,
  170690266, 3921047035, 1759253602, 3611846912, 1745797284, 664899054,
  1329594018, 3901205900, 3045908486, 2062866102, 2865634940, 3543621612,
  3464012697, 1080764994, 553557557, 3656615353, 3996768171, 991055499,
  499776247, 1265440854, 648242737, 3940784050, 980351604, 3713745714,
  1749149687, 3396870395, 4211799374, 3640570775, 1161844396, 3125318951,
  1431517754, 545492359, 4268468663, 3499529547, 1437099964, 2702547544,
  3433638243, 2581715763, 2787789398, 1060185593, 1593081372, 2418618748,
  4260947970, 69676912, 2159744348, 86519011, 2512459080, 3838209314,
  1220612927, 3339683548, 133810670, 1090789135, 1078426020, 1569222167,
  845107691, 3583754449, 4072456591, 1091646820, 628848692, 1613405280,
  3757631651, 526609435, 236106946, 48312990, 2942717905, 3402727701,
  1797494240, 859738849, 992217954, 4005476642, 2243076622, 3870952857,
  3732016268, 765654824, 3490871365, 2511836413, 1685915746, 3888969200,
  1414112111, 2273134842, 3281911079, 4080962846, 172450625, 2569994100,
  980381355, 4109958455, 2819808352, 2716589560, 2568741196, 3681446669,
  3329971472, 1835478071, 660984891, 3704678404, 4045999559, 3422617507,
  3040415634, 1762651403, 1719377915, 3470491036, 2693910283, 3642056355,
  3138596744, 1364962596, 2073328063, 1983633131, 926494387, 3423689081,
  2150032023, 4096667949, 1749200295, 3328846651, 309677260, 2016342300,
  1779581495, 3079819751, 111262694, 1274766160, 443224088, 298511866,
  1025883608, 3806446537, 1145181785, 168956806, 3641502830, 3584813610,
  1689216846, 3666258015, 3200248200, 1692713982, 2646376535, 4042768518,
  1618508792, 1610833997, 3523052358, 4130873264, 2001055236, 3610705100,
  2202168115, 4028541809, 2961195399, 1006657119, 2006996926, 3186142756,
  1430667929, 3210227297, 1314452623, 4074634658, 4101304120, 2273951170,
  1399257539, 3367210612, 3027628629, 1190975929, 2062231137, 2333990788,
  2221543033, 2438960610, 1181637006, 548689776, 2362791313, 3372408396,
  3104550113, 3145860560, 296247880, 1970579870, 3078560182, 3769228297,
  1714227617, 3291629107, 3898220290, 166772364, 1251581989, 493813264,
  448347421, 195405023, 2709975567, 677966185, 3703036547, 1463355134,
  2715995803, 1338867538, 1343315457, 2802222074, 2684532164, 233230375,
  2599980071, 2000651841, 3277868038, 1638401717, 4028070440, 3237316320,
  6314154, 819756386, 300326615, 590932579, 1405279636, 3267499572, 3150704214,
  2428286686, 3959192993, 3461946742, 1862657033, 1266418056, 963775037,
  2089974820, 2263052895, 1917689273, 448879540, 3550394620, 3981727096,
  150775221, 3627908307, 1303187396, 508620638, 2975983352, 2726630617,
  1817252668, 1876281319, 1457606340, 908771278, 3720792119, 3617206836,
  2455994898, 1729034894, 1080033504, 976866871, 3556439503, 2881648439,
  1522871579, 1555064734, 1336096578, 3548522304, 2579274686, 3574697629,
  3205460757, 3593280638, 3338716283, 3079412587, 564236357, 2993598910,
  1781952180, 1464380207, 3163844217, 3332601554, 1699332808, 1393555694,
  1183702653, 3581086237, 1288719814, 691649499, 2847557200, 2895455976,
  3193889540, 2717570544, 1781354906, 1676643554, 2592534050, 3230253752,
  1126444790, 2770207658, 2633158820, 2210423226, 2615765581, 2414155088,
  3127139286, 673620729, 2805611233, 1269405062, 4015350505, 3341807571,
  4149409754, 1057255273, 2012875353, 2162469141, 2276492801, 2601117357,
  993977747, 3918593370, 2654263191, 753973209, 36408145, 2530585658, 25011837,
  3520020182, 2088578344, 530523599, 2918365339, 1524020338, 1518925132,
  3760827505, 3759777254, 1202760957, 3985898139, 3906192525, 674977740,
  4174734889, 2031300136, 2019492241, 3983892565, 4153806404, 3822280332,
  352677332, 2297720250, 60907813, 90501309, 3286998549, 1016092578, 2535922412,
  2839152426, 457141659, 509813237, 4120667899, 652014361, 1966332200,
  2975202805, 55981186, 2327461051, 676427537, 3255491064, 2882294119,
  3433927263, 1307055953, 942726286, 933058658, 2468411793, 3933900994,
  4215176142, 1361170020, 2001714738, 2830558078, 3274259782, 1222529897,
  1679025792, 2729314320, 3714953764, 1770335741, 151462246, 3013232138,
  1682292957, 1483529935, 471910574, 1539241949, 458788160, 3436315007,
  1807016891, 3718408830, 978976581, 1043663428, 3165965781, 1927990952,
  4200891579, 2372276910, 3208408903, 3533431907, 1412390302, 2931980059,
  4132332400, 1947078029, 3881505623, 4168226417, 2941484381, 1077988104,
  1320477388, 886195818, 18198404, 3786409e3, 2509781533, 112762804, 3463356488,
  1866414978, 891333506, 18488651, 661792760, 1628790961, 3885187036,
  3141171499, 876946877, 2693282273, 1372485963, 791857591, 2686433993,
  3759982718, 3167212022, 3472953795, 2716379847, 445679433, 3561995674,
  3504004811, 3574258232, 54117162, 3331405415, 2381918588, 3769707343,
  4154350007, 1140177722, 4074052095, 668550556, 3214352940, 367459370,
  261225585, 2610173221, 4209349473, 3468074219, 3265815641, 314222801,
  3066103646, 3808782860, 282218597, 3406013506, 3773591054, 379116347,
  1285071038, 846784868, 2669647154, 3771962079, 3550491691, 2305946142,
  453669953, 1268987020, 3317592352, 3279303384, 3744833421, 2610507566,
  3859509063, 266596637, 3847019092, 517658769, 3462560207, 3443424879,
  370717030, 4247526661, 2224018117, 4143653529, 4112773975, 2788324899,
  2477274417, 1456262402, 2901442914, 1517677493, 1846949527, 2295493580,
  3734397586, 2176403920, 1280348187, 1908823572, 3871786941, 846861322,
  1172426758, 3287448474, 3383383037, 1655181056, 3139813346, 901632758,
  1897031941, 2986607138, 3066810236, 3447102507, 1393639104, 373351379,
  950779232, 625454576, 3124240540, 4148612726, 2007998917, 544563296,
  2244738638, 2330496472, 2058025392, 1291430526, 424198748, 50039436, 29584100,
  3605783033, 2429876329, 2791104160, 1057563949, 3255363231, 3075367218,
  3463963227, 1469046755, 985887462,
];
var C_ORIG = [
  1332899944, 1700884034, 1701343084, 1684370003, 1668446532, 1869963892,
];
function _encipher(lr, off2, P, S) {
  var n,
    l = lr[off2],
    r = lr[off2 + 1];
  l ^= P[0];
  n = S[l >>> 24];
  n += S[256 | ((l >> 16) & 255)];
  n ^= S[512 | ((l >> 8) & 255)];
  n += S[768 | (l & 255)];
  r ^= n ^ P[1];
  n = S[r >>> 24];
  n += S[256 | ((r >> 16) & 255)];
  n ^= S[512 | ((r >> 8) & 255)];
  n += S[768 | (r & 255)];
  l ^= n ^ P[2];
  n = S[l >>> 24];
  n += S[256 | ((l >> 16) & 255)];
  n ^= S[512 | ((l >> 8) & 255)];
  n += S[768 | (l & 255)];
  r ^= n ^ P[3];
  n = S[r >>> 24];
  n += S[256 | ((r >> 16) & 255)];
  n ^= S[512 | ((r >> 8) & 255)];
  n += S[768 | (r & 255)];
  l ^= n ^ P[4];
  n = S[l >>> 24];
  n += S[256 | ((l >> 16) & 255)];
  n ^= S[512 | ((l >> 8) & 255)];
  n += S[768 | (l & 255)];
  r ^= n ^ P[5];
  n = S[r >>> 24];
  n += S[256 | ((r >> 16) & 255)];
  n ^= S[512 | ((r >> 8) & 255)];
  n += S[768 | (r & 255)];
  l ^= n ^ P[6];
  n = S[l >>> 24];
  n += S[256 | ((l >> 16) & 255)];
  n ^= S[512 | ((l >> 8) & 255)];
  n += S[768 | (l & 255)];
  r ^= n ^ P[7];
  n = S[r >>> 24];
  n += S[256 | ((r >> 16) & 255)];
  n ^= S[512 | ((r >> 8) & 255)];
  n += S[768 | (r & 255)];
  l ^= n ^ P[8];
  n = S[l >>> 24];
  n += S[256 | ((l >> 16) & 255)];
  n ^= S[512 | ((l >> 8) & 255)];
  n += S[768 | (l & 255)];
  r ^= n ^ P[9];
  n = S[r >>> 24];
  n += S[256 | ((r >> 16) & 255)];
  n ^= S[512 | ((r >> 8) & 255)];
  n += S[768 | (r & 255)];
  l ^= n ^ P[10];
  n = S[l >>> 24];
  n += S[256 | ((l >> 16) & 255)];
  n ^= S[512 | ((l >> 8) & 255)];
  n += S[768 | (l & 255)];
  r ^= n ^ P[11];
  n = S[r >>> 24];
  n += S[256 | ((r >> 16) & 255)];
  n ^= S[512 | ((r >> 8) & 255)];
  n += S[768 | (r & 255)];
  l ^= n ^ P[12];
  n = S[l >>> 24];
  n += S[256 | ((l >> 16) & 255)];
  n ^= S[512 | ((l >> 8) & 255)];
  n += S[768 | (l & 255)];
  r ^= n ^ P[13];
  n = S[r >>> 24];
  n += S[256 | ((r >> 16) & 255)];
  n ^= S[512 | ((r >> 8) & 255)];
  n += S[768 | (r & 255)];
  l ^= n ^ P[14];
  n = S[l >>> 24];
  n += S[256 | ((l >> 16) & 255)];
  n ^= S[512 | ((l >> 8) & 255)];
  n += S[768 | (l & 255)];
  r ^= n ^ P[15];
  n = S[r >>> 24];
  n += S[256 | ((r >> 16) & 255)];
  n ^= S[512 | ((r >> 8) & 255)];
  n += S[768 | (r & 255)];
  l ^= n ^ P[16];
  lr[off2] = r ^ P[BLOWFISH_NUM_ROUNDS + 1];
  lr[off2 + 1] = l;
  return lr;
}
__name(_encipher, "_encipher");
function _streamtoword(data, offp) {
  for (var i = 0, word = 0; i < 4; ++i)
    ((word = (word << 8) | (data[offp] & 255)),
      (offp = (offp + 1) % data.length));
  return { key: word, offp };
}
__name(_streamtoword, "_streamtoword");
function _key(key, P, S) {
  var offset = 0,
    lr = [0, 0],
    plen = P.length,
    slen = S.length,
    sw;
  for (var i = 0; i < plen; i++)
    ((sw = _streamtoword(key, offset)),
      (offset = sw.offp),
      (P[i] = P[i] ^ sw.key));
  for (i = 0; i < plen; i += 2)
    ((lr = _encipher(lr, 0, P, S)), (P[i] = lr[0]), (P[i + 1] = lr[1]));
  for (i = 0; i < slen; i += 2)
    ((lr = _encipher(lr, 0, P, S)), (S[i] = lr[0]), (S[i + 1] = lr[1]));
}
__name(_key, "_key");
function _ekskey(data, key, P, S) {
  var offp = 0,
    lr = [0, 0],
    plen = P.length,
    slen = S.length,
    sw;
  for (var i = 0; i < plen; i++)
    ((sw = _streamtoword(key, offp)), (offp = sw.offp), (P[i] = P[i] ^ sw.key));
  offp = 0;
  for (i = 0; i < plen; i += 2)
    ((sw = _streamtoword(data, offp)),
      (offp = sw.offp),
      (lr[0] ^= sw.key),
      (sw = _streamtoword(data, offp)),
      (offp = sw.offp),
      (lr[1] ^= sw.key),
      (lr = _encipher(lr, 0, P, S)),
      (P[i] = lr[0]),
      (P[i + 1] = lr[1]));
  for (i = 0; i < slen; i += 2)
    ((sw = _streamtoword(data, offp)),
      (offp = sw.offp),
      (lr[0] ^= sw.key),
      (sw = _streamtoword(data, offp)),
      (offp = sw.offp),
      (lr[1] ^= sw.key),
      (lr = _encipher(lr, 0, P, S)),
      (S[i] = lr[0]),
      (S[i + 1] = lr[1]));
}
__name(_ekskey, "_ekskey");
function _crypt(b, salt, rounds, callback, progressCallback) {
  var cdata = C_ORIG.slice(),
    clen = cdata.length,
    err;
  if (rounds < 4 || rounds > 31) {
    err = Error("Illegal number of rounds (4-31): " + rounds);
    if (callback) {
      nextTick2(callback.bind(this, err));
      return;
    } else throw err;
  }
  if (salt.length !== BCRYPT_SALT_LEN) {
    err = Error(
      "Illegal salt length: " + salt.length + " != " + BCRYPT_SALT_LEN,
    );
    if (callback) {
      nextTick2(callback.bind(this, err));
      return;
    } else throw err;
  }
  rounds = (1 << rounds) >>> 0;
  var P,
    S,
    i = 0,
    j;
  if (typeof Int32Array === "function") {
    P = new Int32Array(P_ORIG);
    S = new Int32Array(S_ORIG);
  } else {
    P = P_ORIG.slice();
    S = S_ORIG.slice();
  }
  _ekskey(salt, b, P, S);
  function next() {
    if (progressCallback) progressCallback(i / rounds);
    if (i < rounds) {
      var start = Date.now();
      for (; i < rounds; ) {
        i = i + 1;
        _key(b, P, S);
        _key(salt, P, S);
        if (Date.now() - start > MAX_EXECUTION_TIME) break;
      }
    } else {
      for (i = 0; i < 64; i++)
        for (j = 0; j < clen >> 1; j++) _encipher(cdata, j << 1, P, S);
      var ret = [];
      for (i = 0; i < clen; i++)
        (ret.push(((cdata[i] >> 24) & 255) >>> 0),
          ret.push(((cdata[i] >> 16) & 255) >>> 0),
          ret.push(((cdata[i] >> 8) & 255) >>> 0),
          ret.push((cdata[i] & 255) >>> 0));
      if (callback) {
        callback(null, ret);
        return;
      } else return ret;
    }
    if (callback) nextTick2(next);
  }
  __name(next, "next");
  if (typeof callback !== "undefined") {
    next();
  } else {
    var res;
    while (true) if (typeof (res = next()) !== "undefined") return res || [];
  }
}
__name(_crypt, "_crypt");
function _hash(password, salt, callback, progressCallback) {
  var err;
  if (typeof password !== "string" || typeof salt !== "string") {
    err = Error("Invalid string / salt: Not a string");
    if (callback) {
      nextTick2(callback.bind(this, err));
      return;
    } else throw err;
  }
  var minor, offset;
  if (salt.charAt(0) !== "$" || salt.charAt(1) !== "2") {
    err = Error("Invalid salt version: " + salt.substring(0, 2));
    if (callback) {
      nextTick2(callback.bind(this, err));
      return;
    } else throw err;
  }
  if (salt.charAt(2) === "$") ((minor = String.fromCharCode(0)), (offset = 3));
  else {
    minor = salt.charAt(2);
    if (
      (minor !== "a" && minor !== "b" && minor !== "y") ||
      salt.charAt(3) !== "$"
    ) {
      err = Error("Invalid salt revision: " + salt.substring(2, 4));
      if (callback) {
        nextTick2(callback.bind(this, err));
        return;
      } else throw err;
    }
    offset = 4;
  }
  if (salt.charAt(offset + 2) > "$") {
    err = Error("Missing salt rounds");
    if (callback) {
      nextTick2(callback.bind(this, err));
      return;
    } else throw err;
  }
  var r1 = parseInt(salt.substring(offset, offset + 1), 10) * 10,
    r2 = parseInt(salt.substring(offset + 1, offset + 2), 10),
    rounds = r1 + r2,
    real_salt = salt.substring(offset + 3, offset + 25);
  password += minor >= "a" ? "\0" : "";
  var passwordb = utf8Array(password),
    saltb = base64_decode(real_salt, BCRYPT_SALT_LEN);
  function finish(bytes) {
    var res = [];
    res.push("$2");
    if (minor >= "a") res.push(minor);
    res.push("$");
    if (rounds < 10) res.push("0");
    res.push(rounds.toString());
    res.push("$");
    res.push(base64_encode(saltb, saltb.length));
    res.push(base64_encode(bytes, C_ORIG.length * 4 - 1));
    return res.join("");
  }
  __name(finish, "finish");
  if (typeof callback == "undefined")
    return finish(_crypt(passwordb, saltb, rounds));
  else {
    _crypt(
      passwordb,
      saltb,
      rounds,
      function (err2, bytes) {
        if (err2) callback(err2, null);
        else callback(null, finish(bytes));
      },
      progressCallback,
    );
  }
}
__name(_hash, "_hash");
function encodeBase64(bytes, length) {
  return base64_encode(bytes, length);
}
__name(encodeBase64, "encodeBase64");
function decodeBase64(string, length) {
  return base64_decode(string, length);
}
__name(decodeBase64, "decodeBase64");
var bcryptjs_default = {
  setRandomFallback,
  genSaltSync,
  genSalt,
  hashSync,
  hash: hash2,
  compareSync,
  compare,
  getRounds,
  getSalt,
  truncates,
  encodeBase64,
  decodeBase64,
};

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
  const signature = await sign2(`${encodedHeader}.${encodedPayload}`, secret);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}
__name(createJWT, "createJWT");
async function verifyJWT(token, secret) {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split(".");
    if (!encodedHeader || !encodedPayload || !signature) {
      throw new Error("Invalid token format");
    }
    const expectedSignature = await sign2(
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
async function sign2(data, secret) {
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
__name(sign2, "sign");
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
  const saltRounds = 10;
  return await bcryptjs_default.hash(password, saltRounds);
}
__name(hashPassword, "hashPassword");
async function verifyPassword(password, hash3) {
  return await bcryptjs_default.compare(password, hash3);
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
      return { success: false, message: "Authorization token required" };
    }
    const payload = await verifyJWT(token, env2.JWT_SECRET);
    const session = await env2.DB.prepare(
      'SELECT s.*, u.username, u.email, u.role, u.is_active FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.is_active = 1 AND s.expires_at > datetime("now")',
    )
      .bind(payload.sessionId)
      .first();
    if (!session) {
      return { success: false, message: "Invalid or expired session" };
    }
    if (!session.is_active) {
      return { success: false, message: "User account is inactive" };
    }
    request.user = {
      id: session.user_id,
      username: session.username,
      email: session.email,
      role: session.role,
      sessionId: session.id,
    };
    return { success: true, userId: session.user_id, user: request.user };
  } catch (error3) {
    console.error("Auth middleware error:", error3);
    return { success: false, message: "Invalid token" };
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
    const result = await env2.DB.prepare(
      'INSERT INTO users (username, email, password_hash, role, is_active, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))',
    )
      .bind(userData.username, userData.email, hashedPassword, "user", 1)
      .run();
    const userId = result.meta.last_row_id;
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
    console.log("Password verification starting...");
    console.log("Plain password from frontend:", loginData.password);
    console.log("Hashed password from DB:", user.password_hash);
    const isValidPassword = await verifyPassword(
      loginData.password,
      user.password_hash,
    );
    console.log("Password validation result:", isValidPassword);
    if (!isValidPassword) {
      console.log("Password verification failed.");
      return errorResponse("Invalid credentials", 401);
    }
    console.log("Password verification successful.");
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
async function handleVerify(request, env2) {
  try {
    const authResult = await authMiddleware(request, env2);
    if (!authResult.success) {
      return errorResponse(authResult.message, 401);
    }
    const user = await env2.DB.prepare(
      "SELECT id, username, email, role, is_active, created_at, last_login FROM users WHERE id = ?",
    )
      .bind(authResult.userId)
      .first();
    if (!user) {
      return errorResponse("User not found", 404);
    }
    return successResponse("Token verified", { user });
  } catch (error3) {
    console.error("Verify error:", error3);
    return serverErrorResponse("Token verification failed");
  }
}
__name(handleVerify, "handleVerify");
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
      } else if (path === "/auth/verify" && method === "GET") {
        response = await handleVerify(request, env2);
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

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
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

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
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

// .wrangler/tmp/bundle-SweE9s/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default,
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
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

// .wrangler/tmp/bundle-SweE9s/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
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
    #fetchDispatcher = (request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {},
        );
        return super.scheduled(controller);
      }
    };
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
