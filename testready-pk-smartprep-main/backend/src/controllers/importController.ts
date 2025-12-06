// backend/src/controllers/importController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import xlsx from 'xlsx';
import { body, validationResult } from 'express-validator';

const prisma = new PrismaClient();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes('excel') || file.mimetype.includes('spreadsheet') || 
        file.originalname.match(/\.(xlsx|xls)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Import test from Excel
export const importTestFromExcel = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No Excel file uploaded'
      });
    }

    const { title, description, timeLimit = 1800, isActive = true } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Test title is required'
      });
    }

    // Parse Excel file
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Excel file is empty or no data found'
      });
    }

    const questions = [];
    let totalMarks = 0;

    // Process each row
    for (const [index, row] of data.entries()) {
      const questionData = row as any;
      
      // Validate required fields
      if (!questionData.question || !questionData.correctAnswer) {
        continue; // Skip invalid rows
      }

      const options = [];
      for (let i = 1; i <= 6; i++) {
        const optionText = questionData[`option${i}`];
        if (optionText && optionText.toString().trim()) {
          options.push({
            id: String.fromCharCode(64 + i), // A, B, C, ...
            text: optionText.toString().trim()
          });
        }
      }

      if (options.length < 2) {
        continue; // Skip questions with less than 2 options
      }

      const marks = parseInt(questionData.marks) || 1;
      totalMarks += marks;

      questions.push({
        text: questionData.question.toString().trim(),
        options,
        correctAnswer: questionData.correctAnswer.toString().toUpperCase().trim(),
        marks,
        explanation: questionData.explanation?.toString().trim() || null,
      });
    }

    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid questions found in the Excel file'
      });
    }

    // Create test with questions
    const test = await prisma.test.create({
      data: {
        title: title.trim(),
        description: description?.trim(),
        totalMarks,
        timeLimit: parseInt(timeLimit),
        isActive: isActive === 'true' || isActive === true,
        questions: {
          create: questions
        }
      },
      include: {
        questions: true
      }
    });

    return res.status(201).json({
      success: true,
      message: `Test created successfully with ${questions.length} questions`,
      data: { test }
    });
  } catch (error) {
    console.error('Excel import error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to import test from Excel'
    });
  }
};

// Download template
export const downloadTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    // Create sample data for template
    const templateData = [
      {
        question: "What is the capital of Pakistan?",
        option1: "Lahore",
        option2: "Karachi",
        option3: "Islamabad",
        option4: "Peshawar",
        correctAnswer: "C",
        marks: "1",
        explanation: "Islamabad has been the capital since 1963."
      },
      {
        question: "Which is the largest ocean?",
        option1: "Atlantic Ocean",
        option2: "Indian Ocean",
        option3: "Arctic Ocean",
        option4: "Pacific Ocean",
        correctAnswer: "D",
        marks: "1",
        explanation: "The Pacific Ocean covers about 46% of Earth's water surface."
      }
    ];

    // Create workbook
    const ws = xlsx.utils.json_to_sheet(templateData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Questions");

    // Set headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=test-template.xlsx');

    // Generate and send file
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.send(buffer);
  } catch (error) {
    console.error('Template download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download template'
    });
  }
};

// Validation rules
export const importTestValidation = [
  body('title').notEmpty().withMessage('Test title is required'),
  body('timeLimit').optional().isInt({ min: 60 }).withMessage('Time limit must be at least 60 seconds'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

// Export multer upload middleware
export const excelUpload = upload.single('excelFile');