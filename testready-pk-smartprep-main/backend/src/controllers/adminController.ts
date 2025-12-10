import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Encryption utilities
const algorithm = 'aes-256-cbc';
const secretKey = process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key';

const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey.padEnd(32).slice(0, 32)), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (encryptedText: string): string => {
  const textParts = encryptedText.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedData = textParts.join(':');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey.padEnd(32).slice(0, 32)), iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// Dashboard statistics
export const getDashboardStats = async (req: Request, res: Response): Promise<Response> => {
  try {
    const [
      totalStudents,
      totalTests,
      totalAttempts,
      completedAttempts,
      recentStudents,
      recentAttempts
    ] = await Promise.all([
      prisma.student.count(),
      prisma.test.count(),
      prisma.testAttempt.count(),
      prisma.testAttempt.count({ where: { status: 'COMPLETED' } }),
      prisma.student.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          schoolName: true,
          createdAt: true
        }
      }),
      prisma.testAttempt.findMany({
        take: 10,
        where: { status: 'COMPLETED' },
        orderBy: { finishedAt: 'desc' },
        include: {
          student: {
            select: {
              fullName: true,
              schoolName: true
            }
          },
          test: {
            select: {
              title: true
            }
          }
        }
      })
    ]);

    const averageScore = completedAttempts > 0
      ? await prisma.testAttempt.aggregate({
        where: { status: 'COMPLETED' },
        _avg: { percentage: true }
      })
      : { _avg: { percentage: 0 } };

    return res.json({
      success: true,
      data: {
        statistics: {
          totalStudents,
          totalTests,
          totalAttempts,
          completedAttempts,
          averageScore: Math.round((averageScore._avg.percentage || 0) * 100) / 100
        },
        recentStudents,
        recentAttempts: recentAttempts.map(attempt => ({
          id: attempt.id,
          studentName: attempt.student.fullName,
          schoolName: attempt.student.schoolName,
          testTitle: attempt.test.title,
          score: attempt.score,
          percentage: attempt.percentage,
          completedAt: attempt.finishedAt
        }))
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all students
export const getStudents = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { page = 1, limit = 10, search, school, classGrade } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search as string, mode: 'insensitive' } },
        { schoolName: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (school) {
      where.schoolName = { contains: school as string, mode: 'insensitive' };
    }

    if (classGrade) {
      where.classGrade = { contains: classGrade as string, mode: 'insensitive' };
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          schoolName: true,
          age: true,
          classGrade: true,
          whatsappNumber: true,
          consentWhatsapp: true,
          profileCompleted: true,
          createdAt: true,
          _count: {
            select: {
              testAttempts: true
            }
          }
        }
      }),
      prisma.student.count({ where })
    ]);

    // Mask WhatsApp numbers
    const maskedStudents = students.map(student => {
      let maskedWhatsapp = null;
      if (student.whatsappNumber) {
        try {
          const decrypted = decrypt(student.whatsappNumber);
          maskedWhatsapp = decrypted.replace(/(\+\d{2})\d{4}(\d{3})/, '$1****$2');
        } catch (error) {
          maskedWhatsapp = '****';
        }
      }

      return {
        ...student,
        whatsappNumber: maskedWhatsapp
      };
    });

    return res.json({
      success: true,
      data: {
        students: maskedStudents,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create test
// In your backend controller
export const createTest = async (req: Request, res: Response): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, totalMarks, timeLimit, questions } = req.body;

    const test = await prisma.test.create({
      data: {
        title,
        description,
        totalMarks: parseInt(totalMarks),
        timeLimit: parseInt(timeLimit),
        questions: {
          create: questions.map((q: any) => {
            // Convert string array to object array if needed
            let options;
            if (Array.isArray(q.options) && q.options.length > 0) {
              if (typeof q.options[0] === 'string') {
                // Convert ["Option A", "Option B"] to [{id: "A", text: "Option A"}, ...]
                options = q.options.map((text: string, index: number) => ({
                  id: String.fromCharCode(65 + index), // A, B, C, D...
                  text: text
                }));
              } else {
                // Already objects
                options = q.options;
              }
            } else {
              options = [];
            }

            return {
              text: q.text,
              options,
              correctAnswer: q.correctAnswer,
              marks: parseInt(q.marks) || 1,
              explanation: q.explanation
            };
          })
        }
      },
      include: {
        questions: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Test created successfully',
      data: { test }
    });
  } catch (error) {
    console.error('Create test error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all tests
export const getTests = async (req: Request, res: Response): Promise<Response> => {
  try {
    const tests = await prisma.test.findMany({
      include: {
        questions: {
          select: {
            id: true,
            text: true,
            marks: true
          }
        },
        _count: {
          select: {
            attempts: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.json({
      success: true,
      data: { tests }
    });
  } catch (error) {
    console.error('Get tests error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getTestsSingle = async (req: Request, res: Response): Promise<Response> => {
  try {
    const tests = await prisma.test.findUnique({
      include: {
        questions: {
          select: {
            id: true,
            text: true,
            options: true,      // Add this
            correctAnswer: true, // Add this
            marks: true,
            explanation: true   // Add this
          }
        },
        _count: {
          select: {
            attempts: true
          }
        }
      },
      where: {
        id: req.params.testId
      }
      
    });

    return res.json({
      success: true,
      data: { tests }
    });
  } catch (error) {
    console.error('Get tests error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// Update test
export const updateTest = async (req: Request, res: Response): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, totalMarks, timeLimit, isActive, questions } = req.body;
    const testId = req.params.testId;

    // First, get the existing test
    const existingTest = await prisma.test.findUnique({
      where: { id: testId },
      include: { questions: true }
    });

    if (!existingTest) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Prepare update data
    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (timeLimit !== undefined) updateData.timeLimit = parseInt(timeLimit);
    if (isActive !== undefined) updateData.isActive = isActive;

    // Calculate totalMarks from questions if provided, otherwise use provided value or existing
    let calculatedTotalMarks = existingTest.totalMarks;
    if (questions && Array.isArray(questions)) {
      calculatedTotalMarks = questions.reduce((sum, q) => sum + (parseInt(q.marks) || 1), 0);
    } else if (totalMarks !== undefined) {
      calculatedTotalMarks = parseInt(totalMarks);
    }
    updateData.totalMarks = calculatedTotalMarks;

    // Start a transaction to update test and questions
    const result = await prisma.$transaction(async (tx) => {
      // Update the test
      const updatedTest = await tx.test.update({
        where: { id: testId },
        data: updateData,
        include: { questions: true }
      });

      // Update questions if provided
      if (questions && Array.isArray(questions)) {
        // Delete existing questions
        await tx.question.deleteMany({
          where: { testId }
        });

        // Create new questions
        const createdQuestions = await Promise.all(
          questions.map(async (q: any) => {
            return await tx.question.create({
              data: {
                testId,
                text: q.text,
                options: q.options || [],
                correctAnswer: q.correctAnswer,
                marks: parseInt(q.marks) || 1,
                explanation: q.explanation
              }
            });
          })
        );

        updatedTest.questions = createdQuestions;
      }

      return updatedTest;
    });

    return res.json({
      success: true,
      message: 'Test updated successfully',
      data: { test: result }
    });
  } catch (error) {
    console.error('Update test error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete test
export const deleteTest = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { testId } = req.params;

    await prisma.test.delete({
      where: { id: testId }
    });

    return res.json({
      success: true,
      message: 'Test deleted successfully'
    });
  } catch (error) {
    console.error('Delete test error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Export students to CSV
export const exportStudents = async (req: Request, res: Response): Promise<Response> => {
  try {
    const students = await prisma.student.findMany({
      select: {
        fullName: true,
        schoolName: true,
        age: true,
        classGrade: true,
        whatsappNumber: true,
        consentWhatsapp: true,
        profileCompleted: true,
        createdAt: true
      }
    });

    // Create CSV content
    const csvHeader = 'Full Name,School Name,Age,Class Grade,WhatsApp Number,Consent Given,Profile Completed,Created At\n';
    const csvRows = students.map(student => {
      let whatsapp = '';
      if (student.whatsappNumber) {
        try {
          whatsapp = decrypt(student.whatsappNumber);
        } catch (error) {
          whatsapp = 'Encrypted';
        }
      }

      return `"${student.fullName}","${student.schoolName || ''}","${student.age || ''}","${student.classGrade || ''}","${whatsapp}","${student.consentWhatsapp}","${student.profileCompleted}","${student.createdAt.toISOString()}"`;
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="students.csv"');
    return res.send(csvContent);
  } catch (error) {
    console.error('Export students error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Configure multer for CSV upload
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB
  }
});

// Import students from CSV
export const importStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No CSV file uploaded'
      });
      return;
    }

    const students: any[] = [];
    const errors: string[] = [];

    // Parse CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row) => {
        students.push(row);
      })
      .on('end', async () => {
        try {
          let importedCount = 0;
          let errorCount = 0;

          for (const studentData of students) {
            try {
              // Validate required fields
              if (!studentData.email || !studentData.fullName || !studentData.password) {
                errors.push(`Row ${importedCount + errorCount + 1}: Missing required fields (email, fullName, password)`);
                errorCount++;
                continue;
              }

              // Check if user already exists
              const existingUser = await prisma.user.findUnique({
                where: { email: studentData.email }
              });

              if (existingUser) {
                errors.push(`Row ${importedCount + errorCount + 1}: User with email ${studentData.email} already exists`);
                errorCount++;
                continue;
              }

              // Hash password
              const hashedPassword = await bcrypt.hash(studentData.password, 12);

              // Encrypt WhatsApp number if provided
              let encryptedWhatsapp = null;
              if (studentData.whatsappNumber) {
                encryptedWhatsapp = encrypt(studentData.whatsappNumber);
              }

              // Create user and student
              await prisma.user.create({
                data: {
                  email: studentData.email,
                  username: studentData.username || studentData.email.split('@')[0],
                  password: hashedPassword,
                  role: 'STUDENT',
                  student: {
                    create: {
                      fullName: studentData.fullName,
                      schoolName: studentData.schoolName,
                      age: studentData.age ? parseInt(studentData.age) : null,
                      classGrade: studentData.classGrade,
                      whatsappNumber: encryptedWhatsapp,
                      consentWhatsapp: studentData.consentWhatsapp === 'true' || studentData.consentWhatsapp === '1',
                      profileCompleted: true
                    }
                  }
                }
              });

              importedCount++;
            } catch (error) {
              errors.push(`Row ${importedCount + errorCount + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
              errorCount++;
            }
          }

          // Clean up uploaded file
          if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
          }

          res.json({
            success: true,
            message: 'CSV import completed',
            data: {
              imported: importedCount,
              errors: errorCount,
              errorDetails: errors
            }
          });
        } catch (error) {
          console.error('CSV processing error:', error);
          // Clean up uploaded file on error
          if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
          }
          res.status(500).json({
            success: false,
            message: 'Error processing CSV file'
          });
        }
      })
      .on('error', (error) => {
        console.error('CSV parsing error:', error);
        // Clean up uploaded file on error
        if (req.file && req.file.path) {
          fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
          success: false,
          message: 'Error parsing CSV file'
        });
      });
  } catch (error) {
    console.error('Import students error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Validation rules
export const createTestValidation = [
  body('title').notEmpty().withMessage('Test title is required'),
  body('description').optional(),
  body('totalMarks').isInt({ min: 1 }).withMessage('Total marks must be a positive integer'),
  body('timeLimit').isInt({ min: 60 }).withMessage('Time limit must be at least 60 seconds'),
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
  body('questions.*.text').notEmpty().withMessage('Question text is required'),
  body('questions.*.options').isArray({ min: 2 }).withMessage('At least 2 options are required'),
  body('questions.*.correctAnswer').notEmpty().withMessage('Correct answer is required'),
  body('questions.*.marks').isInt({ min: 1 }).withMessage('Question marks must be a positive integer')
];