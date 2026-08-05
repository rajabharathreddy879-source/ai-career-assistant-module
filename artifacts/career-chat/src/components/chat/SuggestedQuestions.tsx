import { Sparkles, FileSearch, Code, BrainCircuit, Rocket, Award, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

const SUGGESTIONS = [
  {
    icon: ShieldAlert,
    label: 'ATS Optimization',
    prompt: 'Why is my ATS score low and how can I optimize my resume for technical roles?',
  },
  {
    icon: Rocket,
    label: 'Project Recommendations',
    prompt: 'Suggest 3 impressive full-stack Node.js + React projects to boost my portfolio.',
  },
  {
    icon: Code,
    label: 'Node.js Interview Prep',
    prompt: 'Explain top Node.js interview questions covering Event Loop, Streams, and Middleware.',
  },
  {
    icon: BrainCircuit,
    label: 'Rewrite Bullet Point',
    prompt: 'Rewrite my backend project description using quantifiable metrics and STAR method.',
  },
  {
    icon: FileSearch,
    label: 'Skill Gap Assessment',
    prompt: 'Create a 4-week learning roadmap to transition from Frontend React to Senior Full-Stack.',
  },
  {
    icon: Award,
    label: 'Certification Guidance',
    prompt: 'Which cloud certifications (AWS vs GCP) should I get as a Full-Stack Engineer in 2026?',
  },
];

export function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="py-6 px-4 max-w-3xl mx-auto space-y-4">
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Career Copilot Ready</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">How can I accelerate your career today?</h2>
        <p className="text-sm text-muted-foreground">Select a prompt below or paste your resume / job description to begin.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {SUGGESTIONS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(item.prompt)}
            className="flex items-start gap-3 p-3.5 rounded-xl border border-border/60 bg-card hover:bg-accent/60 hover:border-primary/40 text-left transition-all group shadow-sm"
          >
            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
              <item.icon className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                {item.label}
              </div>
              <div className="text-xs text-muted-foreground line-clamp-2">
                "{item.prompt}"
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
