"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../app");
const Url_1 = __importDefault(require("../models/Url"));
const User_1 = __importDefault(require("../models/User"));
const UserUrl_1 = __importDefault(require("../models/UserUrl"));
jest.mock("../logger");
const logger_1 = require("../logger");
const mockUserId = new mongoose_1.default.Types.ObjectId();
const mockToken = jsonwebtoken_1.default.sign({ id: mockUserId.toString(), email: "email_string" }, process.env.JWT_SECRET);
describe("URL Shortener Routes", () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield User_1.default.create({
            _id: mockUserId,
            displayName: "anon_string_y",
            email: "email_string_y",
            googleId: "google_anon_id_y",
        });
        const url = yield Url_1.default.create({
            alias: "b2d7g",
            clickByDates: [
                { date: { day: 1, month: 1, year: 2024 }, clicks: 10 },
                { date: { day: 2, month: 1, year: 2024 }, clicks: 20 },
            ],
            clicks: 100,
            longUrl: "https://example.com/longurltesturl",
            topic: "retention",
            uniqueClicks: 50,
            userId: mockUserId,
        });
        yield UserUrl_1.default.create({
            userId: mockUserId,
            userUrls: [url],
        });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield Url_1.default.deleteMany({});
        yield User_1.default.deleteMany({});
        yield UserUrl_1.default.deleteMany({});
    }));
    describe("POST /api/shorten", () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });
        it("should return 403 for validation errors", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .post("/api/shorten")
                .set("Authorization", `Bearer ${mockToken}`)
                .send({
                alias: "_dsf9",
                longUrl: "https:/redissdjf;/asdfidslfjlweds?qeuyr=dfsa",
                topic: "retention",
            });
            expect(response.status).toBe(403);
            expect(response.body.message).toBe("Validation Error");
            expect(logger_1.logger.error).toHaveBeenCalledWith(expect.stringContaining("Validation Error"));
        }));
        it("should return 500 for server errors", () => __awaiter(void 0, void 0, void 0, function* () {
            jest
                .spyOn(mongoose_1.default.Model, "findOneAndUpdate")
                .mockRejectedValue(new Error("DB Error"));
            jest
                .spyOn(mongoose_1.default.Model, "create")
                .mockRejectedValue(new Error("DB Error"));
            const response = yield (0, supertest_1.default)(app_1.app)
                .post("/api/shorten")
                .set("Authorization", `Bearer ${mockToken}`)
                .send({
                alias: "al8s",
                longUrl: "http://example.com/sadfd/sdfdsfew",
                topic: "retention",
            });
            expect(response.status).toBe(500);
            expect(response.body.message).toBe("Server Error");
            expect(logger_1.logger.error).toHaveBeenCalledWith(expect.stringContaining("Internal Server Error"));
        }));
    });
    describe("GET /api/shorten/:alias", () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });
        it("should return 500 for server errors", () => __awaiter(void 0, void 0, void 0, function* () {
            jest
                .spyOn(mongoose_1.default.Model, "findOneAndUpdate")
                .mockRejectedValue(new Error("DB Error"));
            const response = yield (0, supertest_1.default)(app_1.app).get("/api/shorten/testalias");
            expect(response.status).toBe(500);
            expect(response.body.message).toBe("Server Error");
            expect(logger_1.logger.error).toHaveBeenCalledWith(expect.stringContaining("Internal Server Error"));
        }));
        it("should return 404 for non-existent alias", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app).get("/api/shorten/a2lie");
            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Alias not found");
        }));
    });
});
//# sourceMappingURL=url.test.js.map