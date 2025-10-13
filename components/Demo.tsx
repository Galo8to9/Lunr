"use client";

import React from "react";
import { motion, useAnimation } from "framer-motion";
import {
  Shuffle,
  ReceiptText,
  Activity,
  ShieldCheck,
  ArrowLeftRight,
  Bot,
  Wallet,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import Container from "./Container";

// ---------------------------------------------
// Types
// ---------------------------------------------

type NodeId =
  | "detect"
  | "assess"
  | "plan"
  | "bridge"
  | "swap"
  | "settle"
  | "reconcile";

type GraphNode = {
  id: NodeId;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  x: number; // percentage of width
  y: number; // percentage of height
};

type GraphEdge = {
  id: string;
  from: NodeId;
  to: NodeId;
};

// ---------------------------------------------
// Graph Data (n8n-like linear with a branch-ready layout)
// ---------------------------------------------

const NODES: GraphNode[] = [
  {
    id: "detect",
    title: "Detect Payment",
    desc: "Watch inbound on many chains.",
    icon: Activity,
    x: 6,
    y: 50,
  },
  {
    id: "assess",
    title: "Risk & Compliance",
    desc: "Screen address and amount.",
    icon: ShieldCheck,
    x: 22,
    y: 50,
  },
  {
    id: "plan",
    title: "Route Plan",
    desc: "Choose bridge/swap with best cost & ETA.",
    icon: Shuffle,
    x: 38,
    y: 50,
  },
  {
    id: "bridge",
    title: "Bridge",
    desc: "Move funds to target chain.",
    icon: ArrowLeftRight,
    x: 54,
    y: 35,
  },
  {
    id: "swap",
    title: "Swap",
    desc: "Convert to target asset.",
    icon: Bot,
    x: 54,
    y: 65,
  },
  {
    id: "settle",
    title: "Settle & Notify",
    desc: "Send to merchant treasury & webhook.",
    icon: Wallet,
    x: 74,
    y: 50,
  },
  {
    id: "reconcile",
    title: "Reconcile",
    desc: "Post receipt & ledger entry.",
    icon: ReceiptText,
    x: 92,
    y: 50,
  },
];

const EDGES: GraphEdge[] = [
  { id: "e1", from: "detect", to: "assess" },
  { id: "e2", from: "assess", to: "plan" },
  // little split look: plan -> bridge and plan -> swap (we'll traverse bridge first then swap)
  { id: "e3", from: "plan", to: "bridge" },
  { id: "e4", from: "plan", to: "swap" },
  // both converge to settle (visual; traversal goes bridge -> settle -> swap -> settle)
  { id: "e5", from: "bridge", to: "settle" },
  { id: "e6", from: "swap", to: "settle" },
  { id: "e7", from: "settle", to: "reconcile" },
];

// ordered path for the agent run (so we animate in a deterministic way)
const TRAVERSAL: NodeId[] = [
  "detect",
  "assess",
  "plan",
  "bridge",
  "settle",
  "swap",
  "settle",
  "reconcile",
];

// ---------------------------------------------
// Helpers
// ---------------------------------------------

const byId = Object.fromEntries(NODES.map((n) => [n.id, n])) as Record<
  NodeId,
  GraphNode
>;

function edgeFor(a: NodeId, b: NodeId) {
  return EDGES.find((e) => e.from === a && e.to === b);
}

function curvePath(from: GraphNode, to: GraphNode) {
  const x1 = from.x;
  const y1 = from.y;
  const x2 = to.x;
  const y2 = to.y;
  // soft quadratic bend depending on vertical offset
  const dx = Math.abs(x2 - x1);
  const dy = y2 - y1;
  const cx = x1 + dx * 0.5;
  const cy = y1 + dy * 0.35; // gentle curve
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

function statusForNode(idx: number, i: number) {
  if (i < idx) return "done" as const;
  if (i === idx) return "active" as const;
  return "pending" as const;
}

// ---------------------------------------------
// Node Card
// ---------------------------------------------

function NodeCard({
  node,
  status,
  onClick,
}: {
  node: GraphNode;
  status: "done" | "active" | "pending";
  onClick?: () => void;
}) {
  const Icon = node.icon;
  return (
    <button
      onClick={onClick}
      className={
        "group absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl border shadow-sm p-3 sm:p-4 w-[180px] sm:w-[220px] text-left transition " +
        (status === "done"
          ? "border-emerald-300/60 ring-1 ring-emerald-400/50 bg-white dark:bg-neutral-900"
          : status === "active"
          ? "border-amber-300/50 ring-1 ring-amber-300/40 bg-white dark:bg-neutral-900"
          : "border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur")
      }
      style={{ left: `${node.x}%`, top: `${node.y}%` }}
      aria-current={status === "active" ? "step" : undefined}
    >
      <div className="flex items-center gap-3">
        <div
          className={
            "flex h-9 w-9 items-center justify-center rounded-lg border shadow-sm transition " +
            (status === "done"
              ? "border-emerald-300/60"
              : status === "active"
              ? "border-amber-300/50"
              : "border-neutral-200 dark:border-neutral-800")
          }
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
            {node.id}
          </p>
          <h3 className="truncate text-sm font-medium">{node.title}</h3>
        </div>
        <span
          className={
            "ml-auto inline-flex items-center rounded-full px-2.5 py-1 text-[11px] " +
            (status === "done"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
              : status === "active"
              ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
              : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400")
          }
        >
          {status === "done"
            ? "Done"
            : status === "active"
            ? "Running"
            : "Pending"}
        </span>
      </div>
      <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
        {node.desc}
      </p>
    </button>
  );
}

// ---------------------------------------------
// Edge component with animated token traveling along the path
// ---------------------------------------------

function Edge({
  from,
  to,
  active,
  done,
}: {
  from: GraphNode;
  to: GraphNode;
  active: boolean;
  done: boolean;
}) {
  const pathD = curvePath(from, to);
  const base = "stroke-[1.5]";
  const strokeClass = done
    ? "stroke-emerald-400/80"
    : active
    ? "stroke-amber-400/80"
    : "stroke-neutral-300 dark:stroke-neutral-700";

  return (
    <g>
      <path
        d={pathD}
        className={`${base} ${strokeClass} fill-none`}
        vectorEffect="non-scaling-stroke"
      />
      {/* Arrowhead */}
      <defs>
        <marker
          id={`arrow-${from.id}-${to.id}`}
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="3"
          orient="auto"
        >
          <path
            d="M0,0 L6,3 L0,6 Z"
            className={`${strokeClass} fill-current`}
          />
        </marker>
      </defs>
      <path
        d={pathD}
        markerEnd={`url(#arrow-${from.id}-${to.id})`}
        className={`${base} ${strokeClass} opacity-60 fill-none`}
        vectorEffect="non-scaling-stroke"
      />

      {/* Animated token when active */}
      {active && (
        <motion.circle
          r={3.5}
          className="fill-amber-500"
          initial={{ pathLength: 0, offsetDistance: "0%" }}
          animate={{ offsetDistance: ["0%", "100%"] }}
          transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity }}
          style={{ offsetPath: `path('${pathD}')` }}
        />
      )}
    </g>
  );
}

// ---------------------------------------------
// Main Component
// ---------------------------------------------

export default function AgentGraphDemo() {
  const [stepIdx, setStepIdx] = React.useState(0); // index in TRAVERSAL
  const [running, setRunning] = React.useState(true);
  const [speed, setSpeed] = React.useState<"slow" | "normal" | "fast">(
    "normal"
  );
  const [log, setLog] = React.useState<string[]>(["▶ Starting agentic run…"]);

  const speeds: Record<typeof speed, number> = {
    slow: 1800,
    normal: 1200,
    fast: 700,
  };

  // auto-advance
  React.useEffect(() => {
    if (!running) return;
    if (stepIdx >= TRAVERSAL.length - 1) return; // last node reached

    const t = setTimeout(() => {
      const from = TRAVERSAL[stepIdx];
      const to = TRAVERSAL[stepIdx + 1];
      setLog((l) => [
        `${new Date().toLocaleTimeString()} – ${byId[from].title} → ${
          byId[to].title
        } complete`,
        ...l,
      ]);
      setStepIdx((n) => n + 1);
    }, speeds[speed]);

    return () => clearTimeout(t);
  }, [stepIdx, running, speed]);

  const statusFor = (nodeId: NodeId) => {
    const i = TRAVERSAL.indexOf(nodeId);
    return statusForNode(stepIdx, i);
  };

  const reset = () => {
    setStepIdx(0);
    setLog(["▶ Starting agentic run…"]);
    setRunning(true);
  };

  // build edge statuses based on current step
  const activeEdge = edgeFor(TRAVERSAL[stepIdx], TRAVERSAL[stepIdx + 1]);

  return (
    <div className="mt-14 sm:mt-20">
      <Container>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
            >
              <RotateCcw className="h-4 w-4" /> Run demo
            </button>
            <button
              onClick={() => setRunning((r) => !r)}
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
            >
              {running ? (
                <>
                  <Pause className="h-4 w-4" /> Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" /> Resume
                </>
              )}
            </button>
            <div className="inline-flex items-center gap-2 rounded-xl border px-2 py-1.5 text-xs border-neutral-200 dark:border-neutral-800">
              <span className="pl-1">Speed</span>
              <div className="flex overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800">
                {["slow", "normal", "fast"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s as any)}
                    className={
                      "px-2 py-1 capitalize " +
                      (speed === s
                        ? "bg-neutral-100 dark:bg-neutral-800"
                        : "hover:bg-neutral-50 dark:hover:bg-neutral-900")
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Progress indicator */}
          <div className="text-xs text-neutral-500">
            Status: {TRAVERSAL[stepIdx]} →{" "}
            {TRAVERSAL[Math.min(stepIdx + 1, TRAVERSAL.length - 1)]}
          </div>
        </div>

        {/* Graph Stage */}
        <div className="mt-5 relative h-[420px] sm:h-[520px] rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-950">
          {/* subtle grid background */}
          <svg
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern
                id="grid"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  className="stroke-neutral-200 dark:stroke-neutral-800"
                  fill="none"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Edges */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {EDGES.map((e) => {
              const from = byId[e.from];
              const to = byId[e.to];
              const idxFrom = TRAVERSAL.findIndex((n) => n === e.from);
              const idxTo = TRAVERSAL.findIndex((n) => n === e.to);
              const done = stepIdx > idxTo; // already traversed past 'to'
              const active = activeEdge?.id === e.id;
              return (
                <Edge
                  key={e.id}
                  from={from}
                  to={to}
                  active={!!active}
                  done={done}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          <div className="absolute inset-0">
            {NODES.map((n) => (
              <NodeCard
                key={n.id}
                node={n}
                status={statusFor(n.id)}
                onClick={() => setStepIdx(TRAVERSAL.indexOf(n.id))}
              />
            ))}
          </div>
        </div>

        {/* Log */}
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Live trace</h3>
            <span className="text-xs text-neutral-500">graph-demo</span>
          </div>
          <div className="mt-3 h-48 overflow-auto rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs leading-5 dark:border-neutral-800 dark:bg-neutral-950">
            <ul className="space-y-2">
              {log.map((line, i) => (
                <li key={i} className="whitespace-pre-wrap">
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-3 text-xs text-neutral-500">
            Status:{" "}
            {stepIdx < TRAVERSAL.length - 1
              ? `${byId[TRAVERSAL[stepIdx]].title}`
              : "Complete"}
          </div>
        </div>
      </Container>
    </div>
  );
}
