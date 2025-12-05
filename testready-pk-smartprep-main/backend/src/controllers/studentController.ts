import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

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

// Complete student profile
export const completeProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = (req as any).user.id;
    const { schoolName, age, classGrade, whatsappNumber, consentWhatsapp } = req.body;

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { userId }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Encrypt WhatsApp number if provided
    let encryptedWhatsapp = null;
    if (whatsappNumber) {
      encryptedWhatsapp = encrypt(whatsappNumber);
    }

    // Update student profile
    const updatedStudent = await prisma.student.update({
      where: { userId },
      data: {
        schoolName,
        age: parseInt(age),
        classGrade,
        whatsappNumber: encryptedWhatsapp,
        consentWhatsapp: consentWhatsapp || false,
        profileCompleted: true
      },
      select: {
        id: true,
        fullName: true,
        schoolName: true,
        age: true,
        classGrade: true,
        whatsappNumber: true,
        consentWhatsapp: true,
        profileCompleted: true
      }
    });

    return res.json({
      success: true,
      message: 'Profile completed successfully',
      data: { student: updatedStudent }
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get student profile
export const getProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).user.id;

    const student = await prisma.student.findUnique({
      where: { userId },
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
        updatedAt: true
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Decrypt WhatsApp number for display (masked)
    let maskedWhatsapp = null;
    if (student.whatsappNumber) {
      try {
        const decrypted = decrypt(student.whatsappNumber);
        maskedWhatsapp = decrypted.replace(/(\+\d{2})\d{4}(\d{3})/, '$1****$2');
      } catch (error) {
        console.error('Decryption error:', error);
      }
    }

    return res.json({
      success: true,
      data: {
        ...student,
        whatsappNumber: maskedWhatsapp
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update student profile
export const updateProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = (req as any).user.id;
    const { schoolName, age, classGrade, whatsappNumber, consentWhatsapp } = req.body;

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { userId }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Encrypt WhatsApp number if provided
    let encryptedWhatsapp = student.whatsappNumber;
    if (whatsappNumber) {
      encryptedWhatsapp = encrypt(whatsappNumber);
    }

    // Update student profile
    const updatedStudent = await prisma.student.update({
      where: { userId },
      data: {
        schoolName: schoolName || student.schoolName,
        age: age ? parseInt(age) : student.age,
        classGrade: classGrade || student.classGrade,
        whatsappNumber: encryptedWhatsapp,
        consentWhatsapp: consentWhatsapp !== undefined ? consentWhatsapp : student.consentWhatsapp
      },
      select: {
        id: true,
        fullName: true,
        schoolName: true,
        age: true,
        classGrade: true,
        whatsappNumber: true,
        consentWhatsapp: true,
        profileCompleted: true
      }
    });

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { student: updatedStudent }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get student progress
export const getProgress = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).user.id;

    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        testAttempts: {
          include: {
            test: {
              select: {
                id: true,
                title: true,
                totalMarks: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Calculate statistics
    const totalTests = student.testAttempts.length;
    const completedTests = student.testAttempts.filter(attempt => attempt.status === 'COMPLETED');
    const averageScore = completedTests.length > 0 
      ? completedTests.reduce((sum, attempt) => sum + (attempt.percentage || 0), 0) / completedTests.length 
      : 0;
    const bestScore = completedTests.length > 0 
      ? Math.max(...completedTests.map(attempt => attempt.percentage || 0))
      : 0;

    // Recent tests (last 10)
    const recentTests = completedTests.slice(0, 10).map(attempt => ({
      id: attempt.id,
      testTitle: attempt.test.title,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      percentage: attempt.percentage,
      completedAt: attempt.finishedAt
    }));

    // Progress over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentAttempts = completedTests.filter(attempt => 
      attempt.finishedAt && attempt.finishedAt >= thirtyDaysAgo
    );

    const progressData = recentAttempts.map(attempt => ({
      date: attempt.finishedAt?.toISOString().split('T')[0],
      score: attempt.percentage
    }));

    return res.json({
      success: true,
      data: {
        statistics: {
          totalTests,
          completedTests: completedTests.length,
          averageScore: Math.round(averageScore * 100) / 100,
          bestScore: Math.round(bestScore * 100) / 100
        },
        recentTests,
        progressData
      }
    });
  } catch (error) {
    console.error('Get progress error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Validation rules
export const profileValidation = [
  body('schoolName').notEmpty().withMessage('School/Institute name is required'),
  body('age').isInt({ min: 5, max: 100 }).withMessage('Age must be between 5 and 100'),
  body('classGrade').notEmpty().withMessage('Class/Grade is required'),
  body('whatsappNumber').optional().isMobilePhone('any').withMessage('Please provide a valid WhatsApp number'),
  body('consentWhatsapp').isBoolean().withMessage('WhatsApp consent must be a boolean value')
];

export const updateProfileValidation = [
  body('schoolName').optional().notEmpty().withMessage('School/Institute name cannot be empty'),
  body('age').optional().isInt({ min: 5, max: 100 }).withMessage('Age must be between 5 and 100'),
  body('classGrade').optional().notEmpty().withMessage('Class/Grade cannot be empty'),
  body('whatsappNumber').optional().isMobilePhone('any').withMessage('Please provide a valid WhatsApp number'),
  body('consentWhatsapp').optional().isBoolean().withMessage('WhatsApp consent must be a boolean value')
];