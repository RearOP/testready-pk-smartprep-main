import { useState } from "react";
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
    FileSpreadsheet
} from "lucide-react";
import { apiClient } from "@/lib/api";
import * as XLSX from 'xlsx';
import Adminheader from "@/components/Adminheader";

interface Question {
    text: string;
    options: string[]; // Changed from object array to string array
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
            options: ["", "", "", ""], // Changed to string array
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
                newOptions[optIndex] = value;
                return { ...q, options: newOptions };
            }
            return q;
        }));
    };

    const addQuestion = () => {
        setQuestions(prev => [...prev, {
            text: "",
            options: ["", "", "", ""],
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
                return {
                    ...q,
                    options: [...q.options, ""]
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
                const optionLetters = ["A", "B", "C", "D", "E", "F"];
                const removedLetter = optionLetters[optIndex];
                const newCorrectAnswer = q.correctAnswer === removedLetter ? "" : q.correctAnswer;

                return {
                    ...q,
                    options: newOptions,
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

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = event.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelQuestion[];

                // Validate and format the data
                const formattedData = jsonData.map((row, index) => ({
                    question: row.question?.toString() || `Question ${index + 1}`,
                    option1: row.option1?.toString() || "",
                    option2: row.option2?.toString() || "",
                    option3: row.option3?.toString() || "",
                    option4: row.option4?.toString() || "",
                    correctAnswer: row.correctAnswer?.toString()?.toUpperCase() || "A",
                    marks: row.marks?.toString() || "1",
                    explanation: row.explanation?.toString() || "",
                }));

                setImportPreview(formattedData);
            } catch (err) {
                setError("Failed to parse Excel file. Please check the format.");
            }
        };
        reader.readAsBinaryString(file);
    };

    const processImportedData = () => {
        if (importPreview.length === 0) return;

        const processedQuestions: Question[] = importPreview.map((row, index) => {
            const options = [
                row.option1,
                row.option2,
                row.option3,
                row.option4,
            ].filter(opt => opt.trim() !== "");

            return {
                text: row.question,
                options,
                correctAnswer: row.correctAnswer,
                marks: parseInt(row.marks) || 1,
                explanation: row.explanation,
            };
        });

        setQuestions(processedQuestions);

        // Calculate total marks
        const totalMarks = processedQuestions.reduce((sum, q) => sum + q.marks, 0);
        setManualForm(prev => ({ ...prev, totalMarks: totalMarks.toString() }));

        setActiveTab("manual");
        setImportFile(null);
        setImportPreview([]);
        setSuccess(`${processedQuestions.length} questions imported successfully!`);
    };

    // Validation
    const validateForm = () => {
        if (!manualForm.title.trim()) {
            setError("Test title is required");
            return false;
        }

        if (questions.length === 0) {
            setError("At least one question is required");
            return false;
        }

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.text.trim()) {
                setError(`Question ${i + 1}: Text is required`);
                return false;
            }

            const validOptions = q.options.filter(opt => opt.trim() !== "");
            if (validOptions.length < 2) {
                setError(`Question ${i + 1}: At least 2 options are required`);
                return false;
            }

            if (!q.correctAnswer) {
                setError(`Question ${i + 1}: Correct answer is required`);
                return false;
            }

            // Convert correct answer letter to index (A=0, B=1, etc.)
            const correctIndex = q.correctAnswer.charCodeAt(0) - 65;
            if (correctIndex < 0 || correctIndex >= q.options.length || !q.options[correctIndex]?.trim()) {
                setError(`Question ${i + 1}: Selected correct answer is not valid`);
                return false;
            }
        }

        return true;
    };

    // Submit
    const handleSubmit = async () => {
        setError("");
        setSuccess("");

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
                    options: q.options.filter(opt => opt.trim() !== ""), // Filter out empty options
                    correctAnswer: q.correctAnswer,
                    marks: q.marks,
                    explanation: q.explanation?.trim() || undefined,
                })),
            });

            if (response.success) {
                setSuccess("Test created successfully! Redirecting...");
                setTimeout(() => {
                    navigate("/admin/tests");
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

    // Download Template
    const downloadTemplate = () => {
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

        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Questions");
        XLSX.writeFile(wb, "test-template.xlsx");
    };

    // Get option letter from index
    const getOptionLetter = (index: number): string => {
        return String.fromCharCode(65 + index); // A, B, C, ...
    };

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
                    <Button variant="outline" onClick={() => navigate("/admin/tests")}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        View All Tests
                    </Button>
                </div>

                {error && (
                    <Alert className="mb-6" variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
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
                                        <Label htmlFor="title">Test Title *</Label>
                                        <Input
                                            id="title"
                                            value={manualForm.title}
                                            onChange={(e) => handleManualInputChange("title", e.target.value)}
                                            placeholder="e.g., Biology Chapter 1 Quiz"
                                            required
                                        />
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
                                                                <div key={optIndex} className="flex items-center space-x-2">
                                                                    <div className="flex items-center space-x-2 flex-1">
                                                                        <span className={`font-medium w-6 ${question.correctAnswer === getOptionLetter(optIndex) ? 'text-primary font-bold' : ''}`}>
                                                                            {getOptionLetter(optIndex)}.
                                                                        </span>
                                                                        <Input
                                                                            value={option}
                                                                            onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                                                                            placeholder={`Option ${getOptionLetter(optIndex)}`}
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
                                                                {question.options.map((option, optIndex) => (
                                                                    <Button
                                                                        key={optIndex}
                                                                        type="button"
                                                                        variant={question.correctAnswer === getOptionLetter(optIndex) ? "default" : option.trim() ? "outline" : "ghost"}
                                                                        size="sm"
                                                                        onClick={() => handleQuestionChange(qIndex, "correctAnswer", getOptionLetter(optIndex))}
                                                                        disabled={!option.trim()}
                                                                    >
                                                                        {getOptionLetter(optIndex)}
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
                                            Process {importPreview.length} Questions
                                        </Button>
                                    )}
                                </div>

                                {importPreview.length > 0 && (
                                    <div className="border rounded-lg">
                                        <div className="bg-secondary px-4 py-2 border-b">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-medium">Preview ({importPreview.length} questions)</h3>
                                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                                    {importPreview.reduce((sum, q) => sum + (parseInt(q.marks) || 1), 0)} total marks
                                                </span>
                                            </div>
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
                                                                    <div className={`${row.correctAnswer === 'A' ? 'text-primary font-medium' : ''}`}>
                                                                        A. {row.option1 || <span className="text-muted-foreground">Empty</span>}
                                                                    </div>
                                                                    <div className={`${row.correctAnswer === 'B' ? 'text-primary font-medium' : ''}`}>
                                                                        B. {row.option2 || <span className="text-muted-foreground">Empty</span>}
                                                                    </div>
                                                                    <div className={`${row.correctAnswer === 'C' ? 'text-primary font-medium' : ''}`}>
                                                                        C. {row.option3 || <span className="text-muted-foreground">Empty</span>}
                                                                    </div>
                                                                    <div className={`${row.correctAnswer === 'D' ? 'text-primary font-medium' : ''}`}>
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