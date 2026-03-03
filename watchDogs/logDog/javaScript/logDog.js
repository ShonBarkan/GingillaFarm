import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { z } from 'zod';
import dotenv from 'dotenv';
import { blue, cyan, green, yellow, red, bgRed, white, reset } from 'colorette';

dotenv.config();

// --- PATH INITIALIZATION ---
const FARM_ROOT = process.env.FARM_ROOT_PATH || "./";
const LOG_DIR = path.join(FARM_ROOT, "farm_logs");

// --- CUSTOM LOG LEVELS ---
const customLevels = {
  levels: {
    critical: 0,
    error: 1,
    warning: 2,
    success: 3, // Custom level
    info: 4,
    debug: 5,
  },
  colors: {
    critical: 'bgRed',
    error: 'red',
    warning: 'yellow',
    success: 'green',
    info: 'cyan',
    debug: 'blue',
  }
};

// --- DATA MODELS (The Farm Guardrails via Zod) ---
const BaseLogSchema = z.object({
  context: z.string().default("---"),
  traceID: z.string().optional(),
});

const TestLogSchema = BaseLogSchema.extend({
  test_name: z.string(),
  file_name: z.string(),
  expected: z.any().default("N/A"),
  got: z.any().default("N/A"),
});

const APILogSchema = BaseLogSchema.extend({
  method: z.string(),
  endpoint: z.string(),
  status_code: z.number().optional(),
  traceID: z.string(),
});

// --- FORMATTER LOGIC ---
const STATUS_WIDTH = 12;
const PROJECT_LIMIT = 12;
const CONTEXT_LIMIT = 12;
const TRACE_WIDTH = 12;
const SUMMARY_LIMIT = 25;

const colorMap = {
  debug: blue,
  info: cyan,
  success: green,
  warning: yellow,
  error: red,
  critical: (str) => bgRed(white(str)),
};

const farmFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  const projectName = metadata.projectName || "Unknown";
  const logType = metadata.logType || "default";

  // Padding & Truncating
  const fmtProj = `[${projectName.substring(0, PROJECT_LIMIT).padEnd(PROJECT_LIMIT)}]`;
  const colorizer = colorMap[level] || reset;
  const status = colorizer(`[${level.toUpperCase().padEnd(STATUS_WIDTH)}]`);
  const logTime = timestamp.split('T')[1].split('.')[0]; // HH:mm:ss
  const fileName = metadata.file_name || "main.js";

  let baseLine = "";
  const tid = metadata.traceID || "----------";
  const fmtTid = `[${tid.padEnd(TRACE_WIDTH)}]`;

  // Type-Specific Formatting
  if (logType === "test") {
    const result = TestLogSchema.safeParse(metadata);
    if (result.success) {
      const data = result.data;
      baseLine = `${status}[${logTime}]${fmtProj}${fmtTid}[${fileName}][TEST:${data.test_name}] ${message}`;
      if (!['info', 'success'].includes(level)) {
        baseLine += ` | Expected: ${data.expected} | Got: ${data.got}`;
      }
    }
  } else if (logType === "api") {
    const result = APILogSchema.safeParse(metadata);
    if (result.success) {
      const data = result.data;
      baseLine = `${status}[${logTime}]${fmtProj}${fmtTid}[${fileName}][${data.method}][${data.endpoint}] (${data.status_code || '??'}) ${message}`;
    }
  }

  // Default fallback
  if (!baseLine) {
    const ctx = (metadata.context || "---").toString();
    const fmtCtx = ctx.length > CONTEXT_LIMIT ? `${ctx.substring(0, CONTEXT_LIMIT - 3)}...` : ctx.padEnd(CONTEXT_LIMIT);
    const sumMsg = message.length > SUMMARY_LIMIT ? `${message.substring(0, SUMMARY_LIMIT - 3)}...` : message.padEnd(SUMMARY_LIMIT);
    baseLine = `${status}[${logTime}]${fmtProj}${fmtTid}[${fileName}][${fmtCtx}] ${sumMsg}`;
  }

  // Clean metadata from internal keys before stringifying extra JSON
  const { projectName: _, logType: __, file_name: ___, traceID: ____, context: _____, ...extra } = metadata;
  const extraJson = Object.keys(extra).length ? ` ${JSON.stringify(extra)}` : "";

  return `${baseLine}${extraJson}`;
});

// --- SETUP FUNCTION ---
export function setupLogDog(projectName, logType = "default") {
  return winston.createLogger({
    levels: customLevels.levels,
    level: 'debug',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
      farmFormat
    ),
    defaultMeta: { projectName, logType },
    transports: [
      new winston.transports.Console(),
      new DailyRotateFile({
        dirname: LOG_DIR,
        filename: 'logs-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d'
      })
    ]
  });
}

// --- DEMO ---
const dog = setupLogDog("Gingilla");
dog.success("Database connection established", { traceID: 'DB-INIT', context: 'Postgres', pool_size: 10 });
dog.info("Monitoring system heartbeat", { traceID: 'SYS-HBT', context: 'Grafana', uptime: '48h' });

const apiDog = setupLogDog("Gingilla", "api");
apiDog.info("Fetching carrot data", { traceID: 'REQ-777', method: 'GET', endpoint: '/farm/carrots', user_id: 42 });

const testDog = setupLogDog("Gingilla", "test");
testDog.error("Assertion Error in math module", {
    test_name: 'MATH_ADD',
    file_name: 'test_core.js',
    expected: 4,
    got: 5,
    traceID: 'TEST-02'
});