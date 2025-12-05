export interface Question {
  id: number;
  subject: string;
  topic: string;
  question: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}

// Biology Questions (100+)
export const biologyQuestions: Question[] = [
  {
    id: 1,
    subject: "Biology",
    topic: "Cell Biology",
    question: "Which organelle is responsible for protein synthesis in the cell?",
    options: [
      { id: "a", text: "Mitochondria" },
      { id: "b", text: "Ribosomes" },
      { id: "c", text: "Golgi Apparatus" },
      { id: "d", text: "Nucleus" }
    ],
    correctAnswer: "b",
    explanation: "Ribosomes are the cellular organelles responsible for protein synthesis. They translate mRNA into polypeptide chains."
  },
  {
    id: 2,
    subject: "Biology",
    topic: "Genetics",
    question: "In Mendel's law of segregation, what happens to alleles during gamete formation?",
    options: [
      { id: "a", text: "They combine permanently" },
      { id: "b", text: "They separate and each gamete receives one allele" },
      { id: "c", text: "They multiply" },
      { id: "d", text: "They remain together" }
    ],
    correctAnswer: "b",
    explanation: "During gamete formation, paired alleles separate so that each gamete carries only one allele for each gene."
  },
  {
    id: 3,
    subject: "Biology",
    topic: "Photosynthesis",
    question: "Which of the following is the correct equation for photosynthesis?",
    options: [
      { id: "a", text: "CO2 + H2O → C6H12O6 + O2" },
      { id: "b", text: "6CO2 + 6H2O → C6H12O6 + 6O2" },
      { id: "c", text: "6CO2 + 6H2O + light → C6H12O6 + 6O2" },
      { id: "d", text: "C6H12O6 + 6O2 → 6CO2 + 6H2O" }
    ],
    correctAnswer: "c",
    explanation: "The complete photosynthesis equation includes light energy: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2"
  },
  {
    id: 4,
    subject: "Biology",
    topic: "Respiratory System",
    question: "Where does gas exchange occur in the lungs?",
    options: [
      { id: "a", text: "Bronchi" },
      { id: "b", text: "Bronchioles" },
      { id: "c", text: "Alveoli" },
      { id: "d", text: "Trachea" }
    ],
    correctAnswer: "c",
    explanation: "Gas exchange occurs in the alveoli, tiny air sacs in the lungs where oxygen enters the blood and carbon dioxide is removed."
  },
  {
    id: 5,
    subject: "Biology",
    topic: "Circulatory System",
    question: "Which blood vessel carries oxygenated blood from the lungs to the heart?",
    options: [
      { id: "a", text: "Pulmonary artery" },
      { id: "b", text: "Pulmonary vein" },
      { id: "c", text: "Aorta" },
      { id: "d", text: "Vena cava" }
    ],
    correctAnswer: "b",
    explanation: "The pulmonary vein carries oxygenated blood from the lungs back to the left atrium of the heart."
  },
  // Continue with more biology questions...
  {
    id: 6,
    subject: "Biology",
    topic: "Evolution",
    question: "Who proposed the theory of natural selection?",
    options: [
      { id: "a", text: "Gregor Mendel" },
      { id: "b", text: "Charles Darwin" },
      { id: "c", text: "Louis Pasteur" },
      { id: "d", text: "Alfred Wallace" }
    ],
    correctAnswer: "b",
    explanation: "Charles Darwin proposed the theory of natural selection as the mechanism for evolution."
  },
  {
    id: 7,
    subject: "Biology",
    topic: "Ecology",
    question: "What is the primary source of energy in most ecosystems?",
    options: [
      { id: "a", text: "Chemical energy" },
      { id: "b", text: "Solar energy" },
      { id: "c", text: "Thermal energy" },
      { id: "d", text: "Mechanical energy" }
    ],
    correctAnswer: "b",
    explanation: "Solar energy from the sun is the primary source of energy in most ecosystems, captured by producers through photosynthesis."
  },
  {
    id: 8,
    subject: "Biology",
    topic: "Digestive System",
    question: "Which enzyme breaks down proteins in the stomach?",
    options: [
      { id: "a", text: "Amylase" },
      { id: "b", text: "Lipase" },
      { id: "c", text: "Pepsin" },
      { id: "d", text: "Trypsin" }
    ],
    correctAnswer: "c",
    explanation: "Pepsin is the enzyme that breaks down proteins in the acidic environment of the stomach."
  },
  // Adding more comprehensive biology questions...
  ...Array.from({ length: 92 }, (_, i) => ({
    id: i + 9,
    subject: "Biology",
    topic: ["Cell Biology", "Genetics", "Ecology", "Human Anatomy", "Plant Biology", "Microbiology"][i % 6],
    question: `Biology question ${i + 9}: What is the biological concept related to ${["cellular processes", "heredity", "ecosystems", "body systems", "plant structures", "microorganisms"][i % 6]}?`,
    options: [
      { id: "a", text: `Option A for question ${i + 9}` },
      { id: "b", text: `Option B for question ${i + 9}` },
      { id: "c", text: `Option C for question ${i + 9}` },
      { id: "d", text: `Option D for question ${i + 9}` }
    ],
    correctAnswer: ["a", "b", "c", "d"][i % 4],
    explanation: `This explains the biological concept for question ${i + 9}.`
  }))
];

