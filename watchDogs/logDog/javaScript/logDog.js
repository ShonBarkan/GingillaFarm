const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// --- PATH INITIALIZATION ---
const FARM_ROOT = process.env.FARM_ROOT_PATH || __dirname;
const LOG_DIR = path.join(FARM_ROOT, 'farm_logs');

// Create directory if not exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

// --- UI CONSTANTS ---
const STATUS_WIDTH = 11;
const PROJECT_LIMIT = 11;
const CONTEXT_LIMIT = 11;
const SUMMARY_LIMIT = 25;

// --- COLOR CONFIG ---
const COLORS = {
    debug: '\x1b[94m',
    info: '\x1b[92m',
    warn: '\x1b[93m',
    error: '\x1b[91m',
    critical: '\x1b[41m',
    reset: '\x1b[0m'
};

const dogFormat = winston.format.printf(({ level, message, project_name, traceID, context, ...extras }) => {
    const logTime = new Date().toLocaleTimeString('en-GB', { hour12: false });

    // 1. Status Block (Centered & Colored)
    const upperLevel = level.toUpperCase();
    const color = COLORS[level] || COLORS.reset;
    const statusText = upperLevel.padStart(Math.floor((STATUS_WIDTH + upperLevel.length) / 2)).padEnd(STATUS_WIDTH);
    const coloredStatus = `${color}[${statusText}]${COLORS.reset}`;

    // 2. Project Name (Fixed Width)
    const proj = project_name || 'Unknown';
    const fmtProj = proj.length > PROJECT_LIMIT ? proj.substring(0, PROJECT_LIMIT - 2) + '..' : proj.padEnd(PROJECT_LIMIT);

    // 3. Context Tag (Centered)
    const ctx = context || '---';
    const fmtCtx = ctx.length > CONTEXT_LIMIT ? ctx.substring(0, CONTEXT_LIMIT - 2) + '..' :
                  ctx.padStart(Math.floor((CONTEXT_LIMIT + ctx.length) / 2)).padEnd(CONTEXT_LIMIT);

    // 4. Summary Message
    const sumMsg = message.length > SUMMARY_LIMIT ? message.substring(0, SUMMARY_LIMIT - 3) + '...' : message.padEnd(SUMMARY_LIMIT);

    // 5. Metadata Assembly
    const metadata = {
        traceID: traceID || 'N/A',
        context: ctx,
        project: proj,
        message: message
    };
    if (Object.keys(extras).length > 0) metadata.details = extras;

    return `${coloredStatus}[${logTime}][${fmtProj}][${fmtCtx}] ${sumMsg}, ${JSON.stringify(metadata)}`;
});

const setupLogDog = (projectName) => {
    return winston.createLogger({
        level: 'debug',
        levels: { critical: 0, error: 1, warn: 2, info: 3, debug: 4 },
        format: winston.format.combine(
            winston.format((info) => { info.project_name = projectName; return info; })(),
            dogFormat
        ),
        transports: [
            // 1. Console Output
            new winston.transports.Console(),
            // 2. Daily File Output
            new winston.transports.DailyRotateFile({
                dirname: LOG_DIR,
                filename: `logs-%DATE%.log`,
                datePattern: 'YYYY-MM-DD',
                maxFiles: '14d'
            })
        ]
    });
};

// --- EXAMPLES ---
if (require.main === module) {
    console.log("*".repeat(50));
    console.log(`Log Directory: ${LOG_DIR}`);
    console.log("*".repeat(50));

    const dog = setupLogDog("Skyscraper");

    // 1. API - GET
    dog.info("User fetched quiz list", { traceID: 'req-101', context: 'GET' });

    // 2. React - Component
    dog.debug("Option 'B' selected", { traceID: 'ui-45', context: 'QuizCard' });

    // 3. Database
    dog.warn("Query took 1.2 seconds", { traceID: 'db-99', context: 'Postgres', table: 'questions' });

    // 4. Security
    dog.error("Invalid credentials", { traceID: 'sec-00', context: 'AuthGuard', ip: '1.2.3.4' });

    // 5. Docker
    dog.log('critical', "Container stopped", { traceID: 'sys-1', context: 'Docker', container: 'pi-hole' });

    // 6. State Update
    dog.info("Score updated: 85%", { traceID: 'ui-46', context: 'ScoreBoard', user: 'Itai' });

    // 7. API - POST
    dog.info("New quiz created", { traceID: 'req-102', context: 'POST', quiz_id: 505 });

    // 8. Background
    dog.debug("Log rotation complete", { traceID: 'maint-1', context: 'CleanDog', deleted_files: 12 });

    // 9. Nextcloud
    dog.warn("File locked by user", { traceID: 'cloud-2', context: 'Nextcloud', file: 'config.php' });

    // 10. Long Message
    dog.info("This is a test of the automatic truncation logic for long strings", { traceID: 'test-long', context: 'TestRunner' });
}

module.exports = setupLogDog;