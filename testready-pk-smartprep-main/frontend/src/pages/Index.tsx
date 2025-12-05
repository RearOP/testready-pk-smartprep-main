import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SubjectGrid from "@/components/SubjectGrid";
import MCQPractice from "@/components/MCQPractice";
import Features from "@/components/Features";
import Leaderboard from "@/components/Leaderboard";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <SubjectGrid />
      <MCQPractice />
      <Features />
      <Leaderboard />
    </div>
  );
};

export default Index;
