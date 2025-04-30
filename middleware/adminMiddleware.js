const adminOnly = (req, res, next) => {
  // Sigurohemi që përdoruesi ekziston dhe ka rolin "admin"
  if (req.user && req.user.role === "admin") {
    next(); // vazhdo
  } else {
    res.status(403).json({ message: "⛔ Akses i ndaluar. Vetëm admini lejohet." });
  }
};

module.exports = { adminOnly };
