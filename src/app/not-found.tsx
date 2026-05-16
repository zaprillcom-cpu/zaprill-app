import { Ghost, Home, Search } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      <Navbar showBack backHref="/" backLabel="Home" />

      <div className="relative flex flex-1 flex-col items-center justify-center p-6">
        {/* Decorative background grid */}
        <div className="-z-10 pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[32px_32px]" />

        <div className="fade-in slide-in-from-bottom-10 relative z-10 w-full max-w-xl animate-in space-y-8 text-center duration-700">
          {/* Animated Ghost Icon */}
          <div className="group relative mx-auto mb-8 h-32 w-32">
            <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-3xl" />
            <div className="group-hover:-rotate-3 flex h-full w-full rotate-3 items-center justify-center rounded-3xl border border-border bg-card shadow-2xl transition-transform duration-500">
              <Ghost className="h-14 w-14 animate-bounce text-primary mix-blend-difference" />
            </div>
            {/* Floating badge */}
            <div className="-top-3 -right-3 absolute rotate-12 rounded-lg bg-destructive px-3 py-1.5 font-black text-[10px] text-destructive-foreground uppercase tracking-widest shadow-lg">
              404 Error
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="font-black text-5xl tracking-tighter md:text-6xl">
              Oops! Dead End.
            </h1>
            <p className="mx-auto max-w-md font-semibold text-muted-foreground text-xl leading-relaxed">
              Looks like this page doesn't exist. Just like an entry-level job
              requiring 10 years of experience.
            </p>
          </div>

          {/* Mock search bar for aesthetic */}
          <div className="relative mx-auto my-8 max-w-sm cursor-not-allowed opacity-60 grayscale">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              disabled
              type="text"
              className="w-full rounded-xl border border-border bg-muted/50 py-3 pr-4 pl-10 font-medium text-sm focus:outline-none"
              placeholder="Search for a Junior Dev role with 5 yrs React..."
              aria-label="Joke search input"
            />
          </div>

          <div className="flex justify-center pt-2">
            <Button
              render={<Link href="/" />}
              size="lg"
              className="h-14 px-8 font-black text-base shadow-xl transition-all hover:shadow-primary/25"
            >
              <Home className="mr-2 h-5 w-5" />
              Take Me Back Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
