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
const mockUserId = new mongoose_1.default.Types.ObjectId();
const mockToken = jsonwebtoken_1.default.sign({ id: mockUserId.toString(), email: "email_string" }, process.env.JWT_SECRET);
describe("Analytics Routes", () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield User_1.default.create({
            _id: mockUserId,
            displayName: "anon_string",
            email: "email_string",
            googleId: "google_anon_id",
        });
        const url = yield Url_1.default.create({
            alias: "a1osd",
            clickByDates: [
                { date: { day: 1, month: 1, year: 2024 }, clicks: 10 },
                { date: { day: 2, month: 1, year: 2024 }, clicks: 20 },
            ],
            clicks: 100,
            longUrl: "https://example.com/longurltesturl23123weq",
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
    describe("GET /api/analytics/topic/:topic", () => {
        it("should return analytics for a specific topic", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.app)
                .get("/api/analytics/topic/retention")
                .set("Authorization", `Bearer ${mockToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("clicksByDate");
            expect(res.body).toHaveProperty("totalClicks", 100);
            expect(res.body).toHaveProperty("uniqueClicks", 50);
            expect(res.body).toHaveProperty("urls");
        }));
        it("should return 404 if no data is found for the topic", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.app)
                .get("/api/analytics/topic/acquisition")
                .set("Authorization", `Bearer ${mockToken}`);
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Data Not found");
        }));
    });
    describe("GET /api/analytics/overall", () => {
        it("should return overall analytics for the user", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.app)
                .get("/api/analytics/overall")
                .set("Authorization", `Bearer ${mockToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("totalClicks", 100);
            expect(res.body).toHaveProperty("totalUrls", 1);
            expect(res.body).toHaveProperty("uniqueClicks", 50);
            expect(res.body).toHaveProperty("clicksByDate");
            expect(res.body).toHaveProperty("osType");
            expect(res.body).toHaveProperty("deviceType");
        }));
        it("should return 404 if no URLs are found for the user", () => __awaiter(void 0, void 0, void 0, function* () {
            const anotherUserId = new mongoose_1.default.Types.ObjectId();
            const anotherToken = jsonwebtoken_1.default.sign(anotherUserId.toString(), process.env.JWT_SECRET);
            const res = yield (0, supertest_1.default)(app_1.app)
                .get("/api/analytics/overall")
                .set("Authorization", `Bearer ${anotherToken}`);
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Data Not found");
        }));
    });
    describe("GET /api/analytics/:alias", () => {
        it("should return data for a specific alias", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.app)
                .get("/api/analytics/a1osd")
                .set("Authorization", `Bearer ${mockToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("aliasData");
            expect(res.body.aliasData).toHaveProperty("alias", "a1osd");
        }));
        it("should return 404 if alias is not found", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.app)
                .get("/api/analytics/re34h")
                .set("Authorization", `Bearer ${mockToken}`);
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("URL data not found");
        }));
    });
    describe("Error Handling", () => {
        // afterEach(() => {
        //   jest.restoreAllMocks();
        // });
        it("should return 401 if the token is missing", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.app).get("/api/analytics/topic/retention");
            expect(res.status).toBe(401);
            expect(res.body.message).toBe("Unauthorized");
        }));
        it("should return 500 for internal server errors", () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(Url_1.default, "aggregate").mockImplementationOnce(() => {
                throw new Error("Test Error");
            });
            const res = yield (0, supertest_1.default)(app_1.app)
                .get("/api/analytics/topic/acquisition")
                .set("Authorization", `Bearer ${mockToken}`);
            expect(res.status).toBe(500);
            expect(res.body.message).toBe("Server Error");
        }));
    });
});
//# sourceMappingURL=analytics.test.js.map