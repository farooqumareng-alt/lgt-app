"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

/**
 * Wraps each agent panel. We've hit two separate real crashes from AI
 * output not matching its expected shape (an object where a string was
 * expected) despite defensive normalization in parseJson() — that
 * normalization covers every case found so far, not necessarily every case
 * that exists. If a future response shape slips through anyway, this stops
 * it from taking down the whole AI Assistant page (all five agents) for a
 * problem in one field of one tool.
 */
export class ResultErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("AI agent panel render error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-sm border border-saddle-300 bg-cream-50 p-6 text-sm text-ink/70">
          Something went wrong displaying this result. The other agents are unaffected — try switching tabs and
          back, or run this tool again.
        </div>
      );
    }
    return this.props.children;
  }
}
