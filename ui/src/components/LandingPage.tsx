import { useMemo } from "react";
import { motion } from "motion/react";
import { ArrowRight, Zap, Shield, Network, Activity, Database, Lock } from "lucide-react";
import { Button } from "./Button";
import { DataCard } from "./DataCard";
import { CircuitPattern } from "./CircuitPattern";
import { LineChart, Line, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useChain } from "../hooks";
import { generateLatencyData, generateThroughputData } from "../utils/mockData";

export function LandingPage({ onEnterApp }: { onEnterApp: () => void }) {
  const { chain } = useChain();

  // Generated once on mount — stable across renders
  const latencyData  = useMemo(() => generateLatencyData(50),  []);
  const throughputData = useMemo(() => generateThroughputData(50), []);

  return (
    <div className="min-h-screen bg-background">

      {/* Nav */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-ultramarine-500 to-ultramarine-700">
              <Network className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold tracking-tight" style={{ fontSize: "1.125rem" }}>Perpilize</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#architecture" className="text-sm text-foreground/80 hover:text-foreground">Architecture</a>
            <a href="#features"     className="text-sm text-foreground/80 hover:text-foreground">Features</a>
            <a href="#access"       className="text-sm text-foreground/80 hover:text-foreground">Access</a>
            <Button onClick={onEnterApp}>Enter Platform</Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative min-h-screen overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-ultramarine-50 via-background to-metallic-50 dark:from-ultramarine-950/20 dark:via-background dark:to-metallic-950/20" />
        <CircuitPattern className="absolute inset-0 text-ultramarine-500" />

        <div className="relative mx-auto max-w-7xl px-6 py-32">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl">

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-ultramarine-300 bg-ultramarine-50 px-4 py-1.5 dark:border-ultramarine-700 dark:bg-ultramarine-900/30"
            >
              <Zap className="h-3.5 w-3.5 text-ultramarine-600 dark:text-ultramarine-400" />
              <span className="text-sm text-ultramarine-900 dark:text-ultramarine-200">Custom Minitia Rollup on Initia Network</span>
            </motion.div>

            <h1 className="mb-6 font-semibold tracking-tight text-foreground" style={{ fontSize: "3.5rem", lineHeight: "1.1" }}>
              Institutional Perpetual Trading
              <br />
              <span className="bg-gradient-to-r from-ultramarine-600 to-ultramarine-400 bg-clip-text text-transparent">
                Built for Precision
              </span>
            </h1>

            <p className="mb-8 max-w-2xl text-muted-foreground" style={{ fontSize: "1.125rem", lineHeight: "1.7" }}>
              Custom rollup execution environment for institutional-grade perpetual contracts. Portfolio margin,
              sub-millisecond latency, and native cross-rollup liquidity through Interwoven architecture.
            </p>

            <div className="flex items-center gap-4">
              <Button size="lg" onClick={onEnterApp}>
                Access Platform <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">Documentation</Button>
            </div>
          </motion.div>

          {/* Live Data Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-16 grid grid-cols-3 gap-6"
          >
            <DataCard label="Median Latency" value="<1ms"    change="-12% from target"   changeType="positive" icon={<Activity className="h-5 w-5" />} />
            <DataCard label="Throughput"     value="48K TPS" change="Peak capacity"       changeType="neutral"  icon={<Zap className="h-5 w-5" />} />
            <DataCard label="Block Height"   value={chain.blockHeight.toLocaleString()} change={chain.connected ? "Live" : "Offline"} changeType={chain.connected ? "positive" : "negative"} icon={<Shield className="h-5 w-5" />} />
          </motion.div>

          {/* Charts */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="mt-8 grid grid-cols-2 gap-6"
          >
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="mb-4 text-sm text-muted-foreground">Latency Distribution (ms)</p>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={latencyData}>
                  <defs>
                    <linearGradient id="latGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="var(--ultramarine-500)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--ultramarine-500)" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="var(--ultramarine-500)" fill="url(#latGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <p className="mb-4 text-sm text-muted-foreground">Throughput (TPS)</p>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={throughputData}>
                  <Line type="monotone" dataKey="value" stroke="var(--ultramarine-500)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative border-t border-border bg-card py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-16 text-center">
            <h2 className="mb-4 font-semibold tracking-tight" style={{ fontSize: "2.5rem" }}>Built for Institutional Scale</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground" style={{ fontSize: "1.125rem" }}>
              Three core pillars enable institutional-grade perpetual trading on custom Minitia infrastructure.
            </p>
          </motion.div>

          <div className="grid grid-cols-3 gap-8">
            {[
              { icon: <Database className="h-6 w-6 text-ultramarine-600 dark:text-ultramarine-400" />, title: "Custom Rollup Execution", body: "Dedicated Minitia rollup optimized for perpetual contract execution. Isolated state, custom gas economics, and deterministic settlement on Initia L1." },
              { icon: <Activity className="h-6 w-6 text-ultramarine-600 dark:text-ultramarine-400" />, title: "Portfolio Margin",         body: "Multi-asset cross-margin with real-time risk calculation. Asset-specific haircuts, delta hedging support, and capital-efficient position management." },
              { icon: <Lock     className="h-6 w-6 text-ultramarine-600 dark:text-ultramarine-400" />, title: "Institutional Access Controls", body: "Role-based permissions, subaccount delegation, and audit-ready transaction logs. Compliance-ready architecture with configurable risk parameters." },
            ].map(({ icon, title, body }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-lg border border-border bg-background p-8 transition-all hover:border-ultramarine-300 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-ultramarine-100 dark:bg-ultramarine-900/30">
                  {icon}
                </div>
                <h3 className="mb-3 font-semibold tracking-tight" style={{ fontSize: "1.25rem" }}>{title}</h3>
                <p className="text-muted-foreground">{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="relative border-t border-border py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-16">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="mb-6 font-semibold tracking-tight" style={{ fontSize: "2.5rem" }}>Interwoven Stack Integration</h2>
              <p className="mb-6 text-muted-foreground" style={{ fontSize: "1.125rem" }}>
                Native liquidity access through Initia's Interwoven architecture. Cross-rollup messaging, unified liquidity pools, and atomic cross-chain settlement.
              </p>
              <div className="space-y-4">
                {[
                  { title: "Cross-Rollup Liquidity",   body: "Access liquidity from connected Minitias through IBC-based messaging and unified liquidity pools." },
                  { title: "Initia L1 Settlement",     body: "Final settlement and oracle data anchored to Initia L1 for maximum security and data integrity." },
                  { title: "Custom Rollup Identity",   body: "Sovereign execution environment with custom gas token, governance, and risk parameters." },
                ].map(({ title, body }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-ultramarine-100 dark:bg-ultramarine-900/30">
                      <div className="h-2 w-2 rounded-full bg-ultramarine-600 dark:bg-ultramarine-400" />
                    </div>
                    <div>
                      <h4 className="mb-1 font-medium">{title}</h4>
                      <p className="text-sm text-muted-foreground">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-lg border border-border bg-card p-8">
              <div className="space-y-6">
                <div className="rounded-lg border border-ultramarine-300 bg-ultramarine-50 p-4 dark:border-ultramarine-700 dark:bg-ultramarine-900/30">
                  <p className="mb-2 text-sm text-muted-foreground">This Rollup</p>
                  <p className="font-semibold">Perpilize Minitia</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${chain.connected ? "bg-success" : "bg-destructive"}`} />
                    <span className="text-sm text-muted-foreground">
                      {chain.connected ? `Active • Block ${chain.blockHeight.toLocaleString()}` : "Offline"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-12 w-0.5 bg-gradient-to-b from-ultramarine-400 to-transparent" />
                    <Network className="h-5 w-5 text-ultramarine-500" />
                    <div className="h-12 w-0.5 bg-gradient-to-b from-ultramarine-400 to-transparent" />
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="mb-2 text-sm text-muted-foreground">Initia L1</p>
                  <p className="font-semibold">Settlement Layer</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-success" />
                    <span className="text-sm text-muted-foreground">Finality: {chain.finality}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs text-muted-foreground">Connected Rollup</p>
                    <p className="mt-1 text-sm font-medium">Minitia A</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs text-muted-foreground">Connected Rollup</p>
                    <p className="mt-1 text-sm font-medium">Minitia B</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="access" className="relative border-t border-border bg-gradient-to-br from-ultramarine-50 to-metallic-50 py-32 dark:from-ultramarine-950/20 dark:to-metallic-950/20">
        <CircuitPattern className="absolute inset-0 text-ultramarine-500 opacity-30" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="mb-6 font-semibold tracking-tight" style={{ fontSize: "2.5rem" }}>Ready for Institutional Trading</h2>
            <p className="mb-8 text-muted-foreground" style={{ fontSize: "1.125rem" }}>
              Access institutional-grade perpetual trading on custom Minitia infrastructure.<br />
              Portfolio margin, sub-millisecond execution, and compliance-ready controls.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" onClick={onEnterApp}>Access Platform <ArrowRight className="ml-2 h-4 w-4" /></Button>
              <Button size="lg" variant="outline">Request Access</Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-ultramarine-500 to-ultramarine-700">
                  <Network className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold">Perpilize</span>
              </div>
              <p className="text-sm text-muted-foreground">Institutional perpetual trading on Initia Network.</p>
            </div>
            {[
              { title: "Product",   links: ["Features","Architecture","Security"] },
              { title: "Resources", links: ["Documentation","API Reference","Support"] },
              { title: "Legal",     links: ["Terms of Service","Privacy Policy","Risk Disclosure"] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="mb-3 font-medium">{title}</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {links.map((l) => <li key={l}><a href="#" className="hover:text-foreground">{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            © 2026 Perpilize. Built on Initia Network.
          </div>
        </div>
      </footer>
    </div>
  );
}