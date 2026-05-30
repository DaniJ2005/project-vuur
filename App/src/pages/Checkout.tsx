import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "@/features/auth/AuthProvider";
import { useAddresses } from "../context/AddressContext";
import type { Address } from "@/features/addresses/addresses.types";
import { cartHasDisc, cartTotal, type CartItem } from "../types/game";
import OrderSummary from "../components/OrderSummary";

const INPUT_CLASS =
  "w-full bg-[#0D0D0D] border border-[#2A2A2A] focus:border-[#F25B29] text-gray-300 placeholder-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#F25B29] transition-all";
const LABEL_CLASS =
  "text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1.5";

type PaymentMethod = { id: string; icon: string; name: string; desc: string };
const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "ideal",  icon: "", name: "iDEAL",             desc: "Betaal via je bank" },
  { id: "visa",   icon: "", name: "Visa / Mastercard", desc: "Creditcard betaling" },
  { id: "paypal", icon: "", name: "PayPal",            desc: "Betaal via je PayPal account" },
  { id: "crypto", icon: "", name: "Crypto",            desc: "Bitcoin, Ethereum en meer" },
];

type ShippingOption = { id: string; icon: string; name: string; desc: string; price: number };
const SHIPPING_OPTIONS: ShippingOption[] = [
  { id: "standard", icon: "", name: "Standaard", desc: "2-4 werkdagen",   price: 0 },
  { id: "express",  icon: "", name: "Express",   desc: "1-2 werkdagen",   price: 4.99 },
  { id: "same_day", icon: "", name: "Same Day",  desc: "Vandaag bezorgd", price: 9.99 },
];

const KEY_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

// Deterministic fake gamekey (mock — replaces backend assignment).
const generateFakeKey = (seed: number): string => {
  let state = seed * 31337;
  const next = () => {
    // Simple xorshift32
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return Math.abs(state);
  };
  const part = () =>
    Array.from({ length: 5 }, () => KEY_CHARS[next() % KEY_CHARS.length]).join("");
  return `${part()}-${part()}-${part()}-${part()}`;
};