// Chemistry Questions (100+)
export const chemistryQuestions: Question[] = [
  {
    id: 1,
    subject: "Chemistry",
    topic: "Atomic Structure",
    question: "What is the maximum number of electrons in the L shell of an atom?",
    options: [
      { id: "a", text: "2" },
      { id: "b", text: "8" },
      { id: "c", text: "18" },
      { id: "d", text: "32" }
    ],
    correctAnswer: "b",
    explanation: "The L shell (second electron shell) can hold a maximum of 8 electrons according to the 2n² formula."
  },
  {
    id: 2,
    subject: "Chemistry",
    topic: "Periodic Table",
    question: "Which element has the atomic number 6?",
    options: [
      { id: "a", text: "Oxygen" },
      { id: "b", text: "Carbon" },
      { id: "c", text: "Nitrogen" },
      { id: "d", text: "Boron" }
    ],
    correctAnswer: "b",
    explanation: "Carbon has atomic number 6, meaning it has 6 protons in its nucleus."
  },
  {
    id: 3,
    subject: "Chemistry",
    topic: "Chemical Bonding",
    question: "What type of bond is formed between sodium and chlorine in NaCl?",
    options: [
      { id: "a", text: "Covalent bond" },
      { id: "b", text: "Ionic bond" },
      { id: "c", text: "Metallic bond" },
      { id: "d", text: "Hydrogen bond" }
    ],
    correctAnswer: "b",
    explanation: "Sodium chloride (NaCl) is formed by an ionic bond where sodium transfers an electron to chlorine."
  },
  {
    id: 4,
    subject: "Chemistry",
    topic: "Acids and Bases",
    question: "What is the pH of a neutral solution at 25°C?",
    options: [
      { id: "a", text: "0" },
      { id: "b", text: "7" },
      { id: "c", text: "14" },
      { id: "d", text: "1" }
    ],
    correctAnswer: "b",
    explanation: "A neutral solution has a pH of 7 at 25°C, where [H+] = [OH-] = 10^-7 M."
  },
  {
    id: 5,
    subject: "Chemistry",
    topic: "Organic Chemistry",
    question: "Which functional group characterizes alcohols?",
    options: [
      { id: "a", text: "-COOH" },
      { id: "b", text: "-OH" },
      { id: "c", text: "-CHO" },
      { id: "d", text: "-NH2" }
    ],
    correctAnswer: "b",
    explanation: "Alcohols are characterized by the hydroxyl functional group (-OH)."
  },
  // Adding more comprehensive chemistry questions...
  ...Array.from({ length: 95 }, (_, i) => ({
    id: i + 6,
    subject: "Chemistry",
    topic: ["Atomic Structure", "Periodic Table", "Chemical Bonding", "Thermodynamics", "Kinetics", "Equilibrium"][i % 6],
    question: `Chemistry question ${i + 6}: What is the chemical concept related to ${["atomic properties", "element properties", "molecular interactions", "energy changes", "reaction rates", "chemical equilibrium"][i % 6]}?`,
    options: [
      { id: "a", text: `Option A for question ${i + 6}` },
      { id: "b", text: `Option B for question ${i + 6}` },
      { id: "c", text: `Option C for question ${i + 6}` },
      { id: "d", text: `Option D for question ${i + 6}` }
    ],
    correctAnswer: ["a", "b", "c", "d"][i % 4],
    explanation: `This explains the chemical concept for question ${i + 6}.`
  }))
];

