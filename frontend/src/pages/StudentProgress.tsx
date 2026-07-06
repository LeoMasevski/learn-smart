import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  ClipboardList,
  FileText,
  Star,
  Target,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { fetchQuizResults, fetchSubjectProgress, fetchStudentStats } from "../api/progressApi";
import type { QuizResultEntry, SubjectProgress, StudentStats } from "../types/progress";

type TabType = "pregled" | "kvizi" | "predmeti";

function ScoreBadge({ pct }: { pct: number }) {
  const color =
    pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";
  const label = pct >= 80 ? "Odlično" : pct >= 50 ? "Dobro" : "Slabo";
  return (
    <span
      style={{
        background: color + "18",
        color,
        border: `1px solid ${color}40`,
        borderRadius: 8,
        padding: "3px 10px",
        fontWeight: 700,
        fontSize: 13,
      }}
    >
      {label}
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            height: 72,
            background: "#f3f4f6",
            borderRadius: 14,
          }}
        />
      ))}
    </div>
  );
}

function EmptyState({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "48px 24px",
        color: "#6b7280",
      }}
    >
      <div
        style={{
          width: 58,
          height: 58,
          margin: "0 auto 14px",
          borderRadius: 16,
          background: "#f3f0ff",
          color: "#6c63ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={26} strokeWidth={2.25} />
      </div>
      <h3 style={{ margin: "0 0 8px", color: "#374151", fontSize: 20 }}>{title}</h3>
      <p style={{ margin: 0, fontSize: 15 }}>{text}</p>
    </div>
  );
}

function ErrorState({ msg, onRetry }: { msg: string; onRetry: () => void }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "40px 24px",
        background: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: 16,
        color: "#dc2626",
      }}
    >
      <AlertTriangle size={34} strokeWidth={2.25} style={{ marginBottom: 12 }} />
      <p style={{ fontWeight: 700, marginBottom: 8 }}>{msg}</p>
      <button
        onClick={onRetry}
        style={{
          background: "#dc2626",
          color: "white",
          border: "none",
          padding: "9px 20px",
          borderRadius: 10,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Poskusi znova
      </button>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 18,
        padding: "20px 22px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        boxShadow: "0 4px 14px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          width: 50,
          height: 50,
          borderRadius: "50%",
          background: color + "18",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          flexShrink: 0,
          color,
        }}
      >
        <Icon size={23} strokeWidth={2.25} />
      </div>
      <div>
        <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: color }}>{value}</div>
      </div>
    </div>
  );
}

