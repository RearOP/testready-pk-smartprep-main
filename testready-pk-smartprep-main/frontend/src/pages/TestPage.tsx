import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  ArrowRight,
  BookOpen,
  BarChart3,
  AlertCircle
} from "lucide-react";
import { apiClient, formatTime } from "@/lib/api";

interface Question {
  id: string;
  text: string;
  options: Array<{ id: string; text: string }>;
  marks: number;
}

interface Test {
  id: string;
  title: string;
  description: string;
  totalMarks: number;
  timeLimit: number;
  questions: Question[];
}

const TestPage = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const attemptId = location.state?.attemptId;

  const [test, setTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTest = async () => {
      if (!testId) return;
      
      try {
        const response = await apiClient.getTest(testId);
        if (response.success) {
          setTest(response.data.test);
          setTimeLeft(response.data.test.timeLimit);
        } else {
          setError(response.message || "Failed to load test");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load test");
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [testId]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && test) {
      handleSubmitTest();
    }
  }, [timeLeft, test]);

  const handleAnswerSelect = (optionId: string) => {
    setSelectedAnswer(optionId);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer && test) {
      setAnswers(prev => ({ ...prev, [test.questions[currentQuestion].id]: selectedAnswer }));
    }
    
    if (currentQuestion < test!.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(answers[test!.questions[currentQuestion + 1].id] || null);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedAnswer(answers[test!.questions[currentQuestion - 1].id] || null);
    }
  };

  const handleSubmitTest = async () => {
    if (!test || !attemptId) return;
    
    setSubmitting(true);
    
    try {
      // Add current answer if not already saved
      if (selectedAnswer) {
        setAnswers(prev => ({ ...prev, [test.questions[currentQuestion].id]: selectedAnswer }));
      }

      const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer
      }));

      const response = await apiClient.submitTest(attemptId, answersArray);
      
      if (response.success) {
        navigate("/test-result", { 
          state: { 
            result: response.data.attempt,
            results: response.data.results,
            testTitle: test.title
          } 
        });
      } else {
        setError(response.message || "Failed to submit test");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit test");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!test) return null;

  const currentQ = test.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / test.questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dashboard")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Exit Test</span>
          </Button>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4 text-accent" />
              <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
            </div>
            <Badge variant="outline">
              Question {currentQuestion + 1} of {test.questions.length}
            </Badge>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="max-w-4xl mx-auto">
          {/* Progress Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Progress</p>
                    <p className="text-sm text-muted-foreground">
                      {currentQuestion + 1} of {test.questions.length}
                    </p>
                  </div>
                </div>
                <Progress value={progress} className="mt-3" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-semibold">Time Left</p>
                    <p className="text-sm text-muted-foreground">{formatTime(timeLeft)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <div>
                    <p className="font-semibold">Answered</p>
                    <p className="text-sm text-muted-foreground">
                      {Object.keys(answers).length}/{test.questions.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Total Marks</p>
                    <p className="text-sm text-muted-foreground">{test.totalMarks}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{test.title}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Question {currentQ.id}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold mb-6">
                {currentQ.text}
              </h3>
              
              <div className="space-y-3 mb-6">
                {currentQ.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleAnswerSelect(option.id)}
                    className={`w-full p-4 text-left border rounded-lg transition-all ${
                      selectedAnswer === option.id 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-primary uppercase">{option.id})</span>
                      <span>{option.text}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestion === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                <div className="flex space-x-2">
                  {currentQuestion < test.questions.length - 1 ? (
                    <Button onClick={handleNextQuestion}>
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleSubmitTest}
                      disabled={submitting}
                    >
                      {submitting ? "Submitting..." : "Submit Test"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TestPage;