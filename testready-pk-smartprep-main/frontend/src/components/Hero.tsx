import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Star, Users, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6">
            🇵🇰 Pakistan's #1 Test Prep Platform
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Ace Your Board & Entry Tests
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Smart MCQ practice for Matric, FSc, MDCAT, ECAT & CSS. Track progress, compete with peers, and get AI-powered recommendations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8" asChild>
              <Link to="/test">
                <PlayCircle className="mr-2 h-5 w-5" />
                Start Free Practice
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              View Demo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">50,000+ Students</h3>
              <p className="text-sm text-muted-foreground">Join Pakistan's largest test prep community</p>
            </div>
            
            <div className="text-center">
              <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">AI-Powered</h3>
              <p className="text-sm text-muted-foreground">Smart recommendations based on your weak areas</p>
            </div>
            
            <div className="text-center">
              <div className="bg-success/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-success" />
              </div>
              <h3 className="font-semibold mb-2">95% Success Rate</h3>
              <p className="text-sm text-muted-foreground">Students improve their scores significantly</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;