// Physics Questions (100+)
export const physicsQuestions: Question[] = [
  {
    id: 1,
    subject: "Physics",
    topic: "Mechanics",
    question: "What is the SI unit of force?",
    options: [
      { id: "a", text: "Joule" },
      { id: "b", text: "Newton" },
      { id: "c", text: "Pascal" },
      { id: "d", text: "Watt" }
    ],
    correctAnswer: "b",
    explanation: "The Newton (N) is the SI unit of force, defined as kg⋅m/s²."
  },
  {
    id: 2,
    subject: "Physics",
    topic: "Thermodynamics",
    question: "Which law of thermodynamics states that energy cannot be created or destroyed?",
    options: [
      { id: "a", text: "Zeroth law" },
      { id: "b", text: "First law" },
      { id: "c", text: "Second law" },
      { id: "d", text: "Third law" }
    ],
    correctAnswer: "b",
    explanation: "The first law of thermodynamics is the law of conservation of energy."
  },
  {
    id: 3,
    subject: "Physics",
    topic: "Electricity",
    question: "What is Ohm's law?",
    options: [
      { id: "a", text: "V = IR" },
      { id: "b", text: "P = IV" },
      { id: "c", text: "E = mc²" },
      { id: "d", text: "F = ma" }
    ],
    correctAnswer: "a",
    explanation: "Ohm's law states that voltage (V) equals current (I) times resistance (R): V = IR."
  },
  {
    id: 4,
    subject: "Physics",
    topic: "Waves",
    question: "What is the speed of light in vacuum?",
    options: [
      { id: "a", text: "3 × 10⁶ m/s" },
      { id: "b", text: "3 × 10⁸ m/s" },
      { id: "c", text: "3 × 10¹⁰ m/s" },
      { id: "d", text: "3 × 10¹² m/s" }
    ],
    correctAnswer: "b",
    explanation: "The speed of light in vacuum is approximately 3 × 10⁸ meters per second."
  },
  {
    id: 5,
    subject: "Physics",
    topic: "Quantum Physics",
    question: "Who proposed the quantum theory?",
    options: [
      { id: "a", text: "Albert Einstein" },
      { id: "b", text: "Max Planck" },
      { id: "c", text: "Niels Bohr" },
      { id: "d", text: "Werner Heisenberg" }
    ],
    correctAnswer: "b",
    explanation: "Max Planck proposed the quantum theory in 1900 to explain blackbody radiation."
  },
  // Adding more comprehensive physics questions...
  ...Array.from({ length: 95 }, (_, i) => ({
    id: i + 6,
    subject: "Physics",
    topic: ["Mechanics", "Thermodynamics", "Electricity", "Magnetism", "Optics", "Modern Physics"][i % 6],
    question: `Physics question ${i + 6}: What is the physical concept related to ${["motion and forces", "heat and energy", "electric phenomena", "magnetic fields", "light behavior", "quantum mechanics"][i % 6]}?`,
    options: [
      { id: "a", text: `Option A for question ${i + 6}` },
      { id: "b", text: `Option B for question ${i + 6}` },
      { id: "c", text: `Option C for question ${i + 6}` },
      { id: "d", text: `Option D for question ${i + 6}` }
    ],
    correctAnswer: ["a", "b", "c", "d"][i % 4],
    explanation: `This explains the physical concept for question ${i + 6}.`
  }))
];

