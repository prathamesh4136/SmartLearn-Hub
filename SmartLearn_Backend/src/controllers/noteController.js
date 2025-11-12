import { MongoClient, GridFSBucket } from "mongodb";
import mongoose from "mongoose";
import Note from "../models/Note.js";

// MongoDB connection for GridFS
let gridFSBucket = null;
const initializeGridFS = async () => {
  if (!gridFSBucket) {
    const client = mongoose.connection.client;
    const db = client.db();
    gridFSBucket = new GridFSBucket(db, { bucketName: "notesFiles" });
  }
  return gridFSBucket;
};

/**
 * listNotes(req, res)
 * GET /api/notes?visibility=public
 */
export async function listNotes(req, res) {
  try {
    const visibility = req.query.visibility || "public";
    const filter = visibility === "public" ? { visibility: "public" } : {};
    
    // Exclude file content from listing for performance
    const notes = await Note.find(filter, { textContent: 0 })
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({ notes });
  } catch (err) {
    console.error("listNotes err:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * getMyNotes(req, res)
 * GET /api/notes/mine
 */
export async function getMyNotes(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });

    // Exclude file content from listing for performance
    const notes = await Note.find(
      { "uploadedBy.uid": req.user.uid }, 
      { textContent: 0 }
    ).sort({ createdAt: -1 }).lean();
    
    res.json({ notes });
  } catch (err) {
    console.error("getMyNotes err:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * createNote(req, res)
 * POST /api/notes
 */
export async function createNote(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });

    const { title, subject, className, visibility = "public", textContent } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Title is required" });
    }

    const isFile = !!req.file;

    const noteData = {
      title: title.trim(),
      subject: subject || "",
      className: className || "",
      visibility: visibility === "private" ? "private" : "public",
      uploadedBy: {
        uid: req.user.uid,
        email: req.user.email,
        name: req.user.name || req.user.email,
      },
      isFile,
      textContent: textContent || "",
    };

    if (isFile) {
      // Initialize GridFS
      const bucket = await initializeGridFS();
      
      // Create upload stream
      const uploadStream = bucket.openUploadStream(req.file.originalname, {
        metadata: {
          uploadedBy: req.user.uid,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype
        }
      });

      // Store file in GridFS
      uploadStream.end(req.file.buffer);
      
      // Wait for upload to complete
      await new Promise((resolve, reject) => {
        uploadStream.on('finish', resolve);
        uploadStream.on('error', reject);
      });

      // Add file reference to note
      noteData.fileId = uploadStream.id;
      noteData.fileOriginalName = req.file.originalname;
      noteData.fileMime = req.file.mimetype;
      noteData.fileSize = req.file.size;
    }

    const note = new Note(noteData);
    await note.save();
    
    // Remove file buffer from memory
    if (req.file) {
      delete req.file.buffer;
    }
    
    res.status(201).json({ message: "Note created", note });
  } catch (err) {
    console.error("createNote err:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * downloadNote(req, res)
 * GET /api/notes/:id/download
 */
export async function downloadNote(req, res) {
  try {
    const noteId = req.params.id;
    const note = await Note.findById(noteId).lean();
    
    if (!note) return res.status(404).json({ message: "Note not found" });

    // Check if user has access to private notes
    if (note.visibility === "private") {
      if (!req.user) return res.status(401).json({ message: "Not authorized" });
      if (req.user.uid !== note.uploadedBy.uid) {
        return res.status(403).json({ message: "Forbidden" });
      }
    }

    // Handle text notes
    if (!note.isFile) {
      const filename = `${note.title.replace(/[^a-zA-Z0-9]/g, "_") || "note"}.txt`;
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.send(note.textContent || "");
    }

    // Handle file notes with GridFS
    if (!note.fileId) {
      return res.status(404).json({ message: "File not found" });
    }

    // Initialize GridFS
    const bucket = await initializeGridFS();
    
    // Check if file exists in GridFS
    const files = await bucket.find({ _id: note.fileId }).toArray();
    if (files.length === 0) {
      return res.status(404).json({ message: "File not found in database" });
    }

    // Set download headers
    const filename = note.fileOriginalName || "download";
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", note.fileMime || "application/octet-stream");
    
    if (note.fileSize) {
      res.setHeader("Content-Length", note.fileSize);
    }

    // Stream file from GridFS to response
    const downloadStream = bucket.openDownloadStream(note.fileId);
    
    downloadStream.pipe(res);
    
    downloadStream.on('error', (err) => {
      console.error("Download stream error:", err);
      if (!res.headersSent) {
        res.status(404).json({ message: "File not found" });
      }
    });
    
    downloadStream.on('end', () => {
      // Download completed successfully
    });

  } catch (err) {
    console.error("downloadNote err:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error" });
    }
  }
}

/**
 * viewNote(req, res)
 * GET /api/notes/:id/view
 * For viewing PDFs in browser instead of downloading
 */
export async function viewNote(req, res) {
  try {
    const noteId = req.params.id;
    const note = await Note.findById(noteId).lean();
    
    if (!note) return res.status(404).json({ message: "Note not found" });

    // Check if user has access to private notes
    if (note.visibility === "private") {
      if (!req.user) return res.status(401).json({ message: "Not authorized" });
      if (req.user.uid !== note.uploadedBy.uid) {
        return res.status(403).json({ message: "Forbidden" });
      }
    }

    // Only allow viewing of PDF files
    if (!note.isFile || note.fileMime !== "application/pdf") {
      return res.status(400).json({ message: "This note cannot be viewed in browser" });
    }

    if (!note.fileId) {
      return res.status(404).json({ message: "File not found" });
    }

    // Initialize GridFS
    const bucket = await initializeGridFS();
    
    // Check if file exists in GridFS
    const files = await bucket.find({ _id: note.fileId }).toArray();
    if (files.length === 0) {
      return res.status(404).json({ message: "File not found in database" });
    }

    // Set view headers (inline instead of attachment)
    res.setHeader("Content-Disposition", `inline; filename="${note.fileOriginalName}"`);
    res.setHeader("Content-Type", "application/pdf");
    
    if (note.fileSize) {
      res.setHeader("Content-Length", note.fileSize);
    }

    // Stream file from GridFS to response
    const downloadStream = bucket.openDownloadStream(note.fileId);
    
    downloadStream.pipe(res);
    
    downloadStream.on('error', (err) => {
      console.error("View stream error:", err);
      if (!res.headersSent) {
        res.status(404).json({ message: "File not found" });
      }
    });

  } catch (err) {
    console.error("viewNote err:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error" });
    }
  }
}

/**
 * deleteNote(req, res)
 * DELETE /api/notes/:id
 * Delete a note and its associated file from GridFS
 */
export async function deleteNote(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });

    const noteId = req.params.id;
    const note = await Note.findById(noteId);
    
    if (!note) return res.status(404).json({ message: "Note not found" });
    
    // Check if user owns the note
    if (req.user.uid !== note.uploadedBy.uid) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Delete file from GridFS if exists
    if (note.isFile && note.fileId) {
      const bucket = await initializeGridFS();
      await bucket.delete(note.fileId);
    }

    // Delete note from database
    await Note.findByIdAndDelete(noteId);
    
    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error("deleteNote err:", err);
    res.status(500).json({ message: "Server error" });
  }
}