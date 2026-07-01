import { useEffect, useState } from "react";
import { api, getApiErrorMessage, setStoredToken } from "../../api/api";
import { useAuth } from "../../context/AuthContext";

type MfaFactor = {
  id: string;
  type: string;
  friendlyName: string | null;
  status: string;
  createdAt: string | null;
};

type Enrollment = {
  factorId: string;
  qrCode: string;
  secret: string;
  uri: string;
};

function QrCodePreview({ qrCode }: { qrCode: string }) {
  if (qrCode.startsWith("data:image/")) {
    return (
      <img
        src={qrCode}
        alt="QR koda za 2FA"
        className="mx-auto h-44 w-44 rounded-xl border border-slate-200 bg-white p-2"
      />
    );
  }

  if (qrCode.trim().startsWith("<svg")) {
    return (
      <div
        className="mx-auto h-44 w-44 rounded-xl border border-slate-200 bg-white p-2"
        aria-label="QR koda za 2FA"
        dangerouslySetInnerHTML={{ __html: qrCode }}
      />
    );
  }

  return null;
}

export default function SecuritySettings() {
  const { refreshProfile } = useAuth();
  const [factors, setFactors] = useState<MfaFactor[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    void loadFactors();
  }, []);

  async function loadFactors() {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/auth/mfa/factors");
      setFactors(data.verifiedTotpFactors ?? []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Napaka pri nalaganju 2FA nastavitev."));
    } finally {
      setLoading(false);
    }
  }

  async function startEnrollment() {
    try {
      setWorking(true);
      setError("");
      setSuccess("");
      const { data } = await api.post("/auth/mfa/enroll", {
        friendlyName: "LearnSmart Authenticator",
      });
      setEnrollment(data);
      setCode("");
    } catch (err) {
      setError(getApiErrorMessage(err, "2FA ni bilo mogoče začeti."));
    } finally {
      setWorking(false);
    }
  }

  async function verifyEnrollment() {
    if (!enrollment || code.length !== 6) return;

    try {
      setWorking(true);
      setError("");
      setSuccess("");
      const { data } = await api.post("/auth/mfa/verify-enrollment", {
        factorId: enrollment.factorId,
        code,
      });

      const token = data.session?.access_token;
      if (token) {
        setStoredToken(token);
        await refreshProfile();
      }

      setEnrollment(null);
      setCode("");
      setSuccess("Dvofaktorska avtentikacija je omogočena.");
      await loadFactors();
    } catch (err) {
      setError(getApiErrorMessage(err, "Koda ni pravilna."));
    } finally {
      setWorking(false);
    }
  }

  async function disableFactor(factorId: string) {
    if (!window.confirm("Ali želiš izklopiti dvofaktorsko avtentikacijo?")) {
      return;
    }

    try {
      setWorking(true);
      setError("");
      setSuccess("");
      await api.delete(`/auth/mfa/factors/${factorId}`);
      setSuccess("Dvofaktorska avtentikacija je izklopljena.");
      await loadFactors();
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "2FA ni bilo mogoče izklopiti. Morda se moraš najprej ponovno prijaviti z 2FA."
        )
      );
    } finally {
      setWorking(false);
    }
  }

  const enabled = factors.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-extrabold text-gray-900 text-lg mb-1">
            Varnost prijave
          </h2>
          <p className="text-gray-400 text-sm">
            Za dodatno zaščito računa uporabi aplikacijo za enkratne kode.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
          }`}
        >
          {enabled ? "2FA omogočen" : "2FA izklopljen"}
        </span>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {success}
        </div>
      )}

      {loading ? (
        <p className="mt-5 text-sm text-gray-400">Nalagam varnostne nastavitve...</p>
      ) : enrollment ? (
        <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50 p-5">
          <p className="text-sm font-bold text-violet-800 mb-3">
            Skeniraj QR kodo v aplikaciji, nato vnesi 6-mestno kodo.
          </p>
          <QrCodePreview qrCode={enrollment.qrCode} />
          <div className="mt-4 rounded-xl bg-white border border-violet-100 px-4 py-3">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-1">
              Ročni ključ
            </p>
            <p className="break-all font-mono text-sm text-slate-700">
              {enrollment.secret}
            </p>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="123456"
              className="flex-1 px-4 py-3 rounded-xl border border-violet-200 text-sm outline-none focus:ring-2 focus:ring-violet-300"
            />
            <button
              onClick={verifyEnrollment}
              disabled={working || code.length !== 6}
              className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50"
            >
              Potrdi 2FA
            </button>
          </div>
        </div>
      ) : enabled ? (
        <div className="mt-5 flex items-center justify-between gap-4 flex-wrap rounded-2xl bg-emerald-50 border border-emerald-100 px-5 py-4">
          <div>
            <p className="text-sm font-bold text-emerald-800">
              Tvoj račun zahteva 2FA ob prijavi.
            </p>
            <p className="text-xs text-emerald-600 mt-1">
              Faktor: {factors[0]?.friendlyName || "Authenticator app"}
            </p>
          </div>
          <button
            onClick={() => disableFactor(factors[0].id)}
            disabled={working}
            className="rounded-xl bg-white border border-emerald-200 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
          >
            Izklopi 2FA
          </button>
        </div>
      ) : (
        <div className="mt-5 flex items-center justify-between gap-4 flex-wrap rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4">
          <p className="text-sm text-slate-600">
            2FA še ni omogočen. Po vklopu bo prijava zahtevala še kodo iz aplikacije.
          </p>
          <button
            onClick={startEnrollment}
            disabled={working}
            className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            Omogoči 2FA
          </button>
        </div>
      )}
    </div>
  );
}
