import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    BookOpen,
    Clock,
    FileText,
    ArrowLeft,
    AlertCircle,
    CheckCircle,
    Award,
    ListChecks
} from "lucide-react";
import { apiClient, Test, Question } from "@/lib/api";
import Adminheader from "@/components/Adminheader";

interface Option {
    id: string;
    text: string;
}

const ViewTest = () => {
    const navigate = useNavigate();
    const { testId } = useParams<{ testId: string }>();
    const [test, setTest] = useState<Test | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

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
                } else {
                    setError(response.message || "Test not found");
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

    // Helper to get options from question
    const getOptions = (question: Question): Option[] => {
        if (!question.options || !Array.isArray(question.options)) {
            return [];
        }

        // Your API returns options as Array<{id: string, text: string}>
        return question.options;
    };

    // Helper to get correct answer
    const getCorrectAnswer = (question: Question): string => {

        if (!question.correctAnswer) {
            console.log("No correctAnswer found for question:", question.id);
            return "";
        }

        const answer = question.correctAnswer.toString().toUpperCase();
        return answer;
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

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
                <Adminheader />
                <div className="container py-8">
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    <Button variant="outline" onClick={() => navigate("/admin/tests")}>
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
                    <Button variant="outline" onClick={() => navigate("/admin/tests")}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Tests
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
            <Adminheader />

            <div className="container py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Button
                            variant="outline"
                            onClick={() => navigate("/admin")}
                            className="mb-4"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Tests
                        </Button>
                        <h1 className="text-3xl font-bold">Title: {test.title}</h1>
                        <p className="text-muted-foreground">
                            View test details and questions
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" onClick={() => navigate("/admin")}>
                            <BookOpen className="h-4 w-4 mr-2" />
                            All Tests
                        </Button>
                        <Button
                            variant="default"
                            onClick={() => navigate(`/admin/tests/edit/${test.id}`)}
                        >
                            Edit Test
                        </Button>
                    </div>
                </div>

                {success && (
                    <Alert className="mb-6" variant="default">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                )}

                {/* Test Overview Card */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Test Overview</CardTitle>
                        <CardDescription>
                            Basic information about this test
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Award className="h-4 w-4 mr-2" />
                                    Total Marks
                                </div>
                                <div className="text-2xl font-bold">{test.totalMarks}</div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4 mr-2" />
                                    Time Limit
                                </div>
                                <div className="text-2xl font-bold">{formatTime(test.timeLimit)}</div>
                                <p className="text-xs text-muted-foreground">
                                    {Math.floor(test.timeLimit / 60)} minutes
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Questions
                                </div>
                                <div className="text-2xl font-bold">{test.questions?.length || 0}</div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <ListChecks className="h-4 w-4 mr-2" />
                                    Status
                                </div>
                                <Badge variant={test.isActive ? "default" : "secondary"}>
                                    {test.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                        </div>

                        {test.description && (
                            <div className="mt-6 pt-6 border-t">
                                <h3 className="font-semibold mb-2">Description</h3>
                                <p className="text-muted-foreground">{test.description}</p>
                            </div>
                        )}

                        <div className="mt-6 pt-6 border-t">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Created:</span>
                                    <span className="ml-2">{formatDate(test.createdAt)}</span>
                                </div>
                                {(test as any).updatedAt && (
                                    <div>
                                        <span className="text-muted-foreground">Last Updated:</span>
                                        <span className="ml-2">{formatDate((test as any).updatedAt)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Questions Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Questions ({test.questions?.length || 0})</CardTitle>
                        <CardDescription>
                            All questions in this test. Total Marks: {test.totalMarks}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {test.questions && test.questions.length > 0 ? (
                            <div className="space-y-6">
                                {test.questions.map((question, index) => {
                                    const options = getOptions(question);
                                    const correctAnswer = getCorrectAnswer(question);

                                    return (
                                        <Card key={question.id} className="overflow-hidden">
                                            <div className="bg-primary/5 px-6 py-3 border-b flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <span className="font-semibold">Question {index + 1}</span>
                                                </div>
                                                <span className="text-sm text-muted-foreground">
                                                    <Badge variant="outline" className="ml-2">
                                                        {question.marks} mark{question.marks !== 1 ? 's' : ''}
                                                    </Badge>
                                                </span>
                                            </div>
                                            <CardContent className="pt-6 space-y-4">
                                                {/* Question Text */}
                                                <div className="space-y-2">
                                                    <h3 className="font-medium text-lg">{question.text}</h3>
                                                </div>

                                                {/* Options */}
                                                {options.length > 0 ? (
                                                    <div className="space-y-2">
                                                        <h4 className="font-medium">Options:</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {options.map((option, optIndex) => (
                                                                <div
                                                                    key={option.id || optIndex}
                                                                    className={`p-3 rounded border ${correctAnswer === option.id ? 'bg-primary/10 border-primary' : 'bg-card'}`}
                                                                >
                                                                    <div className="flex items-start space-x-2">
                                                                        <span className={`font-bold ${correctAnswer === option.id ? 'text-primary' : 'text-muted-foreground'}`}>
                                                                            {option.id}.
                                                                        </span>
                                                                        <span className={correctAnswer === option.id ? 'font-medium' : ''}>
                                                                            {option.text}
                                                                        </span>
                                                                        {correctAnswer === option.id && (
                                                                            <Badge className="ml-2" variant="default">
                                                                                Correct
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-muted-foreground p-4 bg-secondary/30 rounded">
                                                        No options available or options in unexpected format
                                                        <div className="mt-2 text-xs">
                                                            Options data: {JSON.stringify(question.options)}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Correct Answer & Explanation */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <h4 className="font-medium">Correct Answer:</h4>
                                                        <div className="flex items-center space-x-2">
                                                            {correctAnswer ? (
                                                                <>
                                                                    <Badge variant="default" className="text-lg px-3 py-1">
                                                                        {correctAnswer}
                                                                    </Badge>
                                                                    <span className="text-sm text-muted-foreground">
                                                                        Option {correctAnswer} is correct
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <div className="space-y-1">
                                                                    <span className="text-sm text-muted-foreground">
                                                                        No correct answer specified in database
                                                                    </span>
                                                                    <div className="text-xs text-amber-600">
                                                                        Raw data: {JSON.stringify(question.correctAnswer)}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {question.explanation && (
                                                        <div className="space-y-2">
                                                            <h4 className="font-medium">Explanation:</h4>
                                                            <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded">
                                                                {question.explanation}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No Questions Found</h3>
                                <p className="text-muted-foreground mb-4">
                                    This test doesn't have any questions yet.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate(`/admin/tests/edit/${test.id}`)}
                                >
                                    Add Questions
                                </Button>
                            </div>
                        )}

                        {/* Summary Stats */}
                        {test.questions && test.questions.length > 0 && (
                            <div className="pt-6 border-t">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-secondary/30 p-4 rounded-lg">
                                        <div className="text-sm text-muted-foreground">Total Questions</div>
                                        <div className="text-2xl font-bold">{test.questions.length}</div>
                                    </div>
                                    <div className="bg-secondary/30 p-4 rounded-lg">
                                        <div className="text-sm text-muted-foreground">Average Marks per Question</div>
                                        <div className="text-2xl font-bold">
                                            {(test.totalMarks / test.questions.length).toFixed(1)}
                                        </div>
                                    </div>
                                    <div className="bg-secondary/30 p-4 rounded-lg">
                                        <div className="text-sm text-muted-foreground">Total Test Time</div>
                                        <div className="text-2xl font-bold">{formatTime(test.timeLimit)}</div>
                                        <div className="text-xs text-muted-foreground">
                                            ~{Math.floor(test.timeLimit / test.questions.length)} sec/question
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ViewTest;