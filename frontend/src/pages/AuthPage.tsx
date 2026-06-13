import { useState } from "react";
import { useAuth, UserRole } from "../context/AuthContext";

type Tab = "login" | "register";

export default function AuthPage() {
  const { login, register } = useAuth();

  const [tab, setTab] = useState<Tab>("login");
  const [role, setRole] = useState<UserRole>("STUDENT");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const result = await login(loginEmail, loginPassword);
    if (result.error) setError(result.error);
    setIsLoading(false);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (regPassword.length < 8) {
      setError("Geslo mora imeti vsaj 8 znakov.");
      return;
    }
    setIsLoading(true);
    const result = await register({
      email: regEmail,
      password: regPassword,
      fullName: regName,
      role,
    });
    if (result.error) setError(result.error);
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8fc] px-4">
      <div className="flex w-full max-w-3xl rounded-2xl overflow-hidden shadow-xl border border-gray-200">

        {/* Leva stran */}
        <div className="hidden md:flex flex-col justify-between w-[42%] bg-[#1a1035] p-10">
          <span className="text-white text-xl font-bold tracking-tight">
            Learn<span className="text-purple-400">Smart</span>
          </span>

          <div>
            <h2 className="text-white text-3xl font-bold leading-snug mb-3">
              Učenje,<br />
              <em className="not-italic text-purple-300">prilagojeno tebi</em>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Ugotovi svoj učni tip in pridobi vsebine, ustvarjene točno zate.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { icon: "🧠", text: "AI prilagoditev glede na učni tip" },
              { icon: "📈", text: "Sledenje napredku v realnem času" },
              { icon: "🔁", text: "Spaced repetition algoritem" },
            ].map((b) => (
              <div
                key={b.text}
                className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-300 text-sm"
              >
                <span>{b.icon}</span>
                {b.text}
              </div>
            ))}
          </div>
        </div>

        {/* Desna stran */}
        <div className="flex-1 bg-white p-8 md:p-10 flex flex-col justify-center">

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
            {(["login", "register"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(null); }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                  tab === t
                    ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t === "login" ? "Prijava" : "Registracija"}
              </button>
            ))}
          </div>

          {/* Login */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Dobrodošel nazaj</h1>
              <p className="text-sm text-gray-500 mb-6">Prijavi se in nadaljuj z učenjem.</p>

              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                E-pošta
              </label>
              <input
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="ime@email.com"
                className="mb-4 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition"
              />

              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Geslo
              </label>
              <input
                type="password"
                required
                minLength={8}
                maxLength={128}
                autoComplete="current-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="mb-5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition"
              />

              {error && (
                <p className="text-red-500 text-sm mb-3 bg-red-50 border border-red-100 rounded-xl px-4 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-60"
              >
                {isLoading ? "Prijavljam..." : "Prijava →"}
              </button>

              <p className="text-center text-xs text-gray-400 mt-4">
                Nimaš računa?{" "}
                <button
                  type="button"
                  onClick={() => setTab("register")}
                  className="text-purple-600 font-semibold hover:underline"
                >
                  Registriraj se
                </button>
              </p>
            </form>
          )}

          {/* Register */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Ustvari račun</h1>
              <p className="text-sm text-gray-500 mb-6">Pridruži se LearnSmart skupnosti.</p>

              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Polno ime
              </label>
              <input
                type="text"
                required
                maxLength={100}
                autoComplete="name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Ana Novak"
                className="mb-4 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition"
              />

              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                E-pošta
              </label>
              <input
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="ime@email.com"
                className="mb-4 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition"
              />

              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Geslo
              </label>
              <input
                type="password"
                required
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="najmanj 8 znakov"
                className="mb-5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition"
              />

              {/* Izbira vloge */}
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Registracija kot
              </p>
              <div className="flex gap-3 mb-5">
                {(["STUDENT", "PROFESSOR"] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex-1 flex items-center gap-3 border-2 rounded-xl p-3.5 transition-all text-left ${
                      role === r
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    <span className="text-xl">{r === "STUDENT" ? "🎓" : "👨‍🏫"}</span>
                    <div>
                      <p className={`text-sm font-semibold ${role === r ? "text-purple-700" : "text-gray-700"}`}>
                        {r === "STUDENT" ? "Študent / Dijak" : "Profesor"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {r === "STUDENT" ? "Dostop do lekcij in kvizov" : "Ustvarjanje vsebin"}
                      </p>
                    </div>
                    <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      role === r ? "border-purple-500 bg-purple-500" : "border-gray-300"
                    }`}>
                      {role === r && <span className="text-white text-xs">✓</span>}
                    </div>
                  </button>
                ))}
              </div>

              {error && (
                <p className="text-red-500 text-sm mb-3 bg-red-50 border border-red-100 rounded-xl px-4 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-60"
              >
                {isLoading ? "Ustvarjam račun..." : "Ustvari račun →"}
              </button>

              <p className="text-center text-xs text-gray-400 mt-4">
                Že imaš račun?{" "}
                <button
                  type="button"
                  onClick={() => setTab("login")}
                  className="text-purple-600 font-semibold hover:underline"
                >
                  Prijavi se
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
