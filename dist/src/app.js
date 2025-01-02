"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
dotenv_1.default.config();
exports.app = (0, express_1.default)();
const routes_1 = require("./routes");
const swagger_output_json_1 = __importDefault(require("./swagger-output.json"));
// Ensure log files and directories exist
const logDir = path_1.default.join(__dirname, "logs");
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir);
}
["errors.log", "operations.log", "process.log"].forEach((file) => {
    const filePath = path_1.default.join(logDir, file);
    if (!fs_1.default.existsSync(filePath)) {
        fs_1.default.writeFileSync(filePath, "", "utf8");
    }
});
const operationsStream = fs_1.default.createWriteStream(path_1.default.join(__dirname, "logs", "operations.log"), { flags: "a" });
exports.app.use((0, morgan_1.default)("combined", { stream: operationsStream }));
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.urlencoded({ extended: true }));
const corsOptions = {
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    origin: "http://localhost:3000",
};
exports.app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            "connect-src": ["'self'", "https://*"],
            "default-src": ["'self'", "*"],
        },
    },
}));
exports.app.use((0, cors_1.default)(corsOptions));
exports.app.use((0, cookie_parser_1.default)());
exports.app.use("/api-docs", express_1.default.static(path_1.default.join(__dirname, "public")));
exports.app.use("/", routes_1.routes);
exports.app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_output_json_1.default, {
    customJs: "/api-docs/swagger-custom.js",
}));
//# sourceMappingURL=app.js.map