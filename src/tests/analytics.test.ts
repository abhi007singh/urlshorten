import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../app";
import Url from "../models/Url";
import User from "../models/User";
import UserUrl from "../models/UserUrl";

jest.mock("../logger");
import { logger } from "../logger";

const mockUserId = new mongoose.Types.ObjectId();
const mockToken = jwt.sign(
  { id: mockUserId.toString(), email: "email_string" },
  "temp_jwt_secret"
);

describe("Analytics Routes", () => {
  beforeAll(async () => {
    await User.create({
      _id: mockUserId,
      displayName: "anon_string",
      email: "email_string",
      googleId: "google_anon_id",
    });
    const url = await Url.create({
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
    await UserUrl.create({
      userId: mockUserId,
      userUrls: [url],
    });
  });

  afterAll(async () => {
    await Url.deleteMany({});
    await User.deleteMany({});
    await UserUrl.deleteMany({});
  });
  describe("GET /api/analytics/topic/:topic", () => {
    it("should return analytics for a specific topic", async () => {
      const res = await request(app)
        .get("/api/analytics/topic/retention")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("clicksByDate");
      expect(res.body).toHaveProperty("totalClicks", 100);
      expect(res.body).toHaveProperty("uniqueClicks", 50);
      expect(res.body).toHaveProperty("urls");
    });

    it("should return 404 if no data is found for the topic", async () => {
      const res = await request(app)
        .get("/api/analytics/topic/acquisition")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Data Not found");
    });
  });

  describe("GET /api/analytics/overall", () => {
    it("should return overall analytics for the user", async () => {
      const res = await request(app)
        .get("/api/analytics/overall")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("totalClicks", 100);
      expect(res.body).toHaveProperty("totalUrls", 1);
      expect(res.body).toHaveProperty("uniqueClicks", 50);
      expect(res.body).toHaveProperty("clicksByDate");
      expect(res.body).toHaveProperty("osType");
      expect(res.body).toHaveProperty("deviceType");
    });

    it("should return 404 if no URLs are found for the user", async () => {
      const anotherUserId = new mongoose.Types.ObjectId();
      const anotherToken = jwt.sign(
        anotherUserId.toString(),
        "temp_jwt_secret"
      );

      const res = await request(app)
        .get("/api/analytics/overall")
        .set("Authorization", `Bearer ${anotherToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Data Not found");
    });
  });

  describe("GET /api/analytics/:alias", () => {
    it("should return data for a specific alias", async () => {
      const res = await request(app)
        .get("/api/analytics/a1osd")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("aliasData");
      expect(res.body.aliasData).toHaveProperty("alias", "a1osd");
    });

    it("should return 404 if alias is not found", async () => {
      const res = await request(app)
        .get("/api/analytics/re34h")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("URL data not found");
    });
  });

  describe("Error Handling", () => {
    // afterEach(() => {
    //   jest.restoreAllMocks();
    // });
    it("should return 401 if the token is missing", async () => {
      const res = await request(app).get("/api/analytics/topic/retention");

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Unauthorized");
    });

    it("should return 500 for internal server errors", async () => {
      jest.spyOn(Url, "aggregate").mockImplementationOnce(() => {
        throw new Error("Test Error");
      });

      const res = await request(app)
        .get("/api/analytics/topic/acquisition")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Server Error");
    });
  });
});