export default function StudentProgress() {
  const [tab, setTab] = useState<TabType>("pregled");
  const [results, setResults] = useState<QuizResultEntry[]>([]);
  const [progress, setProgress] = useState<SubjectProgress[]>([]);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      setLoading(true);
      setError("");
      const [r, p, s] = await Promise.all([
        fetchQuizResults(),
        fetchSubjectProgress(),
        fetchStudentStats(),
      ]);
      setResults(r);
      setProgress(p);
      setStats(s);
    } catch {
      setError("Napaka pri nalaganju podatkov. Preveri povezavo.");
    } finally {
      setLoading(false);
    }
  }

  const barData = progress.map((p) => ({
    name: p.subject_name.length > 14 ? p.subject_name.slice(0, 12) + "…" : p.subject_name,
    povprečje: p.average_score,
    full: p.subject_name,
  }));

  const barColors = ["#6c63ff", "#60a5fa", "#10b981", "#f59e0b", "#f472b6"];

  const tabs: { key: TabType; label: string; icon: LucideIcon }[] = [
    { key: "pregled", label: "Pregled", icon: BarChart3 },
    { key: "kvizi", label: "Kvizi", icon: ClipboardList },
    { key: "predmeti", label: "Predmeti", icon: BookOpen },
  ];

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto" }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .progress-tab { cursor: pointer; padding: 10px 20px; border-radius: 10px; font-weight: 700; font-size: 15px; border: none; transition: 0.2s; display: inline-flex; align-items: center; gap: 8px; }
        .progress-tab.active { background: #6c63ff; color: white; box-shadow: 0 4px 12px rgba(108,99,255,0.18); }
        .progress-tab:not(.active) { background: white; color: #374151; border: 1px solid #e5e7eb; }
        .progress-tab:not(.active):hover { background: #f3f0ff; color: #6c63ff; border-color: #ddd6fe; }
        .result-row { display: grid; grid-template-columns: 1fr 120px 80px 90px; align-items: center; gap: 16px; background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 16px 20px; transition: 0.2s; animation: fadeUp 0.3s ease; }
        .result-row:hover { box-shadow: 0 6px 20px rgba(108,99,255,0.12); transform: translateY(-2px); }
        .subject-progress-row { background: white; border: 1px solid #e5e7eb; border-radius: 18px; padding: 20px 24px; animation: fadeUp 0.3s ease; }
        @media (max-width: 700px) {
          .result-row { grid-template-columns: 1fr 80px; }
          .result-row .hide-mobile { display: none; }
        }
      `}</style>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 34, fontWeight: 800, margin: "0 0 6px" }}>
          Moj napredek
        </h1>
        <p style={{ color: "#6b7280", fontSize: 16, margin: 0 }}>
          Pregled uspešnosti kvizov in napredka po predmetih.
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 10,
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          padding: 10,
          marginBottom: 24,
          flexWrap: "wrap",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        {tabs.map((t) => {
          const TabIcon = t.icon;
          return (
            <button
              key={t.key}
              className={`progress-tab ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              <TabIcon size={16} strokeWidth={2.25} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && <ErrorState msg={error} onRetry={loadAll} />}

      {/* Loading */}
      {loading && !error && (
        <div
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: 28,
          }}
        >
          <LoadingSkeleton />
        </div>
      )}

      {/* ── TAB: PREGLED ── */}
      {!loading && !error && tab === "pregled" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Stats row */}
          {stats && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                gap: 16,
              }}
            >
              <StatCard icon={FileText} label="Opravljeni kvizi" value={stats.total_quizzes} color="#6c63ff" />
              <StatCard icon={Star} label="Povprečna ocena" value={`${stats.average_score}%`} color="#f59e0b" />
              <StatCard icon={Trophy} label="Najboljši rezultat" value={`${stats.best_score}%`} color="#10b981" />
              <StatCard icon={BookOpen} label="Vpisani predmeti" value={stats.subjects_enrolled} color="#60a5fa" />
            </div>
          )}

          {/* Bar chart */}
          {progress.length > 0 && (
            <div
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: 18,
                padding: "24px 28px",
                boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
              }}
            >
              <h2 style={{ fontSize: 19, fontWeight: 800, margin: "0 0 4px" }}>
                Uspešnost po predmetih
              </h2>
              <p style={{ color: "#6b7280", fontSize: 14, margin: "0 0 20px" }}>
                Povprečna ocena kvizov po predmetu (%)
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 13, fontWeight: 600 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(val) => [`${val}%`, "Povprečje"]}
                    labelFormatter={(label) => {
                      const found = barData.find((d) => d.name === label);
                      return found?.full ?? label;
                    }}
                    contentStyle={{ borderRadius: 10, fontSize: 13 }}
                  />
                  <Bar dataKey="povprečje" radius={[8, 8, 0, 0]}>
                    {barData.map((_, i) => (
                      <Cell key={i} fill={barColors[i % barColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Recent results */}
          <div
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 18,
              padding: "24px 28px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
            }}
          >
            <h2 style={{ fontSize: 19, fontWeight: 800, margin: "0 0 18px" }}>
              Zadnji rezultati
            </h2>
            {results.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="Ni rezultatov"
                text="Reši kviz po lekciji in rezultat se bo prikazal tukaj."
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {results.slice(0, 4).map((r) => (
                  <div className="result-row" key={r.id}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{r.lesson_title}</div>
                      <div style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>
                        {r.subject_name} · {new Date(r.completed_at).toLocaleDateString("sl-SI")}
                      </div>
                    </div>
                    <div className="hide-mobile" style={{ color: "#6b7280", fontSize: 14, fontWeight: 600 }}>
                      {r.score}/{r.total}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: r.percentage >= 80 ? "#10b981" : r.percentage >= 50 ? "#f59e0b" : "#ef4444" }}>
                      {r.percentage}%
                    </div>
                    <ScoreBadge pct={r.percentage} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: KVIZI ── */}
      {!loading && !error && tab === "kvizi" && (
        <div
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: "24px 28px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
          }}
        >
          <h2 style={{ fontSize: 19, fontWeight: 800, margin: "0 0 6px" }}>
            Zgodovina kvizov
          </h2>
          <p style={{ color: "#6b7280", fontSize: 14, margin: "0 0 20px" }}>
            Vsi opravljeni kvizi, urejeni po datumu.
          </p>

          {results.length === 0 ? (
            <EmptyState
              icon={Target}
              title="Še ni opravljenih kvizov"
              text="Odpri lekcijo, reši kviz na koncu in rezultat bo prikazan tukaj."
            />
          ) : (
            <>
              {/* Header row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 120px 80px 90px",
                  gap: 16,
                  padding: "0 20px 12px",
                  borderBottom: "1px solid #f3f4f6",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                <span>Lekcija</span>
                <span className="hide-mobile">Točke</span>
                <span>%</span>
                <span>Ocena</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                {results
                  .sort(
                    (a, b) =>
                      new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
                  )
                  .map((r) => (
                    <div className="result-row" key={r.id}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{r.lesson_title}</div>
                        <div style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>
                          {r.subject_name} · {new Date(r.completed_at).toLocaleDateString("sl-SI", { day: "2-digit", month: "long", year: "numeric" })}
                        </div>
                      </div>
                      <div className="hide-mobile" style={{ color: "#374151", fontSize: 15, fontWeight: 700 }}>
                        {r.score} / {r.total}
                      </div>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 18,
                          color:
                            r.percentage >= 80
                              ? "#10b981"
                              : r.percentage >= 50
                              ? "#f59e0b"
                              : "#ef4444",
                        }}
                      >
                        {r.percentage}%
                      </div>
                      <ScoreBadge pct={r.percentage} />
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB: PREDMETI ── */}
      {!loading && !error && tab === "predmeti" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {progress.length === 0 ? (
            <div
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: 18,
                padding: 28,
              }}
            >
              <EmptyState
                icon={BookOpen}
                title="Ni vpisanih predmetov"
                text="Vpiši se v predmet in tvoj napredek se bo prikazal tukaj."
              />
            </div>
          ) : (
            progress.map((p, i) => {
              const pct = p.total_lessons > 0 ? Math.round((p.completed_lessons / p.total_lessons) * 100) : 0;
              const color = barColors[i % barColors.length];
              return (
                <div className="subject-progress-row" key={p.subject_id} style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 10,
                            background: color + "18",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color,
                          }}
                        >
                          <BookOpen size={18} strokeWidth={2.25} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{p.subject_name}</h3>
                      </div>
                      {p.last_activity && (
                        <p style={{ margin: "6px 0 0 48px", color: "#9ca3af", fontSize: 13 }}>
                          Zadnja aktivnost: {new Date(p.last_activity).toLocaleDateString("sl-SI")}
                        </p>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Lekcije</div>
                        <div style={{ fontWeight: 800, fontSize: 18, color: "#374151" }}>
                          {p.completed_lessons}/{p.total_lessons}
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Kvizi</div>
                        <div style={{ fontWeight: 800, fontSize: 18, color: "#374151" }}>{p.quiz_attempts}</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Povprečje</div>
                        <div style={{ fontWeight: 800, fontSize: 18, color }}>
                          {p.average_score > 0 ? `${p.average_score}%` : "—"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>Napredek lekcij</span>
                      <span style={{ fontSize: 13, color, fontWeight: 800 }}>{pct}%</span>
                    </div>
                    <div
                      style={{
                        height: 10,
                        background: "#f3f4f6",
                        borderRadius: 20,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: color,
                          borderRadius: 20,
                          transition: "width 0.6s ease",
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
