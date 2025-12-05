import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Clock, BookOpen } from "lucide-react";
import { getRandomQuestions, type Question } from "@/data/questions";

const MCQPractice = () => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  useEffect(() => {
    // Get a random question from all subjects
    const randomQuestions = getRandomQuestions(['biology', 'chemistry', 'physics', 'mathematics', 'english'], 1);
    if (randomQuestions.length > 0) {
      setCurrentQuestion(randomQuestions[0]);
    }
  }, []);

  const handleAnswerSelect = (optionId: string) => {
    if (!isAnswered) {
      setSelectedAnswer(optionId);
    }
  };

  const handleSubmit = () => {
    setIsAnswered(true);
  };

  const getOptionStyle = (optionId: string) => {
    if (!isAnswered) {
      return selectedAnswer === optionId 
        ? "border-primary bg-primary/5" 
        : "border-border hover:border-primary/50";
    }
    
    if (optionId === currentQuestion?.correctAnswer) {
      return "border-success bg-success/10";
    }
    
    if (optionId === selectedAnswer && optionId !== currentQuestion?.correctAnswer) {
      return "border-destructive bg-destructive/10";
    }
    
    return "border-border opacity-60";
  };

  if (!currentQuestion) {
    return (
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Interactive MCQ Practice</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience our smart testing interface with instant feedback and detailed explanations
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Progress</p>
                    <p className="text-sm text-muted-foreground">Question 1 of 20</p>
                  </div>
                </div>
                <Progress value={5} className="mt-3" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-semibold">Time Left</p>
                    <p className="text-sm text-muted-foreground">18:45</p>
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
                    <p className="text-sm text-muted-foreground">0/0 (0%)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{currentQuestion.subject}</Badge>
                  <Badge variant="secondary">{currentQuestion.topic}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">Question {currentQuestion.id}</div>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold mb-6">{currentQuestion.question}</h3>
              
              <div className="space-y-3 mb-6">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleAnswerSelect(option.id)}
                    className={`w-full p-4 text-left border rounded-lg transition-all ${getOptionStyle(option.id)}`}
                    disabled={isAnswered}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-primary uppercase">{option.id})</span>
                      <span>{option.text}</span>
                      {isAnswered && option.id === currentQuestion.correctAnswer && (
                        <CheckCircle className="h-5 w-5 text-success ml-auto" />
                      )}
                      {isAnswered && option.id === selectedAnswer && option.id !== currentQuestion.correctAnswer && (
                        <XCircle className="h-5 w-5 text-destructive ml-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {!isAnswered ? (
                <Button 
                  onClick={handleSubmit} 
                  disabled={!selectedAnswer}
                  className="w-full"
                >
                  Submit Answer
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2 text-primary">
                      {selectedAnswer === currentQuestion.correctAnswer ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-success inline mr-2" />
                          Correct! Well done.
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-destructive inline mr-2" />
                          Incorrect. The correct answer is {currentQuestion.correctAnswer.toUpperCase()}.
                        </>
                      )}
                    </h4>
                    <h4 className="font-semibold mb-2 text-primary">Explanation:</h4>
                    <p className="text-sm">{currentQuestion.explanation}</p>
                  </div>
                  <div className="flex space-x-4">
                    <Button className="flex-1">Next Question</Button>
                    <Button variant="outline" className="flex-1">Review Answer</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default MCQPractice;