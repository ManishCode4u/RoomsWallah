import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import Owner from "../models/Owner.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "dummy_client_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy_client_secret",
      callbackURL: "/api/auth/google/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("Google account does not share email"));
        }

        let owner = await Owner.findOne({ email });

        if (owner) {
          if (owner.status === "blocked") {
            return done(null, false, { message: "Account is blocked" });
          }
          if (!owner.googleId) {
            owner.googleId = profile.id;
          }
          if (!owner.profileImage && profile.photos?.[0]?.value) {
            owner.profileImage = profile.photos[0].value;
          }
          owner.lastLogin = new Date();
          await owner.save();
          return done(null, owner);
        }

        // Auto create owner
        owner = new Owner({
          fullName: profile.displayName || "Google User",
          email: email.toLowerCase(),
          googleId: profile.id,
          profileImage: profile.photos?.[0]?.value || "",
          provider: "google",
          status: "active",
          profileCompleted: false,
          lastLogin: new Date(),
        });

        await owner.save();
        return done(null, owner);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const owner = await Owner.findById(id);
    done(null, owner);
  } catch (error) {
    done(error);
  }
});

export default passport;
