import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@testready.pk' },
    update: {},
    create: {
      email: 'admin@testready.pk',
      username: 'admin',
      password: adminPassword,
      role: 'ADMIN',
      admin: {
        create: {
          fullName: 'System Administrator'
        }
      }
    }
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create sample student user
  const studentPassword = await bcrypt.hash('student123', 12);
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@testready.pk' },
    update: {},
    create: {
      email: 'student@testready.pk',
      username: 'student',
      password: studentPassword,
      role: 'STUDENT',
      student: {
        create: {
          fullName: 'John Doe',
          schoolName: 'Sample School',
          age: 16,
          classGrade: '10th Grade',
          whatsappNumber: '+923001234567',
          consentWhatsapp: true,
          profileCompleted: true
        }
      }
    }
  });

  console.log('✅ Sample student created:', studentUser.email);

  // Create sample test
  const sampleTest = await prisma.test.create({
    data: {
      title: 'MDCAT Biology Practice Test',
      description: 'A comprehensive biology test covering cell biology, genetics, and human anatomy',
      totalMarks: 100,
      timeLimit: 1800, // 30 minutes
      questions: {
        create: [
          {
            text: 'Which organelle is responsible for protein synthesis in the cell?',
            options: [
              { id: 'a', text: 'Mitochondria' },
              { id: 'b', text: 'Ribosomes' },
              { id: 'c', text: 'Golgi Apparatus' },
              { id: 'd', text: 'Nucleus' }
            ],
            correctAnswer: 'b',
            marks: 1,
            explanation: 'Ribosomes are the cellular organelles responsible for protein synthesis. They translate mRNA into polypeptide chains.'
          },
          {
            text: 'In Mendel\'s law of segregation, what happens to alleles during gamete formation?',
            options: [
              { id: 'a', text: 'They combine permanently' },
              { id: 'b', text: 'They separate and each gamete receives one allele' },
              { id: 'c', text: 'They multiply' },
              { id: 'd', text: 'They remain together' }
            ],
            correctAnswer: 'b',
            marks: 1,
            explanation: 'During gamete formation, paired alleles separate so that each gamete carries only one allele for each gene.'
          },
          {
            text: 'Which of the following is the correct equation for photosynthesis?',
            options: [
              { id: 'a', text: 'CO2 + H2O → C6H12O6 + O2' },
              { id: 'b', text: '6CO2 + 6H2O → C6H12O6 + 6O2' },
              { id: 'c', text: '6CO2 + 6H2O + light → C6H12O6 + 6O2' },
              { id: 'd', text: 'C6H12O6 + 6O2 → 6CO2 + 6H2O' }
            ],
            correctAnswer: 'c',
            marks: 1,
            explanation: 'The complete photosynthesis equation includes light energy: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2'
          },
          {
            text: 'Where does gas exchange occur in the lungs?',
            options: [
              { id: 'a', text: 'Bronchi' },
              { id: 'b', text: 'Bronchioles' },
              { id: 'c', text: 'Alveoli' },
              { id: 'd', text: 'Trachea' }
            ],
            correctAnswer: 'c',
            marks: 1,
            explanation: 'Gas exchange occurs in the alveoli, tiny air sacs in the lungs where oxygen enters the blood and carbon dioxide is removed.'
          },
          {
            text: 'Which blood vessel carries oxygenated blood from the lungs to the heart?',
            options: [
              { id: 'a', text: 'Pulmonary artery' },
              { id: 'b', text: 'Pulmonary vein' },
              { id: 'c', text: 'Aorta' },
              { id: 'd', text: 'Vena cava' }
            ],
            correctAnswer: 'b',
            marks: 1,
            explanation: 'The pulmonary vein carries oxygenated blood from the lungs back to the left atrium of the heart.'
          }
        ]
      }
    }
  });

  console.log('✅ Sample test created:', sampleTest.title);

  // Create sample test attempt
  const student = await prisma.student.findFirst({
    where: { userId: studentUser.id }
  });

  if (student) {
    await prisma.testAttempt.create({
      data: {
        studentId: student.id,
        testId: sampleTest.id,
        score: 4,
        totalMarks: 5,
        percentage: 80.0,
        answers: [
          { questionId: '1', answer: 'b' },
          { questionId: '2', answer: 'b' },
          { questionId: '3', answer: 'c' },
          { questionId: '4', answer: 'c' },
          { questionId: '5', answer: 'b' }
        ],
        finishedAt: new Date(),
        status: 'COMPLETED'
      }
    });

    console.log('✅ Sample test attempt created');
  }

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
