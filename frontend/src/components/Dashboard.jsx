import { CheckCircle, AlertTriangle, ArrowLeft, Activity } from 'lucide-react';

export default function Dashboard({ summaryData, onRestart }) {
  if (!summaryData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-neutral-400">Analyzing your session...</p>
      </div>
    );
  }

  const { data, raw_expressions } = summaryData;

  // Simple mock timeline visualization based on the expressions
  const timelineBlocks = raw_expressions?.slice(-20) || []; // Show last few for MVP

  return (
    <div className="max-w-4xl mx-auto w-full px-4 pb-12">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onRestart}
          className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-bold tracking-tight">Your Session Dashboard</h2>
      </div>

      <div className="space-y-6">
        {/* Overall Feedback */}
        <div className="bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-3xl p-8">
          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            Overall Performance
          </h3>
          <p className="text-neutral-300 text-lg leading-relaxed">
            {data?.overallFeedback || "Great job taking the time to practice! Practicing regularly is the key to building confidence."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-3xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-emerald-400 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              What Went Well
            </h3>
            <ul className="space-y-3">
              {(data?.strengths || ["You spoke clearly", "You maintained a positive attitude"]).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-neutral-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div className="bg-amber-950/20 border border-amber-900/50 rounded-3xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Areas for Improvement
            </h3>
            <ul className="space-y-3">
              {(data?.areasForImprovement || ["Try to minimize filler words", "Remember to pause and breathe"]).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-neutral-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Expression Analysis */}
        <div className="bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-3xl p-8">
          <h3 className="text-xl font-semibold mb-3">Cognitive Mirror Analysis</h3>
          <p className="text-neutral-300 mb-6">
            {data?.expressionAnalysis || "Your facial expressions mostly aligned with your tone, though you appeared slightly nervous during certain questions."}
          </p>
          
          {timelineBlocks.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-neutral-500 mb-2 uppercase tracking-wider">Expression Timeline</h4>
              <div className="flex items-center gap-1 h-12 bg-neutral-950 rounded-xl p-1 overflow-hidden">
                {timelineBlocks.map((exp, i) => {
                  let color = 'bg-neutral-700';
                  if (exp.expression === 'happy') color = 'bg-emerald-500';
                  if (exp.expression === 'neutral') color = 'bg-blue-500';
                  if (exp.expression === 'sad' || exp.expression === 'angry') color = 'bg-red-500';
                  if (exp.expression === 'fearful' || exp.expression === 'surprised') color = 'bg-amber-500';
                  if (exp.expression === 'disgusted') color = 'bg-purple-500';

                  return (
                    <div 
                      key={i} 
                      title={exp.expression}
                      className={`flex-1 h-full rounded-md ${color} opacity-80 hover:opacity-100 transition-opacity`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-neutral-500 mt-1 px-1">
                <span>Start</span>
                <span>End</span>
              </div>
            </div>
          )}
        </div>

        {/* Cognitive Distortions Section */}
        {data?.cognitiveDistortions && data.cognitiveDistortions.length > 0 && (
          <div className="bg-red-950/20 border border-red-900/50 rounded-3xl p-8 mt-6">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              Identified Cognitive Distortions
            </h3>
            <div className="space-y-6">
              {data.cognitiveDistortions.map((distortion, idx) => (
                <div key={idx} className="bg-neutral-900/50 rounded-2xl p-6 border border-neutral-800">
                  <h4 className="text-lg font-medium text-red-300 mb-2">{distortion.distortionType}</h4>
                  <div className="mb-4">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">What You Said:</span>
                    <p className="text-neutral-300 italic border-l-2 border-red-500/50 pl-3">"{distortion.example}"</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">Correction / Reframing:</span>
                    <p className="text-emerald-400/90">{distortion.correction}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
