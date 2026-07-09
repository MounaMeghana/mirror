import { ArrowRight, BrainCircuit, Mic, Video, BarChart3 } from 'lucide-react';

export default function WelcomeScreen({ onStart }) {
  const features = [
    { icon: <Video className="w-5 h-5" />, title: "Facial Analysis", desc: "Real-time emotion and micro-expression tracking." },
    { icon: <Mic className="w-5 h-5" />, title: "Voice Insights", desc: "Speech-to-text analysis for tone and confidence." },
    { icon: <BarChart3 className="w-5 h-5" />, title: "Session Reports", desc: "Detailed dashboard with AI-generated feedback." },
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center text-center py-12">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full mb-8">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
        </span>
        <span className="text-xs font-semibold text-purple-400 tracking-wider uppercase">AI Cognitive Mirror v1.0</span>
      </div>

      {/* Hero */}
      <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
        Master your social <br />
        <span className="text-purple-500">interactions</span>.
      </h1>
      <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mb-12 leading-relaxed">
        An intelligent mirror that helps you practice social scenarios with real-time AI feedback on your speech and non-verbal cues.
      </p>

      {/* Start Button */}
      <button
        onClick={onStart}
        className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all transform hover:scale-105 active:scale-95"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity" />
        <div className="relative flex items-center gap-3 bg-neutral-900 border border-white/10 px-8 py-4 rounded-2xl hover:bg-neutral-800 transition-colors">
          Start Practice Session
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </div>
      </button>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24">
        {features.map((f, i) => (
          <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-white/[0.07] transition-colors">
            <div className="p-2.5 bg-purple-500/10 rounded-xl w-fit mb-4 text-purple-400">
              {f.icon}
            </div>
            <h3 className="font-bold text-white mb-2">{f.title}</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
