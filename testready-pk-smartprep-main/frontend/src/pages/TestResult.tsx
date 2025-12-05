import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  XCircle, 
  BookOpen,
  BarChart3,
  Home,
  Trophy,
  Clock,
  Target
} from "lucide-react";
import { formatDate } from "@/lib/api";

interface TestResult {
  id: string;
  score: number;
  totalMarks: number;
  percentage: number;
  completedAt: string;
}

interface QuestionResult {
  questionId: string;
  questionText: string;
  userAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  marks: number;
  explanation: string;
}

const TestResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { result, results, testTitle } = location.state as {
    result: TestResult;
    results: QuestionResult[];
    testTitle: string;
  };

  if (!result || !results) {
    navigate("/dashboard");
    return null;
  }

  const correctAnswers = results.filter(r => r.isCorrect).length;
  const incorrectAnswers = results.length - correctAnswers;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <div className="mb-4">
            {result.percentage >= 80 ? (
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="h-10 w-10 text-success" />
              </div>
            ) : result.percentage >= 60 ? (
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                <BarChart3 className="h-10 w-10 text-accent" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <Target className="h-10 w-10 text-destructive" />
              </div>
            )}
          </div>
          <CardTitle className="text-3xl mb-2">Test Completed!</CardTitle>
          <CardDescription className="text-lg">{testTitle}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Score Summary */}
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">
              {result.score}/{result.totalMarks}
            </div>
            <div className="text-2xl font-semibold mb-4">
              {result.percentage.toFixed(1)}%
            </div>
            <Progress value={result.percentage} className="w-full max-w-md mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Completed on {formatDate(result.completedAt)}
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <div className="text-2xl font-bold text-success">{correctAnswers}</div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
            <div className="text-center p-4 bg-destructive/10 rounded-lg">
              <div className="text-2xl font-bold text-destructive">{incorrectAnswers}</div>
              <div className="text-sm text-muted-foreground">Incorrect</div>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-2xl font-bold text-primary">{results.length}</div>
              <div className="text-sm text-muted-foreground">Total Questions</div>
            </div>
          </div>

          {/* Performance Analysis */}
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Performance Analysis</h3>
            <p className="text-sm text-muted-foreground">
              {result.percentage >= 80 
                ? "Excellent work! You have a strong understanding of the topics covered."
                : result.percentage >= 60
                ? "Good effort! Review the incorrect answers to improve your understanding."
                : "Keep practicing! Focus on the topics where you had difficulties."
              }
            </p>
          </div>

          {/* Question Review */}
          <div>
            <h3 className="font-semibold mb-4">Question Review</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {results.map((question, index) => (
                <div key={question.questionId} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">Question {index + 1}</h4>
                    <div className="flex items-center space-x-2">
                      {question.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                      <Badge variant={question.isCorrect ? "default" : "destructive"}>
                        {question.marks} mark{question.marks !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm mb-3">{question.questionText}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Your answer:</span>
                      <span className={question.isCorrect ? "text-success" : "text-destructive"}>
                        {question.userAnswer || "Not answered"}
                      </span>
                    </div>
                    
                    {!question.isCorrect && (
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Correct answer:</span>
                        <span className="text-success">{question.correctAnswer}</span>
                      </div>
                    )}
                    
                    {question.explanation && (
                      <div className="mt-2 p-2 bg-muted rounded">
                        <span className="font-medium">Explanation:</span>
                        <p className="text-muted-foreground">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              className="flex-1" 
              onClick={() => navigate("/dashboard")}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Take Another Test
            </Button>
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => navigate("/dashboard")}
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestResult;
