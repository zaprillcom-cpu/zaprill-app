import { Loader2 } from "lucide-react";
import { useState } from "react";
import type { AnalysisStep } from "@/types";

const JOB_MEMES = [
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKSjPQC1Id89MME/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/BmmfETghGOPrW/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/12vVAGu9q7Y9S/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l41lTfuxVpB3P0p3O/giphy.gif",
];

const JOB_MESSAGES = [
  "Calculating how many desk plants you'll need...",
  "Persuading the recruiter that 'Netflix' is a technical skill...",
  "Searching for your boss's replacement...",
  "Bribing the match engine with digital coffee...",
  "Applying to 100 jobs while you wait (just kidding)...",
  "Negotiating with the algorithms for a higher match score...",
];

export function MemeLoader({ step }: { step: AnalysisStep }) {
  const [memeIdx] = useState(() =>
    Math.floor(Math.random() * JOB_MEMES.length),
  );
  const [msgIdx] = useState(() =>
    Math.floor(Math.random() * JOB_MESSAGES.length),
  );

  return (
    <div className="max-w-2xl mx-auto py-20 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="relative w-full aspect-video rounded-3xl overflow-hidden border-4 border-foreground/10 shadow-2xl mb-12 group">
        <img
          src={JOB_MEMES[memeIdx]}
          alt="Job Meme"
          className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <Loader2 className="h-6 w-6 text-white animate-spin" />
          <span className="text-white font-black tracking-widest text-sm uppercase">
            {step === "searching"
              ? "Scanning Universe..."
              : "Analyzing Data..."}
          </span>
        </div>
      </div>

      <h3 className="text-3xl font-black text-foreground mb-4 tracking-tight">
        {JOB_MESSAGES[msgIdx]}
      </h3>
      <p className="text-lg text-muted-foreground font-semibold max-w-md mx-auto leading-relaxed">
        Our AI is working hard behind the scenes to find your perfect job match.
        Sit tight, this won't take long!
      </p>

      <div className="mt-12 flex gap-4">
        <div
          className={`h-1.5 w-16 rounded-full ${step === "searching" ? "bg-foreground animate-pulse" : "bg-muted"}`}
        />
        <div
          className={`h-1.5 w-16 rounded-full ${step === "analyzing" ? "bg-foreground animate-pulse" : "bg-muted"}`}
        />
      </div>
    </div>
  );
}
