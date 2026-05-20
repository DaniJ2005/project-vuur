import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const INPUT_CLASS =
  "w-full bg-[#0D0D0D] border border-[#2A2A2A] focus:border-[#F25B29] text-gray-300 placeholder-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#F25B29] transition-all";
const LABEL_CLASS =
  "text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1.5";

const STRENGTH_COLORS = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-500"];
const STRENGTH_LABELS = ["Zwak", "Matig", "Goed", "Sterk"];

const calcStrength = (pw: string): number => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Registreren – VUUR";
  }, []);

  const passwordStrength = useMemo(() => calcStrength(password), [password]);
  const strengthLabel = passwordStrength > 0 ? STRENGTH_LABELS[passwordStrength - 1] : "";
  const strengthTextColor =
    passwordStrength === 1 ? "text-red-400" :
    passwordStrength === 2 ? "text-orange-400" :
    passwordStrength === 3 ? "text-yellow-400" : "text-emerald-400";

  const handleRegister = async () => {
    if (!firstName.trim() || !email.trim()) {
      setErrorMessage("Vul alle verplichte velden in.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Wachtwoorden komen niet overeen.");
      return;
    }
    if (!acceptTerms) {
      setErrorMessage("Je moet akkoord gaan met de voorwaarden.");
      return;
    }
    await register({ firstName, lastName, email, password });
    navigate("/");
  };

  const benefits: { icon: string; label: string }[] = [
    { icon: "", label: "Game Keys" },
    { icon: "", label: "Library" },
    { icon: "", label: "Wishlist" },
  ];

  return (
    <div className="pt-16 min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4 py-10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#F25B29] opacity-5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-[#F25B29] rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5S14.67 12 15.5 12s1.5.67 1.5 1.5S16.33 15 15.5 15zm3-3c-.83 0-1.5-.67-1.5-1.5S17.67 10 18.5 10s1.5.67 1.5 1.5S19.33 12 18.5 12z" />
              </svg>
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">
              VU<span className="text-[#F25B29]">UR</span>
            </span>
          </Link>
          <p className="text-gray-500 text-sm mt-3">Maak je gratis account aan</p>
        </div>

        {/* Card */}
        <div className="bg-[#111] border border-[#1E1E1E] rounded-2xl p-8">
          <h1 className="text-white font-black text-2xl mb-6">Account aanmaken</h1>

          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errorMessage}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLASS}>Voornaam</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jan" className={INPUT_CLASS} />
              </div>
              <div>
                <label className={LABEL_CLASS}>Achternaam</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="de Vries" className={INPUT_CLASS} />
              </div>
            </div>

            <div>
              <label className={LABEL_CLASS}>E-mailadres</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="jij@example.com" className={INPUT_CLASS} />
            </div>

            <div>
              <label className={LABEL_CLASS}>Wachtwoord</label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimaal 8 tekens"
                  className={`${INPUT_CLASS} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-3 cursor-pointer text-gray-500 hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? "Wachtwoord verbergen" : "Wachtwoord tonen"}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((idx) => (
                      <div
                        key={idx}
                        className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                          passwordStrength > idx
                            ? STRENGTH_COLORS[Math.min(passwordStrength - 1, 3)]
                            : "bg-[#2A2A2A]"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${strengthTextColor}`}>{strengthLabel}</p>
                </div>
              )}
            </div>

            <div>
              <label className={LABEL_CLASS}>Wachtwoord bevestigen</label>
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                placeholder="Herhaal wachtwoord"
                className={INPUT_CLASS}
              />
              {confirmPassword && confirmPassword !== password && (
                <p className="text-red-400 text-xs mt-1">Wachtwoorden komen niet overeen</p>
              )}
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="accent-[#F25B29] w-4 h-4 mt-0.5 flex-shrink-0"
              />
              <label htmlFor="terms" className="text-gray-500 text-sm cursor-pointer leading-relaxed">
                Ik ga akkoord met de{" "}
                <Link to="/terms" className="text-[#F25B29] hover:underline">Algemene Voorwaarden</Link>{" "}
                en het{" "}
                <Link to="/privacy" className="text-[#F25B29] hover:underline">Privacybeleid</Link>
              </label>
            </div>

            <button
              onClick={handleRegister}
              className="w-full cursor-pointer bg-[#F25B29] hover:bg-[#d94e22] text-white font-black py-3.5 rounded-xl text-base transition-all duration-200 hover:shadow-[0_0_20px_rgba(242,91,41,0.3)] active:scale-95 mt-2"
            >
              Account aanmaken
            </button>
          </div>

          {/* Benefits */}
          <div className="mt-6 pt-6 border-t border-[#1A1A1A]">
            <p className="text-gray-600 text-xs text-center mb-3">Als lid krijg je toegang tot:</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {benefits.map(({ icon, label }) => (
                <div key={label} className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl p-2">
                  <div className="text-lg mb-1">{icon}</div>
                  <p className="text-gray-600 text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-gray-600 text-sm mt-6">
          Al een account?{" "}
          <Link to="/login" className="text-[#F25B29] hover:underline font-medium">Inloggen</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
