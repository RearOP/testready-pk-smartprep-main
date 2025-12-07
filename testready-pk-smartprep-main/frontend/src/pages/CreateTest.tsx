import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Plus,
    Trash2,
    Upload,
    Download,
    FileText,
    AlertCircle,
    CheckCircle,
    XCircle,
    BookOpen,
    FileSpreadsheet,
    Info,
    Check,
    X
} from "lucide-react";
import { apiClient } from "@/lib/api";
import * as XLSX from 'xlsx';
import Adminheader from "@/components/Adminheader";

interface Option {
    id: string;
    text: string;
}

interface Question {
    text: string;
    options: Option[];
    correctAnswer: string;
    marks: number;
    explanation?: string;
}

interface ExcelQuestion {
    question: string;
    option1: string;
    option2: string;
    option3: string;
    option4: string;
    correctAnswer: string;
    marks: string;
    explanation?: string;
}

const CreateTest = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("manual");
    const [manualForm, setManualForm] = useState({
        title: "",
        description: "",
        totalMarks: "",
        timeLimit: "1800",
    });
    const [questions, setQuestions] = useState<Question[]>([
        {
            text: "",
            options: [
                { id: "A", text: "" },
                { id: "B", text: "" },
                { id: "C", text: "" },
                { id: "D", text: "" }
            ],
            correctAnswer: "",
            marks: 1,
            explanation: "",
        },
    ]);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importPreview, setImportPreview] = useState<ExcelQuestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Helper to generate option IDs
    const generateOptionId = (index: number): string => {
        return String.fromCharCode(65 + index); // A, B, C, ...
    };

    // Manual Form Functions
    const handleManualInputChange = (field: string, value: string) => {
        setManualForm(prev => ({ ...prev, [field]: value }));
    };

    const handleQuestionChange = (index: number, field: string, value: string) => {
        setQuestions(prev => prev.map((q, i) =>
            i === index ? { ...q, [field]: value } : q
        ));
    };

    const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
        setQuestions(prev => prev.map((q, i) => {
            if (i === qIndex) {
                const newOptions = [...q.options];
                newOptions[optIndex] = {
                    ...newOptions[optIndex],
                    text: value
                };
                return { ...q, options: newOptions };
            }
            return q;
        }));
    };

    const addQuestion = () => {
        const lastQuestionOptions = questions[questions.length - 1]?.options || [];
        const startIndex = lastQuestionOptions.length;

        setQuestions(prev => [...prev, {
            text: "",
            options: [
                { id: generateOptionId(startIndex), text: "" },
                { id: generateOptionId(startIndex + 1), text: "" },
                { id: generateOptionId(startIndex + 2), text: "" },
                { id: generateOptionId(startIndex + 3), text: "" }
            ],
            correctAnswer: "",
            marks: 1,
            explanation: "",
        }]);
    };

    const removeQuestion = (index: number) => {
        if (questions.length > 1) {
            setQuestions(prev => prev.filter((_, i) => i !== index));
        }
    };

    const addOption = (qIndex: number) => {
        setQuestions(prev => prev.map((q, i) => {
            if (i === qIndex) {
                const newIndex = q.options.length;
                return {
                    ...q,
                    options: [
                        ...q.options,
                        { id: generateOptionId(newIndex), text: "" }
                    ]
                };
            }
            return q;
        }));
    };

    const removeOption = (qIndex: number, optIndex: number) => {
        setQuestions(prev => prev.map((q, i) => {
            if (i === qIndex && q.options.length > 2) {
                const newOptions = q.options.filter((_, oi) => oi !== optIndex);
                // If removing the correct answer, clear it
                const removedOptionId = q.options[optIndex]?.id;
                const newCorrectAnswer = q.correctAnswer === removedOptionId ? "" : q.correctAnswer;

                return {
                    ...q,
                    options: newOptions.map((opt, idx) => ({
                        ...opt,
                        id: generateOptionId(idx) // Regenerate IDs to maintain order
                    })),
                    correctAnswer: newCorrectAnswer
                };
            }
            return q;
        }));
    };

    // Excel Import Functions
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImportFile(file);
        setImportPreview([]);
        setError("");
        setSuccess("");

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = event.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelQuestion[];

                if (jsonData.length === 0) {
                    setError("Excel file is empty or has no valid data");
                    return;
                }

                // Log the first few rows for debugging
                console.log("Sample Excel data:", jsonData.slice(0, 3));

                // Validate required fields
                const validationErrors: string[] = [];
                jsonData.forEach((row, index) => {
                    const rowNum = index + 2; // +2 because Excel is 1-indexed and header is row 1

                    // Check question
                    const questionText = row.question?.toString()?.trim();
                    if (!questionText) {
                        validationErrors.push(`Row ${rowNum}: Question text is required`);
                    }

                    // Check at least 2 options are provided
                    const option1 = row.option1?.toString()?.trim();
                    const option2 = row.option2?.toString()?.trim();
                    if (!option1 || !option2) {
                        validationErrors.push(`Row ${rowNum}: At least option1 and option2 are required`);
                    }

                    // Check correct answer - accept multiple formats
                    const correctAnswer = row.correctAnswer?.toString()?.trim();
                    if (!correctAnswer) {
                        validationErrors.push(`Row ${rowNum}: Correct answer is required`);
                    } else {
                        // Convert to string and uppercase for comparison
                        const answerStr = correctAnswer.toString().toUpperCase();
                        // Accept A, B, C, D or 1, 2, 3, 4
                        const validAnswers = ['A', 'B', 'C', 'D', '1', '2', '3', '4'];
                        if (!validAnswers.includes(answerStr)) {
                            validationErrors.push(`Row ${rowNum}: Correct answer must be A, B, C, D or 1, 2, 3, 4. Found: "${correctAnswer}"`);
                        }
                    }

                    // Check marks
                    const marks = row.marks?.toString()?.trim();
                    if (marks && isNaN(parseInt(marks))) {
                        validationErrors.push(`Row ${rowNum}: Marks must be a number. Found: "${marks}"`);
                    }
                });

                if (validationErrors.length > 0) {
                    setError(`Excel validation failed:\n${validationErrors.join('\n')}`);
                    return;
                }

                // Format the data with proper trimming
                const formattedData = jsonData.map((row, index) => ({
                    question: (row.question?.toString() || "").trim(),
                    option1: (row.option1?.toString() || "").trim(),
                    option2: (row.option2?.toString() || "").trim(),
                    option3: (row.option3?.toString() || "").trim(),
                    option4: (row.option4?.toString() || "").trim(),
                    correctAnswer: (row.correctAnswer?.toString() || "A").trim(),
                    marks: row.marks?.toString()?.trim() || "1",
                    explanation: row.explanation?.toString()?.trim() || "",
                }));

                setImportPreview(formattedData);
                setSuccess(`Successfully loaded ${formattedData.length} questions from Excel file`);

            } catch (err) {
                console.error("Excel parse error:", err);
                setError(`Failed to parse Excel file. Please check the format and try again.

Required columns:
- question (text)
- option1 (text)
- option2 (text)
- correctAnswer (A, B, C, D or 1, 2, 3, 4)
- marks (number, optional, defaults to 1)
- option3, option4, explanation (optional)

Download the template for correct format.`);
            }
        };
        reader.onerror = () => {
            setError("Failed to read file. Please try again.");
        };
        reader.readAsBinaryString(file);
    };

    const processImportedData = () => {
        if (importPreview.length === 0) {
            setError("No data to import. Please upload an Excel file first.");
            return;
        }

        setError("");
        setSuccess("");

        const processedQuestions: Question[] = importPreview.map((row, index) => {
            // Collect all non-empty option texts
            const optionTexts = [
                row.option1,
                row.option2,
                row.option3,
                row.option4,
            ].filter(opt => opt.trim() !== "");

            // Create Option objects from texts
            const options: Option[] = optionTexts.map((text, idx) => ({
                id: generateOptionId(idx),
                text: text
            }));

            // Parse and validate correct answer - handle multiple formats
            let correctAnswer = row.correctAnswer.trim().toUpperCase();

            // If answer is a number (1, 2, 3, 4), convert to letter (A, B, C, D)
            if (['1', '2', '3', '4'].includes(correctAnswer)) {
                const num = parseInt(correctAnswer);
                correctAnswer = generateOptionId(num - 1); // 1 -> A, 2 -> B, etc.
            }

            // Validate correct answer is within available options
            const validOptionIds = options.map(opt => opt.id);
            if (!validOptionIds.includes(correctAnswer)) {
                // If still invalid, default to first option
                correctAnswer = options[0]?.id || "A";
            }

            // Parse marks
            let marks = 1;
            try {
                marks = parseInt(row.marks);
                if (isNaN(marks) || marks < 1) marks = 1;
            } catch {
                marks = 1;
            }

            return {
                text: row.question,
                options,
                correctAnswer,
                marks,
                explanation: row.explanation || "",
            };
        });

        // Auto-fill title if empty - ADDED DEFAULT TITLE
        if (!manualForm.title.trim()) {
            const fileName = importFile ? importFile.name.replace(/\.[^/.]+$/, "") : "Imported";
            setManualForm(prev => ({
                ...prev,
                title: `Test: ${fileName}`,
                totalMarks: processedQuestions.reduce((sum, q) => sum + q.marks, 0).toString()
            }));
        } else {
            // Update total marks
            setManualForm(prev => ({
                ...prev,
                totalMarks: processedQuestions.reduce((sum, q) => sum + q.marks, 0).toString()
            }));
        }

        // Auto-fill description if empty
        if (!manualForm.description.trim() && importFile) {
            setManualForm(prev => ({
                ...prev,
                description: `Imported from ${importFile.name} with ${processedQuestions.length} questions`
            }));
        }

        setQuestions(processedQuestions);

        setActiveTab("manual");
        setImportFile(null);
        setImportPreview([]);
        setSuccess(`${processedQuestions.length} questions imported successfully! 
✓ Questions loaded in manual form
✓ Total marks calculated: ${processedQuestions.reduce((sum, q) => sum + q.marks, 0)}
${!manualForm.title.trim() ? '⚠ Please enter a test title before submitting' : '✓ Test title auto-filled'}
Click "Create Test" when ready.`);
    };

    // Also update the handleSubmit function to show specific validation errors:
    const handleSubmit = async () => {
        setError("");
        setSuccess("");

        // First check if title is filled
        if (!manualForm.title.trim()) {
            setError("Test title is required. Please enter a title for your test.");
            return;
        }

        // Check time limit
        const timeLimit = parseInt(manualForm.timeLimit);
        if (isNaN(timeLimit) || timeLimit < 60) {
            setError("Time limit must be at least 60 seconds");
            return;
        }

        // Then run full validation
        if (!validateForm()) return;

        setLoading(true);

        try {
            const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

            const response = await apiClient.createTest({
                title: manualForm.title.trim(),
                description: manualForm.description.trim() || undefined,
                totalMarks: parseInt(manualForm.totalMarks) || totalMarks,
                timeLimit: parseInt(manualForm.timeLimit),
                questions: questions.map(q => ({
                    text: q.text.trim(),
                    options: q.options.filter(opt => opt.text.trim() !== ""), // Filter out empty options
                    correctAnswer: q.correctAnswer,
                    marks: q.marks,
                    explanation: q.explanation?.trim() || undefined,
                })),
            });

            if (response.success) {
                setSuccess("Test created successfully! Redirecting...");
                setTimeout(() => {
                    navigate("/admin");
                }, 2000);
            } else {
                setError(response.message || "Failed to create test");
            }
        } catch (err: any) {
            setError(err.message || "Failed to create test");
        } finally {
            setLoading(false);
        }
    };

    // Validation
    const validateForm = () => {
        setError("");

        // Check title
        if (!manualForm.title.trim()) {
            setError("Test title is required");
            return false;
        }

        // Check time limit
        const timeLimit = parseInt(manualForm.timeLimit);
        if (isNaN(timeLimit) || timeLimit < 60) {
            setError("Time limit must be at least 60 seconds");
            return false;
        }

        // Check questions
        if (questions.length === 0) {
            setError("At least one question is required");
            return false;
        }

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];

            // Check question text
            if (!q.text.trim()) {
                setError(`Question ${i + 1}: Text is required`);
                return false;
            }

            // Check options
            const validOptions = q.options.filter(opt => opt.text.trim() !== "");
            if (validOptions.length < 2) {
                setError(`Question ${i + 1}: At least 2 options are required`);
                return false;
            }

            // Check correct answer
            if (!q.correctAnswer.trim()) {
                setError(`Question ${i + 1}: Correct answer is required`);
                return false;
            }

            // Validate correct answer exists in options
            const correctOption = q.options.find(opt => opt.id === q.correctAnswer);
            if (!correctOption || !correctOption.text.trim()) {
                setError(`Question ${i + 1}: Selected correct answer is not valid`);
                return false;
            }

            // Check marks
            if (q.marks < 1) {
                setError(`Question ${i + 1}: Marks must be at least 1`);
                return false;
            }
        }

        return true;
    };

    // Submit
    // const handleSubmit = async () => {
    //     setError("");
    //     setSuccess("");

    //     if (!validateForm()) return;

    //     setLoading(true);

    //     try {
    //         const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

    //         const response = await apiClient.createTest({
    //             title: manualForm.title.trim(),
    //             description: manualForm.description.trim() || undefined,
    //             totalMarks: parseInt(manualForm.totalMarks) || totalMarks,
    //             timeLimit: parseInt(manualForm.timeLimit),
    //             questions: questions.map(q => ({
    //                 text: q.text.trim(),
    //                 options: q.options.filter(opt => opt.text.trim() !== ""), // Filter out empty options
    //                 correctAnswer: q.correctAnswer,
    //                 marks: q.marks,
    //                 explanation: q.explanation?.trim() || undefined,
    //             })),
    //         });

    //         if (response.success) {
    //             setSuccess("Test created successfully! Redirecting...");
    //             setTimeout(() => {
    //                 navigate("/admin");
    //             }, 2000);
    //         } else {
    //             setError(response.message || "Failed to create test");
    //         }
    //     } catch (err: any) {
    //         setError(err.message || "Failed to create test");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // Download Template
    const downloadTemplate = () => {
        const templateData = [
            {
                question: "What is 2 + 2?",
                option1: "3",
                option2: "4",
                option3: "5",
                option4: "6",
                correctAnswer: "B", // Can also use "2"
                marks: "1",
                explanation: "Basic arithmetic: 2 + 2 = 4"
            },
            {
                question: "What is the capital of France?",
                option1: "London",
                option2: "Berlin",
                option3: "Paris",
                option4: "Madrid",
                correctAnswer: "3", // Can also use "C"
                marks: "2",
                explanation: "Paris has been the capital of France since 508 AD"
            },
            {
                question: "Which planet is known as the Red Planet?",
                option1: "Earth",
                option2: "Mars",
                option3: "Jupiter",
                option4: "Saturn",
                correctAnswer: "B", // Can also use "2"
                marks: "1",
                explanation: "Mars appears red due to iron oxide (rust) on its surface"
            }
        ];

        const ws = XLSX.utils.json_to_sheet(templateData);

        // Add column widths for better readability
        const wscols = [
            { wch: 30 }, // question
            { wch: 15 }, // option1
            { wch: 15 }, // option2
            { wch: 15 }, // option3
            { wch: 15 }, // option4
            { wch: 12 }, // correctAnswer
            { wch: 8 },  // marks
            { wch: 25 }  // explanation
        ];
        ws['!cols'] = wscols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Questions");

        // Create instructions sheet
        const instructions = [
            ["IMPORTANT: DO NOT CHANGE COLUMN HEADERS"],
            [""],
            ["REQUIRED COLUMNS (must have data):"],
            ["- question: The question text"],
            ["- option1: First option (must have value)"],
            ["- option2: Second option (must have value)"],
            ["- correctAnswer: Correct answer letter or number"],
            [""],
            ["OPTIONAL COLUMNS (can be empty):"],
            ["- option3: Third option"],
            ["- option4: Fourth option"],
            ["- marks: Marks per question (default: 1)"],
            ["- explanation: Explanation for correct answer"],
            [""],
            ["CORRECT ANSWER FORMAT:"],
            ["- Letters: A, B, C, D (uppercase or lowercase)"],
            ["- Numbers: 1, 2, 3, 4 (1 = A, 2 = B, etc.)"],
            ["- Example: 'B' or '2' both mean option2 is correct"],
            [""],
            ["MINIMUM REQUIREMENTS:"],
            ["- At least 2 options must have values (option1 & option2)"],
            ["- Question text cannot be empty"],
            ["- Correct answer must be provided"],
            [""],
            ["TIPS:"],
            ["- You can have up to 6 options per question"],
            ["- Empty options will be ignored"],
            ["- Save as .xlsx or .xls format"],
            ["- Maximum file size: 10MB"],
        ];

        const ws2 = XLSX.utils.aoa_to_sheet(instructions);
        ws2['!cols'] = [{ wch: 80 }];
        XLSX.utils.book_append_sheet(wb, ws2, "Instructions");

        XLSX.writeFile(wb, "test-question-template.xlsx");
    };

    useEffect(() => {
        // Clear errors when switching tabs
        setError("");
    }, [activeTab]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
            <Adminheader />

            <div className="container py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Create New Test</h1>
                        <p className="text-muted-foreground">
                            Create a new test manually or import from Excel
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => navigate("/admin")}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        View All Tests
                    </Button>
                </div>

                {error && (
                    <Alert className="mb-6" variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="mb-6" variant="default">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid grid-cols-2 w-full max-w-md">
                        <TabsTrigger value="manual">
                            <FileText className="h-4 w-4 mr-2" />
                            Manual Entry
                        </TabsTrigger>
                        <TabsTrigger value="import">
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Import Excel
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="manual">
                        <Card>
                            <CardHeader>
                                <CardTitle>Test Details</CardTitle>
                                <CardDescription>
                                    Enter test information and questions
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="title">Test Title *</Label>
                                            {!manualForm.title.trim() && (
                                                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                                                    Required before submitting
                                                </span>
                                            )}
                                        </div>
                                        <Input  
                                            id="title"
                                            value={manualForm.title}
                                            onChange={(e) => handleManualInputChange("title", e.target.value)}
                                            placeholder="e.g., Biology Chapter 1 Quiz"
                                            required
                                            className={!manualForm.title.trim() ? "border-amber-500" : ""}
                                        />
                                        {!manualForm.title.trim() && (
                                            <p className="text-xs text-amber-600">
                                                Please enter a title for your test
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="timeLimit">Time Limit (seconds) *</Label>
                                        <Input
                                            id="timeLimit"
                                            type="number"
                                            value={manualForm.timeLimit}
                                            onChange={(e) => handleManualInputChange("timeLimit", e.target.value)}
                                            min="60"
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {Math.floor(parseInt(manualForm.timeLimit) / 60)} minutes
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Textarea
                                        id="description"
                                        value={manualForm.description}
                                        onChange={(e) => handleManualInputChange("description", e.target.value)}
                                        placeholder="Brief description of the test..."
                                        rows={2}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="totalMarks">Total Marks</Label>
                                    <Input
                                        id="totalMarks"
                                        type="number"
                                        value={manualForm.totalMarks || questions.reduce((sum, q) => sum + q.marks, 0)}
                                        onChange={(e) => handleManualInputChange("totalMarks", e.target.value)}
                                        min="1"
                                        readOnly
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Calculated automatically from question marks
                                    </p>
                                </div>

                                <div className="border-t pt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Total Marks: {questions.reduce((sum, q) => sum + q.marks, 0)}
                                            </p>
                                        </div>
                                        <Button type="button" variant="outline" onClick={addQuestion}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Question
                                        </Button>
                                    </div>

                                    <div className="space-y-8">
                                        {questions.map((question, qIndex) => (
                                            <Card key={qIndex}>
                                                <CardContent className="pt-6 space-y-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="space-y-1 flex-1">
                                                            <div className="flex items-center space-x-2 mb-2">
                                                                <Label>Question {qIndex + 1} *</Label>
                                                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                                                    {question.marks} mark{question.marks !== 1 ? 's' : ''}
                                                                </span>
                                                            </div>
                                                            <Textarea
                                                                value={question.text}
                                                                onChange={(e) => handleQuestionChange(qIndex, "text", e.target.value)}
                                                                placeholder="Enter question text..."
                                                                rows={2}
                                                                className="w-full"
                                                            />
                                                        </div>
                                                        {questions.length > 1 && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeQuestion(qIndex)}
                                                                className="ml-4"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label>Options * (At least 2 required)</Label>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {question.options.map((option, optIndex) => (
                                                                <div key={option.id} className="flex items-center space-x-2">
                                                                    <div className="flex items-center space-x-2 flex-1">
                                                                        <span className={`font-medium w-6 ${question.correctAnswer === option.id ? 'text-primary font-bold' : ''}`}>
                                                                            {option.id}.
                                                                        </span>
                                                                        <Input
                                                                            value={option.text}
                                                                            onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                                                                            placeholder={`Option ${option.id}`}
                                                                            className="flex-1"
                                                                        />
                                                                    </div>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => removeOption(qIndex, optIndex)}
                                                                        disabled={question.options.length <= 2}
                                                                    >
                                                                        <XCircle className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {question.options.length < 6 && (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => addOption(qIndex)}
                                                                className="mt-2"
                                                            >
                                                                <Plus className="h-3 w-3 mr-1" />
                                                                Add Option
                                                            </Button>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label>Correct Answer *</Label>
                                                            <div className="flex flex-wrap gap-2">
                                                                {question.options
                                                                    .filter(opt => opt.text.trim() !== "")
                                                                    .map((option, optIndex) => (
                                                                        <Button
                                                                            key={option.id}
                                                                            type="button"
                                                                            variant={question.correctAnswer === option.id ? "default" : "outline"}
                                                                            size="sm"
                                                                            onClick={() => handleQuestionChange(qIndex, "correctAnswer", option.id)}
                                                                            disabled={!option.text.trim()}
                                                                        >
                                                                            {option.id}
                                                                        </Button>
                                                                    ))}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground">
                                                                Select the correct option letter
                                                            </p>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>Marks *</Label>
                                                            <Input
                                                                type="number"
                                                                value={question.marks}
                                                                onChange={(e) => handleQuestionChange(qIndex, "marks", e.target.value)}
                                                                min="1"
                                                                className="w-24"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label>Explanation (Optional)</Label>
                                                        <Textarea
                                                            value={question.explanation || ""}
                                                            onChange={(e) => handleQuestionChange(qIndex, "explanation", e.target.value)}
                                                            placeholder="Explanation for the correct answer..."
                                                            rows={2}
                                                        />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="import">
                        <Card>
                            <CardHeader>
                                <CardTitle>Import from Excel</CardTitle>
                                <CardDescription>
                                    Upload an Excel file with questions. Download the template for correct format.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Instructions Card */}
                                <Card>
                                    <CardHeader className="bg-primary/5 pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Info className="h-5 w-5" />
                                            Excel File Instructions
                                        </CardTitle>
                                        <CardDescription>
                                            Follow these guidelines to prepare your Excel file
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-600" />
                                                    Required Columns (must have these exact headers):
                                                </h4>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                                    <div className="bg-primary/10 p-2 rounded border border-primary/20">
                                                        <span className="font-medium">question</span>
                                                        <p className="text-xs text-muted-foreground">Question text</p>
                                                    </div>
                                                    <div className="bg-primary/10 p-2 rounded border border-primary/20">
                                                        <span className="font-medium">option1</span>
                                                        <p className="text-xs text-muted-foreground">First option</p>
                                                    </div>
                                                    <div className="bg-primary/10 p-2 rounded border border-primary/20">
                                                        <span className="font-medium">option2</span>
                                                        <p className="text-xs text-muted-foreground">Second option</p>
                                                    </div>
                                                    <div className="bg-primary/10 p-2 rounded border border-primary/20">
                                                        <span className="font-medium">correctAnswer</span>
                                                        <p className="text-xs text-muted-foreground">Correct answer</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="font-semibold mb-2">📊 Optional Columns:</h4>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                                                    <div className="bg-secondary/50 p-2 rounded">
                                                        <span className="font-medium">option3</span>
                                                        <p className="text-xs text-muted-foreground">Third option</p>
                                                    </div>
                                                    <div className="bg-secondary/50 p-2 rounded">
                                                        <span className="font-medium">option4</span>
                                                        <p className="text-xs text-muted-foreground">Fourth option</p>
                                                    </div>
                                                    <div className="bg-secondary/50 p-2 rounded">
                                                        <span className="font-medium">explanation</span>
                                                        <p className="text-xs text-muted-foreground">Answer explanation</p>
                                                    </div>
                                                    <div className="bg-secondary/50 p-2 rounded">
                                                        <span className="font-medium">marks</span>
                                                        <p className="text-xs text-muted-foreground">Marks per question (default: 1)</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <h4 className="font-semibold">🎯 Correct Answer Format:</h4>
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div className="border-l-4 border-green-500 pl-3">
                                                        <p className="font-medium flex items-center gap-2">
                                                            <Check className="h-4 w-4 text-green-600" />
                                                            Acceptable formats:
                                                        </p>
                                                        <ul className="list-disc pl-4 mt-1 space-y-1">
                                                            <li>Letters: <strong>A</strong>, <strong>B</strong>, <strong>C</strong>, <strong>D</strong></li>
                                                            <li>Numbers: <strong>1</strong>, <strong>2</strong>, <strong>3</strong>, <strong>4</strong></li>
                                                            <li>Uppercase or lowercase</li>
                                                        </ul>
                                                    </div>
                                                    <div className="border-l-4 border-red-500 pl-3">
                                                        <p className="font-medium flex items-center gap-2">
                                                            <X className="h-4 w-4 text-red-600" />
                                                            Not acceptable:
                                                        </p>
                                                        <ul className="list-disc pl-4 mt-1 space-y-1">
                                                            <li>Full words like "Option A"</li>
                                                            <li>Special characters</li>
                                                            <li>Numbers outside 1-4</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <h4 className="font-semibold">📋 Example Data:</h4>
                                                <div className="bg-secondary/30 p-3 rounded text-sm overflow-x-auto">
                                                    <table className="min-w-full border-collapse">
                                                        <thead className="bg-secondary/50">
                                                            <tr>
                                                                <th className="border p-2 text-left">question</th>
                                                                <th className="border p-2 text-left">option1</th>
                                                                <th className="border p-2 text-left">option2</th>
                                                                <th className="border p-2 text-left">option3</th>
                                                                <th className="border p-2 text-left">option4</th>
                                                                <th className="border p-2 text-left">correctAnswer</th>
                                                                <th className="border p-2 text-left">marks</th>
                                                                <th className="border p-2 text-left">explanation</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td className="border p-2">What is 2 + 2?</td>
                                                                <td className="border p-2">3</td>
                                                                <td className="border p-2">4</td>
                                                                <td className="border p-2">5</td>
                                                                <td className="border p-2">6</td>
                                                                <td className="border p-2 font-bold">B</td>
                                                                <td className="border p-2">1</td>
                                                                <td className="border p-2">Basic arithmetic</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="border p-2">Capital of France?</td>
                                                                <td className="border p-2">London</td>
                                                                <td className="border p-2">Berlin</td>
                                                                <td className="border p-2">Paris</td>
                                                                <td className="border p-2">Madrid</td>
                                                                <td className="border p-2 font-bold">3</td>
                                                                <td className="border p-2">2</td>
                                                                <td className="border p-2">Paris is the capital</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <h4 className="font-semibold">⚡ Quick Tips:</h4>
                                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                                    <li>Save your file as <code className="bg-secondary px-1 rounded">.xlsx</code> or <code className="bg-secondary px-1 rounded">.xls</code></li>
                                                    <li>Headers must be in the first row</li>
                                                    <li>At least 2 options are required (option1 & option2)</li>
                                                    <li>Empty rows will be ignored</li>
                                                    <li>Maximum 10MB file size</li>
                                                    <li>Use the download template button for perfect format</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* File Upload Section */}
                                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <Label htmlFor="file-upload" className="cursor-pointer">
                                        <div className="space-y-2">
                                            <p className="font-medium">Drag & drop Excel file or click to browse</p>
                                            <p className="text-sm text-muted-foreground">
                                                Supports .xlsx, .xls files (Max 10MB)
                                            </p>
                                        </div>
                                        <Input
                                            id="file-upload"
                                            type="file"
                                            accept=".xlsx,.xls"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                    </Label>
                                    {importFile && (
                                        <div className="mt-4">
                                            <p className="text-sm">
                                                Selected: <span className="font-medium">{importFile.name}</span>
                                                <span className="text-muted-foreground ml-2">
                                                    ({Math.round(importFile.size / 1024)} KB)
                                                </span>
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex space-x-3">
                                    <Button
                                        variant="outline"
                                        onClick={downloadTemplate}
                                        className="flex-1"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Template
                                    </Button>
                                    {importPreview.length > 0 && (
                                        <Button
                                            onClick={processImportedData}
                                            className="flex-1"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Import {importPreview.length} Questions
                                        </Button>
                                    )}
                                </div>

                                {/* Preview Section */}
                                {importPreview.length > 0 && (
                                    <div className="border rounded-lg">
                                        <div className="bg-secondary px-4 py-2 border-b">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-medium">Preview ({importPreview.length} questions)</h3>
                                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                                    {importPreview.reduce((sum, q) => sum + (parseInt(q.marks) || 1), 0)} total marks
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Click "Import Questions" to transfer these questions to the manual form
                                            </p>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-muted/50">
                                                        <th className="p-3 text-left text-sm font-medium">#</th>
                                                        <th className="p-3 text-left text-sm font-medium">Question</th>
                                                        <th className="p-3 text-left text-sm font-medium">Options</th>
                                                        <th className="p-3 text-left text-sm font-medium">Correct</th>
                                                        <th className="p-3 text-left text-sm font-medium">Marks</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {importPreview.slice(0, 5).map((row, index) => (
                                                        <tr key={index} className="border-t hover:bg-muted/30">
                                                            <td className="p-3">{index + 1}</td>
                                                            <td className="p-3 max-w-xs truncate" title={row.question}>
                                                                {row.question}
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="text-xs space-y-1">
                                                                    <div className={`${['A', '1'].includes(row.correctAnswer.toUpperCase()) ? 'text-primary font-medium' : ''}`}>
                                                                        A. {row.option1 || <span className="text-muted-foreground">Empty</span>}
                                                                    </div>
                                                                    <div className={`${['B', '2'].includes(row.correctAnswer.toUpperCase()) ? 'text-primary font-medium' : ''}`}>
                                                                        B. {row.option2 || <span className="text-muted-foreground">Empty</span>}
                                                                    </div>
                                                                    <div className={`${['C', '3'].includes(row.correctAnswer.toUpperCase()) ? 'text-primary font-medium' : ''}`}>
                                                                        C. {row.option3 || <span className="text-muted-foreground">Empty</span>}
                                                                    </div>
                                                                    <div className={`${['D', '4'].includes(row.correctAnswer.toUpperCase()) ? 'text-primary font-medium' : ''}`}>
                                                                        D. {row.option4 || <span className="text-muted-foreground">Empty</span>}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="p-3">
                                                                <span className="font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                                                                    {row.correctAnswer}
                                                                </span>
                                                            </td>
                                                            <td className="p-3">{row.marks}</td>
                                                        </tr>
                                                    ))}
                                                    {importPreview.length > 5 && (
                                                        <tr>
                                                            <td colSpan={5} className="p-3 text-center text-sm text-muted-foreground">
                                                                ... and {importPreview.length - 5} more questions
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="mt-6 flex justify-end space-x-3">
                    <Button
                        variant="outline"
                        onClick={() => navigate("/admin")}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || questions.length === 0}
                        className="min-w-[120px]"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Creating...
                            </>
                        ) : (
                            "Create Test"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreateTest;