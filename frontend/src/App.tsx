import { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { ExchangeApp } from "./components/ExchangeApp";
import { ThemeProvider } from "./components/ThemeProvider";

export default function App() {
  const [view, setView] = useState<"landing" | "app">("landing");

  return (
    <ThemeProvider>
      {view === "landing" ? (
        <LandingPage onEnterApp={() => setView("app")} />
      ) : (
        <ExchangeApp onBackToLanding={() => setView("landing")} />
      )}
    </ThemeProvider>
  );
}