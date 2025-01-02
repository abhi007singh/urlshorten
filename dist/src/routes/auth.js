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
const axios_1 = __importDefault(require("axios"));
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("../logger");
const User_1 = __importDefault(require("../models/User"));
const UserUrl_1 = __importDefault(require("../models/UserUrl"));
const router = express_1.default.Router();
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/api/auth/google/callback";
router.get("/google", (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.logger.info("/auth/google GET");
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email`;
    res.redirect(302, url);
}));
router.get("/google/callback", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { code } = req.query;
    logger_1.logger.info("/auth/google/callback GET");
    try {
        // Exchange authorization code for access token
        const { data } = yield axios_1.default.post("https://oauth2.googleapis.com/token", {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code,
            grant_type: "authorization_code",
            redirect_uri: REDIRECT_URI,
        });
        const { access_token, id_token } = data;
        // Use access_token or id_token to fetch user profile
        const { data: profile } = yield axios_1.default.get("https://www.googleapis.com/oauth2/v1/userinfo", {
            headers: { Authorization: `Bearer ${access_token}` },
        });
        // Code to handle user authentication and retrieval using the profile data
        const { displayName, emails, id } = profile;
        const email = emails && ((_a = emails[0]) === null || _a === void 0 ? void 0 : _a.value);
        let isUser = yield User_1.default.findOne({ googleId: id });
        if (!isUser) {
            logger_1.logger.info("User created.");
            isUser = yield User_1.default.create({
                displayName,
                email,
                googleId: id,
            });
            yield UserUrl_1.default.create({
                userId: isUser._id,
                userUrls: [],
            });
        }
        const token = jsonwebtoken_1.default.sign({ id: isUser._id, email: isUser.email }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        res.cookie("auth_token", token);
        res.redirect(`/api-docs`);
    }
    catch (error) {
        logger_1.logger.error(`Internal Server Error: ${error.message}`);
        res.redirect("/login");
    }
}));
exports.default = router;
//# sourceMappingURL=auth.js.map