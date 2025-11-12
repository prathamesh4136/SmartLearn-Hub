import express from "express";
import multer from "multer";
import {
  createNote,
  listNotes,
  getMyNotes,
  downloadNote,
  viewNote,
  deleteNote
} from "../controllers/noteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for memory storage (we'll store directly in MongoDB)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 1 // Only one file per request
  },
  fileFilter: (req, file, cb) => {
    // Allow PDF and text files only
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'text/plain' ||
        file.mimetype.startsWith('text/')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and text files are allowed'), false);
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 50MB' });
    }
  } else if (err.message === 'Only PDF and text files are allowed') {
    return res.status(400).json({ message: err.message });
  }
  next(err);
};

// Public listing
router.get("/", listNotes);

// Get current user's notes (protected)
router.get("/mine", protect, getMyNotes);

// Download a note (public or protected based on visibility)
router.get("/:id/download", downloadNote);

// View a note in browser (for PDFs)
router.get("/:id/view", viewNote);

// Create a note (protected)
router.post("/", protect, upload.single("file"), handleMulterError, createNote);

// Delete a note (protected)
router.delete("/:id", protect, deleteNote);

export default router;