type Step = "details" | "delivery" | "payment" | "confirmation";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { addresses, defaultAddress } = useAddresses();

  // Snapshot cart at the moment of payment so the confirmation page survives a clear.
  const [confirmedItems, setConfirmedItems] = useState<CartItem[] | null>(null);
  const activeItems = confirmedItems ?? cartItems;
  const hasDisc = useMemo(() => cartHasDisc(activeItems), [activeItems]);
  const hasKey = useMemo(() => activeItems.some((i) => i.game.type === "key"), [activeItems]);

  // Step order is dynamic based on cart contents
  const stepOrder: Step[] = useMemo(
    () => (hasDisc ? ["details", "delivery", "payment", "confirmation"] : ["details", "payment", "confirmation"]),
    [hasDisc]
  );

  const [step, setStep] = useState<Step>("details");
  const stepIndex = stepOrder.indexOf(step);

  // Personal — pre-fill from logged-in user once `useMe` resolves.
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  const hasPrefilled = useRef(false);
  useEffect(() => {
    if (!user || hasPrefilled.current) return;
    setFirstName((prev) => prev || user.firstName);
    setLastName((prev) => prev || user.lastName);
    setEmail((prev) => prev || user.email);
    hasPrefilled.current = true;
  }, [user]);

  // Address
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [houseExt, setHouseExt] = useState("");
  const [postCode, setPostCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("NL");

  // Saved-address picker (only relevant when authenticated + cart has disc)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    defaultAddress?.id ?? null
  );
  const [useCustomAddress, setUseCustomAddress] = useState<boolean>(addresses.length === 0);

  // Payment + shipping
  const [selectedPayment, setSelectedPayment] = useState("ideal");
  const [selectedShipping, setSelectedShipping] = useState("standard");

  // The recipient name comes from the logged-in account (prefilled above), so
  // applying a saved address only copies its location fields.
  const applyAddress = (a: Address) => {
    setStreet(a.street);
    setHouseNumber(a.houseNumber);
    setHouseExt(a.houseExt);
    setPostCode(a.postCode);
    setCity(a.city);
    setCountry(a.countryCode);
  };

  // When the picker selection changes, copy fields into the form state so the
  // payment/confirmation steps and order summary stay in sync with one source of truth.
  useEffect(() => {
    if (!isAuthenticated || useCustomAddress) return;
    const sel = addresses.find((a) => a.id === selectedAddressId);
    if (sel) applyAddress(sel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddressId, useCustomAddress, isAuthenticated]);

  const shipping = SHIPPING_OPTIONS.find((s) => s.id === selectedShipping) ?? SHIPPING_OPTIONS[0];
  const shippingPrice = hasDisc ? shipping.price : 0;
  const total = cartTotal(activeItems) + shippingPrice;

  const [orderNumber] = useState(() => Math.floor(10000 + Math.random() * 90000));
  const [copiedKeyId, setCopiedKeyId] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Afrekenen – VUUR";
  }, []);

  useEffect(() => {
    if (!copiedKeyId) return;
    const t = window.setTimeout(() => setCopiedKeyId(null), 1500);
    return () => window.clearTimeout(t);
  }, [copiedKeyId]);

  // Empty cart guard — only when not on confirmation
  if (cartItems.length === 0 && step !== "confirmation") {
    return <Navigate to="/catalog" replace />;
  }

  const next = () => setStep(stepOrder[stepIndex + 1] ?? step);
  const prev = () => setStep(stepOrder[stepIndex - 1] ?? step);

  const processPayment = () => {
    setConfirmedItems(cartItems);
    setStep("confirmation");
    // Clear cart so navigating away does not re-trigger checkout for the same items
    cartItems.forEach((i) => removeFromCart(i.game.id));
  };

  const copyKey = async (gameId: number, key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKeyId(gameId);
    } catch {
      // Clipboard may be unavailable; silently ignore.
    }
  };

  // ── Progress bar steps ──────────────────────────────────────────────────────
  const progressSteps: { key: Step; label: string }[] = [
    { key: "details", label: "Gegevens" },
    ...(hasDisc ? [{ key: "delivery" as Step, label: "Bezorging" }] : []),
    { key: "payment", label: "Betaling" },
    { key: "confirmation", label: "Bevestiging" },
  ];

  return (
    <div className="pt-16 min-h-screen bg-[#0D0D0D]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {progressSteps.map(({ key, label }, idx) => {
            const reached = stepOrder.indexOf(step) >= stepOrder.indexOf(key);
            const passed = stepOrder.indexOf(step) > stepOrder.indexOf(key);
            return (
              <div key={key} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                    reached
                      ? "bg-[#F25B29] text-white"
                      : "bg-[#1A1A1A] border border-[#2A2A2A] text-gray-600"
                  }`}
                >
                  {passed ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                <span className={`text-xs font-medium ${reached ? "text-white" : "text-gray-600"}`}>
                  {label}
                </span>
                {idx < progressSteps.length - 1 && (
                  <div className={`w-8 h-px ${passed ? "bg-[#F25B29]" : "bg-[#2A2A2A]"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── STEP: details ──────────────────────────────────────────────────── */}
        {step === "details" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-[#111] border border-[#1E1E1E] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <h2 className="text-white font-black text-lg">
                    {hasDisc ? "Persoonlijke gegevens" : "Digitale levering"}
                  </h2>
                </div>
                {!hasDisc && (
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mb-6">
                    <p className="text-blue-400 text-sm">
                      Na betaling ontvang je jouw gamekeys direct in je account. Geen wachttijd, geen verzendkosten.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL_CLASS}>Voornaam</label>
                    <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" className={INPUT_CLASS} />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Achternaam</label>
                    <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" className={INPUT_CLASS} />
                  </div>
                  <div className="col-span-2">
                    <label className={LABEL_CLASS}>E-mailadres</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="email@example.com" className={INPUT_CLASS} />
                    {hasKey && (
                      <p className="text-gray-600 text-xs mt-1">Je keys worden hier naartoe gestuurd</p>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={next}
                className="w-full cursor-pointer bg-[#F25B29] hover:bg-[#d94e22] text-white font-black py-4 rounded-xl text-lg transition-all hover:shadow-[0_0_20px_rgba(242,91,41,0.3)] active:scale-95 flex items-center justify-center gap-2"
              >
                Doorgaan
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
            <OrderSummary items={activeItems} shippingPrice={shippingPrice} showShipping={hasDisc} />
          </div>
        )}

        {/* ── STEP: delivery ─────────────────────────────────────────────────── */}
        {step === "delivery" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                <span className="text-2xl flex-shrink-0"></span>
                <div>
                  <p className="text-amber-400 font-bold text-sm">Fysieke bezorging</p>
                  <p className="text-amber-400/70 text-xs mt-0.5">
                    Je bestelling bevat fysieke discs. Vul hieronder je bezorgadres in. Verwachte levertijd: 2–4 werkdagen.
                  </p>
                </div>
              </div>

              {/* Saved-address picker (only when logged in and we have addresses) */}
              {isAuthenticated && addresses.length > 0 && (
                <div className="bg-[#111] border border-[#1E1E1E] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <h2 className="text-white font-black text-lg">Kies een opgeslagen adres</h2>
                    <button
                      onClick={() => {
                        setUseCustomAddress((v) => !v);
                        if (useCustomAddress) {
                          // switching back to picker — re-apply current selection
                          const sel = addresses.find((a) => a.id === selectedAddressId) ?? defaultAddress;
                          if (sel) {
                            setSelectedAddressId(sel.id);
                            applyAddress(sel);
                          }
                        } else {
                          // switching to manual — clear fields
                          setStreet(""); setHouseNumber(""); setHouseExt("");
                          setPostCode(""); setCity(""); setCountry("NL");
                        }
                      }}
                      className="text-[#F25B29] text-xs hover:underline cursor-pointer"
                    >
                      {useCustomAddress ? "← Kies opgeslagen adres" : "Ander adres invoeren →"}
                    </button>
                  </div>

                  {!useCustomAddress && (
                    <div className="space-y-3">
                      {addresses.map((a) => (
                        <label
                          key={a.id}
                          className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                            selectedAddressId === a.id
                              ? "border-[#F25B29]/50 bg-[#F25B29]/5"
                              : "border-[#2A2A2A] hover:border-[#3A3A3A]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="saved-address"
                            checked={selectedAddressId === a.id}
                            onChange={() => setSelectedAddressId(a.id)}
                            className="accent-[#F25B29] mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-white text-sm font-bold">{a.label || "Adres"}</p>
                              {a.isDefault && (
                                <span className="text-[#F25B29] text-xs bg-[#F25B29]/10 border border-[#F25B29]/30 px-2 py-0.5 rounded font-bold">
                                  Standaard
                                </span>
                              )}
                            </div>
                            <p className="text-gray-500 text-xs">
                              {a.street} {a.houseNumber}{a.houseExt}, {a.postCode} {a.city}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Manual form — shown when guest, no saved addresses, or "ander adres" toggled */}
              {(!isAuthenticated || addresses.length === 0 || useCustomAddress) && (
                <div className="bg-[#111] border border-[#1E1E1E] rounded-2xl p-6">
                  <h2 className="text-white font-black text-lg mb-5">Bezorgadres</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className={LABEL_CLASS}>Straatnaam</label>
                      <input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Voorbeeldstraat" className={INPUT_CLASS} />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Huisnummer</label>
                      <input value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} placeholder="42" className={INPUT_CLASS} />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Toevoeging</label>
                      <input value={houseExt} onChange={(e) => setHouseExt(e.target.value)} placeholder="A" className={INPUT_CLASS} />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Postcode</label>
                      <input value={postCode} onChange={(e) => setPostCode(e.target.value)} placeholder="1234 AB" className={INPUT_CLASS} />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Stad</label>
                      <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Amsterdam" className={INPUT_CLASS} />
                    </div>
                    <div className="col-span-2">
                      <label className={LABEL_CLASS}>Land</label>
                      <select value={country} onChange={(e) => setCountry(e.target.value)} className={INPUT_CLASS}>
                        <option value="NL">Nederland</option>
                        <option value="BE">België</option>
                        <option value="DE">Duitsland</option>
                        <option value="FR">Frankrijk</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-[#111] border border-[#1E1E1E] rounded-2xl p-6">
                <h2 className="text-white font-black text-lg mb-4">Verzendmethode</h2>
                <div className="space-y-3">
                  {SHIPPING_OPTIONS.map((ship) => (
                    <label
                      key={ship.id}
                      className={`flex items-center justify-between gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedShipping === ship.id
                          ? "border-[#F25B29]/50 bg-[#F25B29]/5"
                          : "border-[#2A2A2A] hover:border-[#3A3A3A]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          value={ship.id}
                          checked={selectedShipping === ship.id}
                          onChange={() => setSelectedShipping(ship.id)}
                          className="accent-[#F25B29]"
                        />
                        <span className="text-xl">{ship.icon}</span>
                        <div>
                          <p className="text-white text-sm font-bold">{ship.name}</p>
                          <p className="text-gray-500 text-xs">{ship.desc}</p>
                        </div>
                      </div>
                      <span className="text-[#F25B29] font-black text-sm flex-shrink-0">
                        {ship.price === 0 ? "Gratis" : `€${ship.price.toFixed(2)}`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={prev}
                  className="border border-[#2A2A2A] cursor-pointer hover:border-[#F25B29]/30 text-gray-400 hover:text-white px-6 py-4 rounded-xl font-bold transition-all"
                >
                  ← Terug
                </button>
                <button
                  onClick={next}
                  className="flex-1 cursor-pointer bg-[#F25B29] hover:bg-[#d94e22] text-white font-black py-4 rounded-xl text-lg transition-all hover:shadow-[0_0_20px_rgba(242,91,41,0.3)] active:scale-95 flex items-center justify-center gap-2"
                >
                  Doorgaan naar betaling
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </div>
            <OrderSummary items={activeItems} shippingPrice={shippingPrice} showShipping />
          </div>
        )}

        {/* ── STEP: payment ──────────────────────────────────────────────────── */}
        {step === "payment" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">

              {hasDisc && (
                <div className="bg-[#111] border border-[#1E1E1E] rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-bold text-sm">Bezorgadres</h3>
                    <button
                      onClick={() => setStep("delivery")}
                      className="text-[#F25B29] cursor-pointer text-xs hover:underline"
                    >
                      Wijzigen
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm">{firstName} {lastName}</p>
                  <p className="text-gray-500 text-sm">{street} {houseNumber}{houseExt}, {postCode} {city}</p>
                  <p className="text-gray-500 text-sm">{email}</p>
                </div>
              )}

              <div className="bg-[#111] border border-[#1E1E1E] rounded-2xl p-6">
                <h2 className="text-white font-black text-lg mb-5">Betaalmethode</h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedPayment === method.id
                          ? "border-[#F25B29]/50 bg-[#F25B29]/5"
                          : "border-[#2A2A2A] hover:border-[#3A3A3A]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={selectedPayment === method.id}
                        onChange={() => setSelectedPayment(method.id)}
                        className="accent-[#F25B29]"
                      />
                      <span className="text-2xl">{method.icon}</span>
                      <div>
                        <p className="text-white text-sm font-bold">{method.name}</p>
                        <p className="text-gray-500 text-xs">{method.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="mt-4 bg-[#0D0D0D] border border-[#1E1E1E] rounded-xl p-4">
                  <p className="text-gray-500 text-xs text-center">
                    Dit is een mock betaalomgeving. Geen echte betalingen.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={prev}
                  className="border border-[#2A2A2A] cursor-pointer hover:border-[#F25B29]/30 text-gray-400 hover:text-white px-6 py-4 rounded-xl font-bold transition-all"
                >
                  ← Terug
                </button>
                <button
                  onClick={processPayment}
                  className="flex-1 cursor-pointer bg-[#F25B29] hover:bg-[#d94e22] text-white font-black py-4 rounded-xl text-lg transition-all hover:shadow-[0_0_20px_rgba(242,91,41,0.3)] active:scale-95"
                >
                  €{total.toFixed(2)} Betalen
                </button>
              </div>
            </div>
            <OrderSummary items={activeItems} shippingPrice={shippingPrice} showShipping={hasDisc} />
          </div>
        )}

        {/* ── STEP: confirmation ─────────────────────────────────────────────── */}
        {step === "confirmation" && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-3xl font-black text-white mb-2">
              {hasDisc ? "Bestelling geplaatst!" : "Betaling geslaagd!"}
            </h1>

            {hasDisc ? (
              <>
                <p className="text-gray-400 mb-2">
                  Bestelnummer: <span className="text-[#F25B29] font-mono font-bold">#VUUR-{orderNumber}</span>
                </p>
                <p className="text-gray-500 text-sm mb-8">
                  Een bevestigingsmail is verstuurd naar <span className="text-gray-300">{email || "je e-mailadres"}</span>
                </p>
              </>
            ) : (
              <p className="text-gray-400 mb-8">
                Je gamekeys zijn klaar. Ze zijn ook naar {email || "je e-mailadres"} gestuurd.
              </p>
            )}

            {/* Disc shipping summary */}
            {hasDisc && (
              <div className="bg-[#111] border border-[#1E1E1E] rounded-2xl p-6 text-left mb-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <span></span> Verzendgegevens
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Bezorgadres</span>
                    <span className="text-gray-300 text-right">{street} {houseNumber}, {postCode} {city}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Verzendmethode</span>
                    <span className="text-gray-300">{shipping.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Verwachte levering</span>
                    <span className="text-emerald-400 font-bold">
                      {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("nl-NL", {
                        day: "2-digit", month: "long", year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Keys per game (only show if there are key items) */}
            {hasKey && (
              <div className="space-y-3 text-left mb-8">
                <h3 className="text-white font-bold text-center mb-2">Jouw game keys</h3>
                {activeItems
                  .filter((item) => item.game.type === "key")
                  .map((item) => {
                    const key = generateFakeKey(item.game.id);
                    const copied = copiedKeyId === item.game.id;
                    return (
                      <div key={item.game.id} className="bg-[#111] border border-emerald-500/20 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-white font-bold">{item.game.title}</p>
                          <span className="text-blue-400 text-xs">KEY</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyKey(item.game.id, key)}
                          className="w-full bg-[#0D0D0D] border border-[#2A2A2A] hover:border-[#F25B29]/50 cursor-pointer rounded-lg px-4 py-3 font-mono text-[#F25B29] text-sm tracking-widest text-center transition-all select-all"
                        >
                          {key}
                        </button>
                        <p className={`text-xs mt-2 text-center transition-colors ${copied ? "text-emerald-400" : "text-gray-600"}`}>
                          {copied ? "Gekopieerd!" : `Klik op de key om te kopiëren · Activeer op ${item.game.platform}`}
                        </p>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Disc items summary */}
            {hasDisc && (
              <div className="bg-[#111] border border-[#1E1E1E] rounded-2xl p-6 text-left mb-8">
                <h3 className="text-white font-bold mb-4">Bestelde producten</h3>
                <div className="space-y-3">
                  {activeItems.map((item) => (
                    <div key={item.game.id} className="flex items-center gap-3 py-2 border-b border-[#1A1A1A] last:border-0">
                      <span className="text-lg">{item.game.type === "disc" ? "" : ""}</span>
                      <div className="flex-1">
                        <p className="text-white text-sm font-bold">{item.game.title}</p>
                        <p className="text-gray-500 text-xs">x{item.quantity}</p>
                      </div>
                      <span className="text-[#F25B29] font-black text-sm">
                        €{(item.game.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {hasKey ? (
                <Link to="/library" className="bg-[#F25B29] hover:bg-[#d94e22] text-white font-black px-8 py-3 rounded-xl transition-all">
                  Naar Mijn Library
                </Link>
              ) : (
                <button
                  onClick={() => navigate("/")}
                  className="bg-[#F25B29] cursor-pointer hover:bg-[#d94e22] text-white font-black px-8 py-3 rounded-xl transition-all"
                >
                  Terug naar home
                </button>
              )}
              <Link
                to="/catalog"
                className="border border-[#2A2A2A] hover:border-[#F25B29]/30 text-gray-400 hover:text-white px-8 py-3 rounded-xl font-bold transition-all"
              >
                Verder winkelen
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
