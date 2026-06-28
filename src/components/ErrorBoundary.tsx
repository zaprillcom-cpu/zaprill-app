"use client";

import { AlertCircle, RefreshCcw } from "lucide-react";
import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  /** Allow parent components to clear the boundary after navigation changes. */
  public reset() {
    this.handleReset();
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="fade-in flex min-h-[200px] w-full flex-1 animate-in flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-6 duration-300">
          <AlertCircle className="mb-4 h-10 w-10 text-destructive opacity-80" />
          <h3 className="mb-2 font-bold text-foreground text-lg">
            Component Crashed
          </h3>
          <p className="mb-6 max-w-sm text-center text-muted-foreground text-sm">
            A section of this page failed to load due to an unexpected error.
            {this.state.error && (
              <span className="mt-2 block truncate font-mono text-xs opacity-60">
                {this.state.error.message}
              </span>
            )}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleReset}
            className="border-border font-bold"
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Try section again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
