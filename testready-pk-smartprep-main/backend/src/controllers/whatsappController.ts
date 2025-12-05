import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import twilio from 'twilio';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Encryption utilities
const algorithm = 'aes-256-cbc';
const secretKey = process.env.ENCRYPTION_KEY || '66ff3bb31204c534d870dc12e80b1ee52bfe78e7eaeb33f319d6ae9c1b960487';

const decrypt = (encryptedText: string): string => {
  const textParts = encryptedText.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedData = textParts.join(':');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey.padEnd(32).slice(0, 32)), iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// Send WhatsApp message
export const sendWhatsAppMessage = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { studentId, message, type = 'SYSTEM_UPDATE' } = req.body;

    // Get student
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        fullName: true,
        whatsappNumber: true,
        consentWhatsapp: true
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    if (!student.consentWhatsapp) {
      return res.status(400).json({
        success: false,
        message: 'Student has not consented to WhatsApp notifications'
      });
    }

    if (!student.whatsappNumber) {
      return res.status(400).json({
        success: false,
        message: 'Student WhatsApp number not available'
      });
    }

    try {
      // Decrypt WhatsApp number
      const decryptedNumber = decrypt(student.whatsappNumber);
      
      // Format number for WhatsApp (ensure it starts with whatsapp:)
      const formattedNumber = decryptedNumber.startsWith('whatsapp:') 
        ? decryptedNumber 
        : `whatsapp:${decryptedNumber}`;

      // Send WhatsApp message
      const messageResult = await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: formattedNumber,
        body: message
      });

      // Create notification record
      const notification = await prisma.notification.create({
        data: {
          studentId: student.id,
          type,
          message,
          sentAt: new Date(),
          status: 'SENT'
        }
      });

      return res.json({
        success: true,
        message: 'WhatsApp message sent successfully',
        data: {
          notificationId: notification.id,
          messageSid: messageResult.sid,
          status: messageResult.status
        }
      });
    } catch (twilioError) {
      console.error('Twilio error:', twilioError);
      
      // Create failed notification record
      await prisma.notification.create({
        data: {
          studentId: student.id,
          type,
          message,
          status: 'FAILED'
        }
      });

      return res.status(500).json({
        success: false,
        message: 'Failed to send WhatsApp message',
        error: 'Twilio service error'
      });
    }
  } catch (error) {
    console.error('Send WhatsApp message error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Send test result notification
export const sendTestResultNotification = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { attemptId } = req.params;

    // Get test attempt
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            whatsappNumber: true,
            consentWhatsapp: true
          }
        },
        test: {
          select: {
            title: true
          }
        }
      }
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Test attempt not found'
      });
    }

    if (!attempt.student.consentWhatsapp || !attempt.student.whatsappNumber) {
      return res.status(400).json({
        success: false,
        message: 'Student has not consented to WhatsApp notifications or number not available'
      });
    }

    // Create personalized message
    const message = `🎉 Test Completed!\n\nTest: ${attempt.test.title}\nScore: ${attempt.score}/${attempt.totalMarks}\nPercentage: ${attempt.percentage.toFixed(1)}%\n\n${attempt.percentage >= 80 ? 'Excellent work! 🌟' : attempt.percentage >= 60 ? 'Good job! 👍' : 'Keep practicing! 📚'}\n\nThank you for using TestReady.pk!`;

    try {
      // Decrypt WhatsApp number
      const decryptedNumber = decrypt(attempt.student.whatsappNumber);
      const formattedNumber = decryptedNumber.startsWith('whatsapp:') 
        ? decryptedNumber 
        : `whatsapp:${decryptedNumber}`;

      // Send WhatsApp message
      const messageResult = await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: formattedNumber,
        body: message
      });

      // Update notification status
      await prisma.notification.updateMany({
        where: {
          studentId: attempt.student.id,
          type: 'TEST_RESULT',
          status: 'PENDING'
        },
        data: {
          sentAt: new Date(),
          status: 'SENT'
        }
      });

      return res.json({
        success: true,
        message: 'Test result notification sent successfully',
        data: {
          messageSid: messageResult.sid,
          status: messageResult.status
        }
      });
    } catch (twilioError) {
      console.error('Twilio error:', twilioError);
      
      // Update notification status to failed
      await prisma.notification.updateMany({
        where: {
          studentId: attempt.student.id,
          type: 'TEST_RESULT',
          status: 'PENDING'
        },
        data: {
          status: 'FAILED'
        }
      });

      return res.status(500).json({
        success: false,
        message: 'Failed to send WhatsApp notification',
        error: 'Twilio service error'
      });
    }
  } catch (error) {
    console.error('Send test result notification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Process pending notifications
export const processPendingNotifications = async (req: Request, res: Response): Promise<Response> => {
  try {
    const pendingNotifications = await prisma.notification.findMany({
      where: {
        status: 'PENDING',
        type: 'TEST_RESULT'
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            whatsappNumber: true,
            consentWhatsapp: true
          }
        }
      },
      take: 10 // Process 10 at a time
    });

    let processedCount = 0;
    let failedCount = 0;

    for (const notification of pendingNotifications) {
      try {
        if (!notification.student.consentWhatsapp || !notification.student.whatsappNumber) {
          await prisma.notification.update({
            where: { id: notification.id },
            data: { status: 'FAILED' }
          });
          failedCount++;
          continue;
        }

        // Decrypt WhatsApp number
        const decryptedNumber = decrypt(notification.student.whatsappNumber);
        const formattedNumber = decryptedNumber.startsWith('whatsapp:') 
          ? decryptedNumber 
          : `whatsapp:${decryptedNumber}`;

        // Send WhatsApp message
        await client.messages.create({
          from: process.env.TWILIO_WHATSAPP_NUMBER,
          to: formattedNumber,
          body: notification.message
        });

        // Update notification status
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            sentAt: new Date(),
            status: 'SENT'
          }
        });

        processedCount++;
      } catch (error) {
        console.error(`Failed to process notification ${notification.id}:`, error);
        
        await prisma.notification.update({
          where: { id: notification.id },
          data: { status: 'FAILED' }
        });
        
        failedCount++;
      }
    }

    return res.json({
      success: true,
      message: 'Pending notifications processed',
      data: {
        processed: processedCount,
        failed: failedCount,
        total: pendingNotifications.length
      }
    });
  } catch (error) {
    console.error('Process pending notifications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get notification logs
export const getNotificationLogs = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            select: {
              fullName: true,
              schoolName: true
            }
          }
        }
      }),
      prisma.notification.count({ where })
    ]);

    return res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get notification logs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};