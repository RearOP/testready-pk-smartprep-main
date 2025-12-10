import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import {
    BookOpen,
    Clock,
    FileText,
    ArrowLeft,
    AlertCircle,
    CheckCircle,
    Award,
    ListChecks,
    Save,
    Plus,
    Trash2,
    XCircle,
    Loader2,
    Eye
} from "lucide-react";
import { apiClient, Test, Question } from "@/lib/api";
import Adminheader from "@/components/Adminheader";

interface Option {
    id: string;
    text: string;
}

interface EditQuestion extends Omit<Question, 'options'> {
    options: Option[];
}

interface EditTestForm {
    title: string;
    description: string;
    timeLimit: string;
    isActive: boolean;
}

const EditTest = () => {
    const navigate = useNavigate();
    const { testId } = useParams<{ testId: string }>();
    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState<EditTestForm>({
        title: "",
        description: "",
        timeLimit: "1800",
        isActive: true
    });

    const [questions, setQuestions] = useState<EditQuestion[]>([]);

    useEffect(() => {
        const fetchTest = async () => {
            if (!testId) return;

            setLoading(true);
            setError("");
            setSuccess("");

            try {
                const response = await apiClient.getTestsSingle(testId);

                if (response.success && response.data.tests) {
                    const testData = response.data.tests;
                    setTest(testData);

                    // Set form values
                    setForm({
                        title: testData.title || "",
                        description: testData.description || "",
                        timeLimit: testData.timeLimit?.toString() || "1800",
                        isActive: testData.isActive ?? true
                    });

                    // Set questions
                    if (testData.questions && Array.isArray(testData.questions)) {
                        const formattedQuestions = testData.questions.map((q): EditQuestion => ({
                            ...q,
                            options: Array.isArray(q.options) ? q.options.map((opt, index) => {
                                if (typeof opt === 'object' && opt !== null && 'id' in opt && 'text' in opt) {
                                    return { id: opt.id, text: opt.text };
                                } else if (typeof opt === 'string') {
                                    return { id: String.fromCharCode(65 + index), text: opt };
                                } else {
                                    return {
                                        id: String.fromCharCode(65 + index),
                                        text: String(opt)
                                    };
                                }
                            }) : []
                        }));
                        setQuestions(formattedQuestions);
                    } else {
                        setQuestions([]);
                    }
                } else {
                    setError(response.message || "Failed to load test");
                }
            } catch (error: any) {
                console.error('Error fetching test:', error);
                setError(error.message || "Failed to load test. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchTest();
    }, [testId]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Form handlers
    const handleFormChange = (field: keyof EditTestForm, value: string | boolean) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleQuestionChange = (index: number, field: keyof EditQuestion, value: string | number) => {
        setQuestions(prev => prev.map((q, i) =>
            i === index ? { ...q, [field]: value } : q
        ));
    };

    const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
        setQuestions(prev => prev.map((q, i) => {
            if (i === qIndex) {
                const newOptions = [...q.options];
                newOptions[optIndex] = { ...newOptions[optIndex], text: value };
                return { ...q, options: newOptions };
            }
            return q;
        }));
    };

    const addQuestion = () => {
        const newQuestion: EditQuestion = {
            id: `temp-${Date.now()}`,
            text: "",
            options: [
                { id: "A", text: "" },
                { id: "B", text: "" },
                { id: "C", text: "" },
                { id: "D", text: "" }
            ],
            correctAnswer: "",
            marks: 1,
            explanation: ""
        };
        setQuestions(prev => [...prev, newQuestion]);
    };

    const removeQuestion = (index: number) => {
        if (questions.length > 1) {
            setQuestions(prev => prev.filter((_, i) => i !== index));
        }
    };

    const addOption = (qIndex: number) => {
        setQuestions(prev => prev.map((q, i) => {
            if (i === qIndex && q.options.length < 6) {
                const newId = String.fromCharCode(65 + q.options.length);
                return {
                    ...q,
                    options: [...q.options, { id: newId, text: "" }]
                };
            }
            return q;
        }));
    };

    const removeOption = (qIndex: number, optIndex: number) => {
        setQuestions(prev => prev.map((q, i) => {
            if (i === qIndex && q.options.length > 2) {
                const newOptions = q.options.filter((_, oi) => oi !== optIndex);
                // Regenerate IDs
                const regeneratedOptions = newOptions.map((opt, idx) => ({
                    ...opt,
                    id: String.fromCharCode(65 + idx)
                }));

                // Update correct answer if it was removed
                const removedId = q.options[optIndex].id;
                const newCorrectAnswer = q.correctAnswer === removedId ? "" : q.correctAnswer;

                return {
                    ...q,
                    options: regeneratedOptions,
                    correctAnswer: newCorrectAnswer
                };
            }
            return q;
        }));
    };

    // Validation
    const validateForm = (): boolean => {
        setError("");

        // Check title
        if (!form.title.trim()) {
            setError("Test title is required");
            return false;
        }

        // Check time limit
        const timeLimit = parseInt(form.timeLimit);
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

            // Validate correct answer exists
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

    // Save all changes
    const handleSaveAll = async () => {
        if (!validateForm()) return;

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            // Calculate total marks from questions
            const calculatedTotalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

            // Prepare complete test data for update
            const updateData = {
                title: form.title.trim(),
                description: form.description.trim() || undefined,
                totalMarks: calculatedTotalMarks,
                timeLimit: parseInt(form.timeLimit),
                isActive: form.isActive,
                questions: questions.map(q => ({
                    id: q.id.startsWith('temp-') ? undefined : q.id, // New questions won't have ID
                    text: q.text.trim(),
                    options: q.options.filter(opt => opt.text.trim() !== ""), // Filter out empty options
                    correctAnswer: q.correctAnswer,
                    marks: q.marks,
                    explanation: q.explanation?.trim() || undefined,
                }))
            };

            console.log("Sending update data:", updateData); // For debugging

            const response = await apiClient.updateTest(testId!, updateData);

            if (response.success) {
                setSuccess("Test updated successfully!");

                // Refresh after delay
                setTimeout(() => {
                    navigate(`/admin/viewtest/${testId}`);
                }, 1500);

            } else {
                setError(response.message || "Failed to update test");
            }
        } catch (error: any) {
            console.error('Error saving test:', error);
            setError(error.message || "Failed to save changes. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
                <Adminheader />
                <div className="container py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Loading test details...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !test) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
                <Adminheader />
                <div className="container py-8">
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    <Button variant="outline" onClick={() => navigate("/admin")}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Tests
                    </Button>
                </div>
            </div>
        );
    }

    if (!test) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
                <Adminheader />
                <div className="container py-8">
                    <Alert variant="default" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>Test not found</AlertDescription>
                    </Alert>
                    <Button variant="outline" onClick={() => navigate("/admin")}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Tests
                    </Button>
                </div>
            </div>
        );
    }

    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
            <Adminheader />

            <div className="container py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Button
                            variant="outline"
                            onClick={() => navigate(`/admin/tests/view/${testId}`)}
                            className="mb-4"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Test
                        </Button>
                        <h1 className="text-3xl font-bold">Edit Test: {test.title}</h1>
                        <p className="text-muted-foreground">
                            Modify test details and questions
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => navigate(`/admin/tests/view/${testId}`)}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            View Test
                        </Button>
                        <Button variant="outline" onClick={() => navigate("/admin")}>
                            <BookOpen className="h-4 w-4 mr-2" />
                            All Tests
                        </Button>
                    </div>
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

                {/* Stats Overview */}
                <Card className="mb-8">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Award className="h-4 w-4 mr-2" />
                                    Total Marks
                                </div>
                                <div className="text-2xl font-bold">{totalMarks}</div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Questions
                                </div>
                                <div className="text-2xl font-bold">{questions.length}</div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4 mr-2" />
                                    Time Limit
                                </div>
                                <div className="text-2xl font-bold">{formatTime(parseInt(form.timeLimit))}</div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <ListChecks className="h-4 w-4 mr-2" />
                                    Status
                                </div>
                                <Badge variant={form.isActive ? "default" : "secondary"}>
                                    {form.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Test Details Card */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Test Information</CardTitle>
                        <CardDescription>
                            Update basic test information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Test Title *</Label>
                            <Input
                                id="title"
                                value={form.title}
                                onChange={(e) => handleFormChange("title", e.target.value)}
                                placeholder="e.g., Biology Chapter 1 Quiz"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={form.description}
                                onChange={(e) => handleFormChange("description", e.target.value)}
                                placeholder="Brief description of the test..."
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="timeLimit">Time Limit (seconds) *</Label>
                                <Input
                                    id="timeLimit"
                                    type="number"
                                    value={form.timeLimit}
                                    onChange={(e) => handleFormChange("timeLimit", e.target.value)}
                                    min="60"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    {Math.floor(parseInt(form.timeLimit) / 60)} minutes
                                </p>
                            </div>

                            <div className="space-y-4">
                                <Label>Test Status</Label>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        checked={form.isActive}
                                        onCheckedChange={(checked) => handleFormChange("isActive", checked)}
                                    />
                                    <span className="text-sm">
                                        {form.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {form.isActive
                                        ? "Test is visible to students"
                                        : "Test is hidden from students"}
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <div className="text-sm text-muted-foreground">
                                <p>Created: {formatDate(test.createdAt)}</p>
                                {test.updatedAt && (
                                    <p>Last Updated: {formatDate(test.updatedAt)}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Questions Card */}
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Questions ({questions.length})</CardTitle>
                                <CardDescription>
                                    Edit or add new questions. Total Marks: {totalMarks}
                                </CardDescription>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addQuestion}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Question
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {questions.length === 0 ? (
                            <div className="text-center py-12">
                                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No Questions Yet</h3>
                                <p className="text-muted-foreground mb-4">
                                    Add your first question to this test
                                </p>
                                <Button onClick={addQuestion}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add First Question
                                </Button>
                            </div>
                        ) : (
                            questions.map((question, qIndex) => (
                                <Card key={question.id} className="overflow-hidden">
                                    <div className="bg-primary/5 px-6 py-3 border-b flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <span className="font-semibold">Question {qIndex + 1}</span>
                                            <Badge variant="outline">
                                                {question.marks} mark{question.marks !== 1 ? 's' : ''}
                                            </Badge>
                                        </div>
                                        {questions.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeQuestion(qIndex)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <CardContent className="pt-6 space-y-4">
                                        {/* Question Text */}
                                        <div className="space-y-2">
                                            <Label>Question Text *</Label>
                                            <Textarea
                                                value={question.text}
                                                onChange={(e) => handleQuestionChange(qIndex, "text", e.target.value)}
                                                placeholder="Enter question text..."
                                                rows={2}
                                            />
                                        </div>

                                        {/* Options */}
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

                                        {/* Correct Answer & Marks */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Correct Answer *</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {question.options
                                                        .filter(opt => opt.text.trim() !== "")
                                                        .map((option) => (
                                                            <Button
                                                                key={option.id}
                                                                type="button"
                                                                variant={question.correctAnswer === option.id ? "default" : "outline"}
                                                                size="sm"
                                                                onClick={() => handleQuestionChange(qIndex, "correctAnswer", option.id)}
                                                            >
                                                                {option.id}
                                                            </Button>
                                                        ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Marks *</Label>
                                                <Input
                                                    type="number"
                                                    value={question.marks}
                                                    onChange={(e) => handleQuestionChange(qIndex, "marks", parseInt(e.target.value) || 1)}
                                                    min="1"
                                                    className="w-24"
                                                />
                                            </div>
                                        </div>

                                        {/* Explanation */}
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
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/admin/tests/view/${testId}`)}
                        disabled={saving}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                    <div className="space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                // Reset form to original values
                                if (test) {
                                    setForm({
                                        title: test.title || "",
                                        description: test.description || "",
                                        timeLimit: test.timeLimit?.toString() || "1800",
                                        isActive: test.isActive ?? true
                                    });

                                    // Reset questions
                                    if (test.questions && Array.isArray(test.questions)) {
                                        const formattedQuestions = test.questions.map((q): EditQuestion => ({
                                            ...q,
                                            options: Array.isArray(q.options) ? q.options.map((opt, index) => {
                                                if (typeof opt === 'object' && opt !== null && 'id' in opt && 'text' in opt) {
                                                    return { id: opt.id, text: opt.text };
                                                } else if (typeof opt === 'string') {
                                                    return { id: String.fromCharCode(65 + index), text: opt };
                                                } else {
                                                    return {
                                                        id: String.fromCharCode(65 + index),
                                                        text: String(opt)
                                                    };
                                                }
                                            }) : []
                                        }));
                                        setQuestions(formattedQuestions);
                                    }
                                }
                                setError("");
                                setSuccess("");
                            }}
                            disabled={saving}
                        >
                            Reset Changes
                        </Button>
                        <Button
                            onClick={handleSaveAll}
                            disabled={saving || questions.length === 0}
                            className="min-w-[120px]"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save All Changes
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditTest;