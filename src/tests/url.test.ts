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
  "temp_jwt"
);

describe("URL Shortener Routes", () => {
  beforeAll(async () => {
    await User.create({
      _id: mockUserId,
      displayName: "anon_string_y",
      email: "email_string_y",
      googleId: "google_anon_id_y",
    });
    const url = await Url.create({
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
  describe("POST /api/shorten", () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it("should return 403 for validation errors", async () => {
      const response = await request(app)
        .post("/api/shorten")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({
          alias: "_dsf9",
          longUrl: "https:/redissdjf;/asdfidslfjlweds?qeuyr=dfsa",
          topic: "retention",
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("Validation Error");
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Validation Error")
      );
    });

    it("should return 500 for server errors", async () => {
      jest
        .spyOn(mongoose.Model, "findOneAndUpdate")
        .mockRejectedValue(new Error("DB Error"));
      jest
        .spyOn(mongoose.Model, "create")
        .mockRejectedValue(new Error("DB Error"));

      const response = await request(app)
        .post("/api/shorten")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({
          alias: "al8s",
          longUrl: "http://example.com/sadfd/sdfdsfew",
          topic: "retention",
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Server Error");
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Internal Server Error")
      );
    });
  });

  describe("GET /api/shorten/:alias", () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it("should return 500 for server errors", async () => {
      jest
        .spyOn(mongoose.Model, "findOneAndUpdate")
        .mockRejectedValue(new Error("DB Error"));

      const response = await request(app).get("/api/shorten/testalias");

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Server Error");
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Internal Server Error")
      );
    });

    it("should return 404 for non-existent alias", async () => {
      const response = await request(app).get("/api/shorten/a2lie");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Alias not found");
    });
  });
});
