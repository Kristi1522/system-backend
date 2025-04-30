const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Verifikon tokenin
      const decoded = jwt.verify(token, "jwt_secret_key");

      // Merr përdoruesin dhe vendos në req.user
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        console.log("❌ Përdoruesi nuk ekziston më në databazë");
        return res.status(401).json({ message: "Përdoruesi nuk ekziston më." });
      }

      req.user = user;
      console.log("✅ Autorizim i suksesshëm për:", user.email);
      next();

    } catch (error) {
      console.error("❌ Gabim gjatë verifikimit të token-it:", error.message);
      return res.status(401).json({ message: "Token i pavlefshëm ose ka skaduar." });
    }
  } else {
    console.warn("⚠️ Token mungon në header");
    return res.status(401).json({ message: "Nuk ka token. Akses i ndaluar." });
  }
};

module.exports = { protect };
