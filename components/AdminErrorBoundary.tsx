"use client";

import React, { PropsWithChildren } from "react";

export class AdminErrorBoundary extends React.Component<PropsWithChildren, { hasError: boolean }> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Admin page error", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Something went wrong loading this admin view. Try refreshing or check logs.
        </div>
      );
    }
    return this.props.children as React.ReactNode;
  }
}