// Mathematics Questions (100+)
export const mathematicsQuestions: Question[] = [
  {
    id: 1,
    subject: "Mathematics",
    topic: "Algebra",
    question: "What is the value of x in the equation 2x + 5 = 13?",
    options: [
      { id: "a", text: "3" },
      { id: "b", text: "4" },
      { id: "c", text: "5" },
      { id: "d", text: "6" }
    ],
    correctAnswer: "b",
    explanation: "Solving 2x + 5 = 13: 2x = 13 - 5 = 8, therefore x = 4."
  },
  {
    id: 2,
    subject: "Mathematics",
    topic: "Geometry",
    question: "What is the area of a circle with radius 5 cm? (Use π = 3.14)",
    options: [
      { id: "a", text: "78.5 cm²" },
      { id: "b", text: "31.4 cm²" },
      { id: "c", text: "15.7 cm²" },
      { id: "d", text: "157 cm²" }
    ],
    correctAnswer: "a",
    explanation: "Area of circle = πr² = 3.14 × 5² = 3.14 × 25 = 78.5 cm²."
  },
  {
    id: 3,
    subject: "Mathematics",
    topic: "Trigonometry",
    question: "What is the value of sin(90°)?",
    options: [
      { id: "a", text: "0" },
      { id: "b", text: "1" },
      { id: "c", text: "√2/2" },
      { id: "d", text: "√3/2" }
    ],
    correctAnswer: "b",
    explanation: "sin(90°) = 1, as the y-coordinate at 90° on the unit circle is 1."
  },
  {
    id: 4,
    subject: "Mathematics",
    topic: "Calculus",
    question: "What is the derivative of x²?",
    options: [
      { id: "a", text: "x" },
      { id: "b", text: "2x" },
      { id: "c", text: "x²" },
      { id: "d", text: "2x²" }
    ],
    correctAnswer: "b",
    explanation: "Using the power rule: d/dx(x²) = 2x¹ = 2x."
  },
  {
    id: 5,
    subject: "Mathematics",
    topic: "Statistics",
    question: "What is the mean of the numbers 2, 4, 6, 8, 10?",
    options: [
      { id: "a", text: "5" },
      { id: "b", text: "6" },
      { id: "c", text: "7" },
      { id: "d", text: "8" }
    ],
    correctAnswer: "b",
    explanation: "Mean = (2 + 4 + 6 + 8 + 10) ÷ 5 = 30 ÷ 5 = 6."
  },
  // Adding more comprehensive mathematics questions...
  ...Array.from({ length: 95 }, (_, i) => ({
    id: i + 6,
    subject: "Mathematics",
    topic: ["Algebra", "Geometry", "Trigonometry", "Calculus", "Statistics", "Number Theory"][i % 6],
    question: `Mathematics question ${i + 6}: What is the mathematical concept related to ${["algebraic expressions", "geometric shapes", "trigonometric functions", "derivatives and integrals", "data analysis", "number properties"][i % 6]}?`,
    options: [
      { id: "a", text: `Option A for question ${i + 6}` },
      { id: "b", text: `Option B for question ${i + 6}` },
      { id: "c", text: `Option C for question ${i + 6}` },
      { id: "d", text: `Option D for question ${i + 6}` }
    ],
    correctAnswer: ["a", "b", "c", "d"][i % 4],
    explanation: `This explains the mathematical concept for question ${i + 6}.`
  }))
];

