import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  ArrowRight,
  BookOpen,
  BarChart3,
  Home
} from "lucide-react";
import { getRandomQuestions, type Question } from "@/data/questions";

const Test = () => {
  const [searchParams] = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes for more questions
  const [score, setScore] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);

  useEffect(() => {
    // Get subject from URL params or default to mixed subjects
    const subject = searchParams.get('subject') || 'mixed';
    let testQuestions: Question[] = [];
    
    if (subject === 'mixed') {
      // Mixed test with questions from all subjects
      testQuestions = getRandomQuestions(['biology', 'chemistry', 'physics', 'mathematics', 'english'], 50);
    } else {
      // Subject-specific test
      testQuestions = getRandomQuestions([subject], 50);
    }
    
    setQuestions(testQuestions);
  }, [searchParams]);

  useEffect(() => {
    if (timeLeft > 0 && !testCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setTestCompleted(true);
    }
  }, [timeLeft, testCompleted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (optionId: string) => {
    if (!isAnswered) {
      setSelectedAnswer(optionId);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer) {
      setIsAnswered(true);
      setAnswers(prev => ({ ...prev, [currentQuestion]: selectedAnswer }));
      
      if (selectedAnswer === questions[currentQuestion]?.correctAnswer) {
        setScore(prev => prev + 1);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setTestCompleted(true);
    }
  };

  const getOptionStyle = (optionId: string) => {
    if (!isAnswered) {
      return selectedAnswer === optionId 
        ? "border-primary bg-primary/5" 
        : "border-border hover:border-primary/50";
    }
    
    if (optionId === questions[currentQuestion]?.correctAnswer) {
      return "border-success bg-success/10";
    }
    
    if (optionId === selectedAnswer && optionId !== questions[currentQuestion]?.correctAnswer) {
      return "border-destructive bg-destructive/10";
    }
    
    return "border-border opacity-60";
  };

  const calculatePercentage = () => {
    return Math.round((score / questions.length) * 100);
  };

  if (testCompleted || questions.length === 0) {
    if (questions.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading questions...</p>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  if (testCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mb-4">
              {calculatePercentage() >= 80 ? (
                <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-10 w-10 text-success" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                  <BarChart3 className="h-10 w-10 text-accent" />
                </div>
              )}
            </div>
            <CardTitle className="text-3xl mb-2">Test Completed!</CardTitle>
            <p className="text-muted-foreground">Here are your results</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {score}/{questions.length}
              </div>
              <div className="text-2xl font-semibold mb-4">
                {calculatePercentage()}%
              </div>
              <Progress value={calculatePercentage()} className="w-full max-w-md mx-auto" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-success/10 rounded-lg">
                <div className="text-2xl font-bold text-success">{score}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="text-center p-4 bg-destructive/10 rounded-lg">
                <div className="text-2xl font-bold text-destructive">{questions.length - score}</div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">{formatTime(1800 - timeLeft)}</div>
                <div className="text-sm text-muted-foreground">Time Taken</div>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Performance Analysis</h3>
              <p className="text-sm text-muted-foreground">
                {calculatePercentage() >= 80 
                  ? "Excellent work! You have a strong understanding of the topics covered."
                  : calculatePercentage() >= 60
                  ? "Good effort! Review the incorrect answers to improve your understanding."
                  : "Keep practicing! Focus on the topics where you had difficulties."
                }
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="flex-1" onClick={() => window.location.reload()}>
                <BookOpen className="h-4 w-4 mr-2" />
                Take Another Test
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-primary hover:text-primary/80">
            <ArrowLeft className="h-4 w-4" />
            <span>Exit Test</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4 text-accent" />
              <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
            </div>
            <Badge variant="outline">
              Question {currentQuestion + 1} of {questions.length}
            </Badge>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Progress</p>
                    <p className="text-sm text-muted-foreground">
                      {currentQuestion + 1} of {questions.length}
                    </p>
                  </div>
                </div>
                <Progress value={((currentQuestion + 1) / questions.length) * 100} className="mt-3" />
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
                    <p className="font-semibold">Score</p>
                    <p className="text-sm text-muted-foreground">
                      {score}/{Object.keys(answers).length} ({Object.keys(answers).length > 0 ? Math.round((score / Object.keys(answers).length) * 100) : 0}%)
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
                    <p className="font-semibold">Answered</p>
                    <p className="text-sm text-muted-foreground">
                      {Object.keys(answers).length}/{questions.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{questions[currentQuestion]?.subject}</Badge>
                  <Badge variant="secondary">{questions[currentQuestion]?.topic}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Question {questions[currentQuestion]?.id}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold mb-6">
                {questions[currentQuestion]?.question}
              </h3>
              
              <div className="space-y-3 mb-6">
                {questions[currentQuestion]?.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleAnswerSelect(option.id)}
                    className={`w-full p-4 text-left border rounded-lg transition-all ${getOptionStyle(option.id)}`}
                    disabled={isAnswered}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-primary uppercase">{option.id})</span>
                      <span>{option.text}</span>
                      {isAnswered && option.id === questions[currentQuestion]?.correctAnswer && (
                        <CheckCircle className="h-5 w-5 text-success ml-auto" />
                      )}
                      {isAnswered && option.id === selectedAnswer && option.id !== questions[currentQuestion]?.correctAnswer && (
                        <XCircle className="h-5 w-5 text-destructive ml-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {!isAnswered ? (
                <Button 
                  onClick={handleSubmitAnswer} 
                  disabled={!selectedAnswer}
                  className="w-full"
                >
                  Submit Answer
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2 text-primary">Explanation:</h4>
                    <p className="text-sm">{questions[currentQuestion]?.explanation}</p>
                  </div>
                  <Button onClick={handleNextQuestion} className="w-full">
                    {currentQuestion < questions.length - 1 ? (
                      <>
                        Next Question
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    ) : (
                      "Finish Test"
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Test;