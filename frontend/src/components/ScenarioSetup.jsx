import { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function ScenarioSetup({ onStartSession }) {
  const [scenario, setScenario] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (scenario.trim().length > 5) {
      onStartSession(scenario);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto w-full px-4">
      <div className="w-full bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6 relative">
          <div className="p-2 bg-purple-500/10 rounded-xl">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Set the Stage</h2>
        </div>
        
        <p className="text-neutral-400 mb-8 text-lg">
          Describe the social interaction you want to practice. The more specific you are, the better the AI can roleplay.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 flex flex-col items-center">
          <div className="w-full">
            <label htmlFor="scenario" className="sr-only">Your Scenario</label>
            <textarea
              id="scenario"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="e.g., I have a job interview tomorrow for a Junior Frontend Developer position. I'm worried they will ask me about my lack of experience with React."
              className="w-full h-40 bg-neutral-950 border border-neutral-800 rounded-2xl p-5 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all resize-none shadow-inner"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={scenario.trim().length <= 5}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md transition-all hover:bg-white/10 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center gap-2">
              Start Roleplay
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
