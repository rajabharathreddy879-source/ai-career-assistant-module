import { Link } from 'wouter';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Bot, FileText, Target, Award, Code, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen AI Career Assistant Powered by Gemini 2.5 Flash</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground font-serif max-w-4xl mx-auto leading-tight">
          Supercharge Your Tech Career & Dominate Technical Interviews
        </h1>

        <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Upload your resume, paste target job descriptions, and let your personalized AI career mentor optimize your ATS score, craft learning roadmaps, and prep you for Node.js, React, and System Design interviews.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/signup">
            <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base font-semibold shadow-lg shadow-primary/20 gap-2">
              Start Free AI Consultation
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-base font-semibold">
              Sign In to Your Account
            </Button>
          </Link>
        </div>

        {/* Priority Tags Demo */}
        <div className="pt-8 flex flex-wrap justify-center items-center gap-2 text-xs font-semibold">
          <span className="text-muted-foreground">Priority Action Tracking:</span>
          <span className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">[Low] Profile Tweaks</span>
          <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">[Medium] Skill Gap Roadmaps</span>
          <span className="px-2.5 py-1 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">[High] Project Enhancements</span>
          <span className="px-2.5 py-1 rounded bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 font-bold">[Critical] ATS Keywords</span>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Built for Software Engineers & Tech Professionals</h2>
          <p className="text-muted-foreground">Everything you need to land your next high-paying engineering role.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border bg-card/60 backdrop-blur space-y-3 shadow-sm hover:border-primary/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">Resume Analysis & ATS Scoring</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Detect formatting issues, quantify impact bullet points, and maximize ATS compatibility against real job descriptions.
            </p>
          </div>

          <div className="p-6 rounded-2xl border bg-card/60 backdrop-blur space-y-3 shadow-sm hover:border-primary/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Code className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">Technical & HR Interview Prep</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Practice Node.js, React, and System Design interview questions with interactive markdown & syntax-highlighted code blocks.
            </p>
          </div>

          <div className="p-6 rounded-2xl border bg-card/60 backdrop-blur space-y-3 shadow-sm hover:border-primary/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">Skill Gap Roadmaps</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Receive step-by-step learning roadmaps, portfolio project recommendations, and cloud certification guidance.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="mt-auto border-t py-8 px-4 text-center text-xs text-muted-foreground">
        <p>© 2026 Ascend AI Career Assistant. Powered by Node.js, Express, Supabase & Google Gemini.</p>
      </footer>
    </div>
  );
}
