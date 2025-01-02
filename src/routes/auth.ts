import axios from "axios";
import express from "express";
import jwt from "jsonwebtoken";
import { logger } from "../logger";
import User from "../models/User";
import UserUrl from "../models/UserUrl";

const router = express.Router();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/api/auth/google/callback";

router.get("/google", async (_, res) => {
  logger.info("/auth/google GET");
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email`;

  res.redirect(302, url);
});

router.get("/google/callback", async (req, res) => {
  const { code } = req.query;
  logger.info("/auth/google/callback GET");
  try {
    // Exchange authorization code for access token
    const { data } = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
    });

    const { access_token, id_token } = data;

    // Use access_token or id_token to fetch user profile
    const { data: profile } = await axios.get(
      "https://www.googleapis.com/oauth2/v1/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    // Code to handle user authentication and retrieval using the profile data
    const { displayName, emails, id } = profile;
    const email = emails && emails[0]?.value;

    let isUser = await User.findOne({ googleId: id });
    if (!isUser) {
      logger.info("User created.");
      isUser = await User.create({
        displayName,
        email,
        googleId: id,
      });
      await UserUrl.create({
        userId: isUser._id,
        userUrls: [],
      });
    }

    const token = jwt.sign(
      { id: isUser._id, email: isUser.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.cookie("auth_token", token, );
    res.redirect(`/api-docs`);
  } catch (error) {
    logger.error(`Internal Server Error: ${error.message}`);
    res.redirect("/login");
  }
});

export default router;