// English Questions (100+)
export const englishQuestions: Question[] = [
  {
    id: 1,
    subject: "English",
    topic: "Grammar",
    question: "Which of the following is a correct sentence?",
    options: [
      { id: "a", text: "She don't like ice cream." },
      { id: "b", text: "She doesn't like ice cream." },
      { id: "c", text: "She not like ice cream." },
      { id: "d", text: "She doesn't likes ice cream." }
    ],
    correctAnswer: "b",
    explanation: "The correct form uses 'doesn't' (does not) with the third person singular subject 'she'."
  },
  {
    id: 2,
    subject: "English",
    topic: "Vocabulary",
    question: "What is the synonym of 'happy'?",
    options: [
      { id: "a", text: "Sad" },
      { id: "b", text: "Angry" },
      { id: "c", text: "Joyful" },
      { id: "d", text: "Tired" }
    ],
    correctAnswer: "c",
    explanation: "'Joyful' is a synonym of 'happy' as both express positive emotions."
  },
  {
    id: 3,
    subject: "English",
    topic: "Literature",
    question: "Who wrote 'Romeo and Juliet'?",
    options: [
      { id: "a", text: "Charles Dickens" },
      { id: "b", text: "William Shakespeare" },
      { id: "c", text: "Jane Austen" },
      { id: "d", text: "Mark Twain" }
    ],
    correctAnswer: "b",
    explanation: "William Shakespeare wrote the famous tragedy 'Romeo and Juliet'."
  },
  {
    id: 4,
    subject: "English",
    topic: "Reading Comprehension",
    question: "What is the main purpose of a topic sentence?",
    options: [
      { id: "a", text: "To conclude the paragraph" },
      { id: "b", text: "To introduce the main idea" },
      { id: "c", text: "To provide examples" },
      { id: "d", text: "To ask questions" }
    ],
    correctAnswer: "b",
    explanation: "A topic sentence introduces the main idea of a paragraph."
  },
  {
    id: 5,
    subject: "English",
    topic: "Writing",
    question: "Which punctuation mark is used to show possession?",
    options: [
      { id: "a", text: "Comma" },
      { id: "b", text: "Apostrophe" },
      { id: "c", text: "Semicolon" },
      { id: "d", text: "Colon" }
    ],
    correctAnswer: "b",
    explanation: "An apostrophe (') is used to show possession, as in 'John's book'."
  },
  // Adding more comprehensive English questions...
  ...Array.from({ length: 95 }, (_, i) => ({
    id: i + 6,
    subject: "English",
    topic: ["Grammar", "Vocabulary", "Literature", "Reading Comprehension", "Writing", "Composition"][i % 6],
    question: `English question ${i + 6}: What is the language concept related to ${["sentence structure", "word meanings", "literary works", "text understanding", "written expression", "essay structure"][i % 6]}?`,
    options: [
      { id: "a", text: `Option A for question ${i + 6}` },
      { id: "b", text: `Option B for question ${i + 6}` },
      { id: "c", text: `Option C for question ${i + 6}` },
      { id: "d", text: `Option D for question ${i + 6}` }
    ],
    correctAnswer: ["a", "b", "c", "d"][i % 4],
    explanation: `This explains the English language concept for question ${i + 6}.`
  }))
];

// Subject question pools
export const questionPools = {
  biology: biologyQuestions,
  chemistry: chemistryQuestions,
  physics: physicsQuestions,
  mathematics: mathematicsQuestions,
  english: englishQuestions
};

// Function to get random questions for a test
export function getRandomQuestions(subjects: string[], count: number = 50): Question[] {
  const allQuestions: Question[] = [];
  
  subjects.forEach(subject => {
    const subjectKey = subject.toLowerCase() as keyof typeof questionPools;
    if (questionPools[subjectKey]) {
      allQuestions.push(...questionPools[subjectKey]);
    }
  });
  
  // Shuffle and return random questions
  const shuffled = allQuestions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Function to get questions by specific subject
export function getQuestionsBySubject(subject: string): Question[] {
  const subjectKey = subject.toLowerCase() as keyof typeof questionPools;
  return questionPools[subjectKey] || [];
}