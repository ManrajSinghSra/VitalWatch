// controllers/report.js

export const uploadFile = (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("File:", file);

    res.json({
      message: "Upload success",
      filename: file.originalname,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error" });
  }
};