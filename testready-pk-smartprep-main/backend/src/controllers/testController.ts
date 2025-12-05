import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get available tests
export const getTests = async (req: Request, res: Response): Promise<Response> => {
  try {
    const tests = await prisma.test.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        description: true,
        totalMarks: true,
        timeLimit: true,
        createdAt: true,
        _count: {
          select: {
            questions: true
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

// Get test details
export const getTest = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { testId } = req.params;

    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: {
          select: {
            id: true,
            text: true,
            options: true,
            marks: true
          }
        }
      }
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    if (!test.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Test is not active'
      });
    }

    return res.json({
      success: true,
      data: { test }
    });
  } catch (error) {
    console.error('Get test error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Start test attempt
export const startTest = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).user.id;
    const { testId } = req.params;

    // Get student
    const student = await prisma.student.findUnique({
      where: { userId }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Check if student has already attempted this test
    const existingAttempt = await prisma.testAttempt.findFirst({
      where: {
        studentId: student.id,
        testId,
        status: 'IN_PROGRESS'
      }
    });

    if (existingAttempt) {
      return res.json({
        success: true,
        message: 'Resuming existing test attempt',
        data: { attemptId: existingAttempt.id }
      });
    }

    // Get test details
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: {
          select: {
            id: true,
            text: true,
            options: true,
            marks: true
          }
        }
      }
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    if (!test.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Test is not active'
      });
    }

    // Create new test attempt
    const attempt = await prisma.testAttempt.create({
      data: {
        studentId: student.id,
        testId,
        totalMarks: test.totalMarks,
        status: 'IN_PROGRESS',
        percentage: 0,
        answers: []
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Test started successfully',
      data: { 
        attemptId: attempt.id,
        test: {
          id: test.id,
          title: test.title,
          description: test.description,
          totalMarks: test.totalMarks,
          timeLimit: test.timeLimit,
          questions: test.questions
        }
      }
    });
  } catch (error) {
    console.error('Start test error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Submit test
export const submitTest = async (req: Request, res: Response): Promise<Response> => {
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
    const { attemptId, answers } = req.body;

    // Get student
    const student = await prisma.student.findUnique({
      where: { userId }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Get test attempt
    const attempt = await prisma.testAttempt.findFirst({
      where: {
        id: attemptId,
        studentId: student.id,
        status: 'IN_PROGRESS'
      },
      include: {
        test: {
          include: {
            questions: true
          }
        }
      }
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Test attempt not found or already completed'
      });
    }

    // Calculate score
    let score = 0;
    const questionResults = [];

    for (const question of attempt.test.questions) {
      const userAnswer = answers.find((a: any) => a.questionId === question.id);
      const isCorrect = userAnswer && userAnswer.answer === question.correctAnswer;
      
      if (isCorrect) {
        score += question.marks;
      }

      questionResults.push({
        questionId: question.id,
        questionText: question.text,
        userAnswer: userAnswer?.answer || null,
        correctAnswer: question.correctAnswer,
        isCorrect,
        marks: question.marks,
        explanation: question.explanation
      });
    }

    const percentage = (score / attempt.totalMarks) * 100;

    // Update test attempt
    const updatedAttempt = await prisma.testAttempt.update({
      where: { id: attemptId },
      data: {
        score,
        percentage,
        answers: answers as any,
        finishedAt: new Date(),
        status: 'COMPLETED'
      }
    });

    // Create notification for WhatsApp if consent given
    if (student.consentWhatsapp && student.whatsappNumber) {
      await prisma.notification.create({
        data: {
          studentId: student.id,
          type: 'TEST_RESULT',
          message: `Test "${attempt.test.title}" completed! Score: ${score}/${attempt.totalMarks} (${percentage.toFixed(1)}%)`,
          status: 'PENDING'
        }
      });
    }

    return res.json({
      success: true,
      message: 'Test submitted successfully',
      data: {
        attempt: {
          id: updatedAttempt.id,
          score,
          totalMarks: attempt.totalMarks,
          percentage: Math.round(percentage * 100) / 100,
          completedAt: updatedAttempt.finishedAt
        },
        results: questionResults
      }
    });
  } catch (error) {
    console.error('Submit test error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get test attempt history
export const getTestHistory = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).user.id;

    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        testAttempts: {
          where: {
            status: 'COMPLETED'
          },
          include: {
            test: {
              select: {
                id: true,
                title: true,
                description: true,
                totalMarks: true
              }
            }
          },
          orderBy: {
            finishedAt: 'desc'
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

    const history = student.testAttempts.map(attempt => ({
      id: attempt.id,
      testTitle: attempt.test.title,
      testDescription: attempt.test.description,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      percentage: attempt.percentage,
      completedAt: attempt.finishedAt,
      startedAt: attempt.startedAt
    }));

    return res.json({
      success: true,
      data: { history }
    });
  } catch (error) {
    console.error('Get test history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Validation rules
export const submitTestValidation = [
  body('attemptId').notEmpty().withMessage('Attempt ID is required'),
  body('answers').isArray().withMessage('Answers must be an array'),
  body('answers.*.questionId').notEmpty().withMessage('Question ID is required for each answer'),
  body('answers.*.answer').notEmpty().withMessage('Answer is required for each question')
];