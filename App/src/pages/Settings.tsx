import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAddresses, type Address, type AddressDraft } from "../context/AddressContext";

const INPUT_CLASS =
  "w-full bg-[#0D0D0D] border border-[#2A2A2A] focus:border-[#F25B29] text-gray-300 placeholder-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#F25B29] transition-all";
const LABEL_CLASS =
  "text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1.5";

const emptyDraft: AddressDraft = {
  label: "",
  firstName: "",
  lastName: "",
  street: "",
  houseNumber: "",
  houseExt: "",
  postCode: "",
  city: "",
  country: "NL",
  phone: "",
};

const AddressForm: React.FC<{
  initial?: AddressDraft;
  submitLabel: string;
  onSubmit: (draft: AddressDraft) => void;
  onCancel: () => void;
}> = ({ initial, submitLabel, onSubmit, onCancel }) => {
  const [draft, setDraft] = useState<AddressDraft>(initial ?? emptyDraft);

  const set = <K extends keyof AddressDraft>(key: K, value: AddressDraft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="bg-[#0D0D0D] border border-[#1E1E1E] rounded-xl p-5 space-y-4">
      <div>
        <label className={LABEL_CLASS}>Label</label>
        <input value={draft.label} onChange={(e) => set("label", e.target.value)} placeholder="Thuis, Werk, ..." className={INPUT_CLASS} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLASS}>Voornaam</label>
          <input value={draft.firstName} onChange={(e) => set("firstName", e.target.value)} className={INPUT_CLASS} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Achternaam</label>
          <input value={draft.lastName} onChange={(e) => set("lastName", e.target.value)} className={INPUT_CLASS} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className={LABEL_CLASS}>Straatnaam</label>
          <input value={draft.street} onChange={(e) => set("street", e.target.value)} className={INPUT_CLASS} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Huisnummer</label>
          <input value={draft.houseNumber} onChange={(e) => set("houseNumber", e.target.value)} className={INPUT_CLASS} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Toevoeging</label>
          <input value={draft.houseExt} onChange={(e) => set("houseExt", e.target.value)} className={INPUT_CLASS} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Postcode</label>
          <input value={draft.postCode} onChange={(e) => set("postCode", e.target.value)} className={INPUT_CLASS} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Stad</label>
          <input value={draft.city} onChange={(e) => set("city", e.target.value)} className={INPUT_CLASS} />
        </div>
        <div className="col-span-2">
          <label className={LABEL_CLASS}>Land</label>
          <select value={draft.country} onChange={(e) => set("country", e.target.value)} className={INPUT_CLASS}>
            <option value="NL">Nederland</option>
            <option value="BE">België</option>
            <option value="DE">Duitsland</option>
            <option value="FR">Frankrijk</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className={LABEL_CLASS}>Telefoonnummer (optioneel)</label>
          <input value={draft.phone ?? ""} onChange={(e) => set("phone", e.target.value)} className={INPUT_CLASS} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-gray-400 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={draft.isDefault ?? false}
          onChange={(e) => set("isDefault", e.target.checked)}
          className="accent-[#F25B29] w-4 h-4"
        />
        Instellen als standaard adres
      </label>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="border border-[#2A2A2A] cursor-pointer hover:border-[#F25B29]/30 text-gray-400 hover:text-white px-5 py-3 rounded-xl font-bold transition-all"
        >
          Annuleren
        </button>
        <button
          onClick={() => onSubmit(draft)}
          className="flex-1 cursor-pointer bg-[#F25B29] hover:bg-[#d94e22] text-white font-black py-3 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(242,91,41,0.3)]"
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
};

const Settings: React.FC = () => {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const { addresses, addAddress, updateAddress, removeAddress, setDefault } = useAddresses();

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [savedNotice, setSavedNotice] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    document.title = "Instellingen – VUUR";
  }, []);

  useEffect(() => {
    if (!savedNotice) return;
    const t = window.setTimeout(() => setSavedNotice(false), 2000);
    return () => window.clearTimeout(t);
  }, [savedNotice]);

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  const saveProfile = () => {
    updateProfile({ firstName, lastName, email });
    setSavedNotice(true);
  };

  const handleAdd = (draft: AddressDraft) => {
    addAddress(draft);
    setAdding(false);
  };

  const handleUpdate = (id: string) => (draft: AddressDraft) => {
    updateAddress(id, draft);
    if (draft.isDefault) setDefault(id);
    setEditingId(null);
  };

  const editingAddress: Address | undefined = addresses.find((a) => a.id === editingId);

  return (
    <div className="pt-16 min-h-screen bg-[#0D0D0D]">
      <div className="border-b border-[#1A1A1A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-black text-white mb-1">Instellingen</h1>
          <p className="text-gray-500 text-sm">Beheer je account en bezorgadressen</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Account info */}
        <section className="bg-[#111] border border-[#1E1E1E] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className="text-white font-black text-lg">Accountgegevens</h2>
            {savedNotice && (
              <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Opgeslagen
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS}>Voornaam</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Achternaam</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={INPUT_CLASS} />
            </div>
            <div className="col-span-2">
              <label className={LABEL_CLASS}>E-mailadres</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={INPUT_CLASS} />
            </div>
          </div>

          <button
            onClick={saveProfile}
            className="mt-5 bg-[#F25B29] cursor-pointer hover:bg-[#d94e22] text-white font-black px-6 py-3 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(242,91,41,0.3)]"
          >
            Wijzigingen opslaan
          </button>
        </section>

        {/* Address book */}
        <section className="bg-[#111] border border-[#1E1E1E] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <h2 className="text-white font-black text-lg">Adresboek</h2>
              <p className="text-gray-500 text-xs mt-0.5">
                Opgeslagen adressen voor snel afrekenen
              </p>
            </div>
            {!adding && !editingId && (
              <button
                onClick={() => setAdding(true)}
                className="bg-[#F25B29] cursor-pointer hover:bg-[#d94e22] text-white text-sm font-bold px-4 py-2 rounded-lg transition-all"
              >
                + Adres toevoegen
              </button>
            )}
          </div>

          {addresses.length === 0 && !adding ? (
            <div className="text-center py-10 border border-dashed border-[#2A2A2A] rounded-xl">
              <p className="text-gray-500 text-sm">Nog geen opgeslagen adressen</p>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((a) =>
                editingId === a.id ? (
                  <AddressForm
                    key={a.id}
                    initial={a}
                    submitLabel="Adres opslaan"
                    onSubmit={handleUpdate(a.id)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div
                    key={a.id}
                    className="flex items-start gap-4 bg-[#0D0D0D] border border-[#1E1E1E] rounded-xl p-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <p className="text-white font-bold text-sm">{a.label || "Adres"}</p>
                        {a.isDefault && (
                          <span className="text-[#F25B29] text-xs bg-[#F25B29]/10 border border-[#F25B29]/30 px-2 py-0.5 rounded font-bold">
                            Standaard
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">{a.firstName} {a.lastName}</p>
                      <p className="text-gray-500 text-sm">
                        {a.street} {a.houseNumber}{a.houseExt}, {a.postCode} {a.city}
                      </p>
                      <p className="text-gray-500 text-sm">{a.country}{a.phone ? ` · ${a.phone}` : ""}</p>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {!a.isDefault && (
                        <button
                          onClick={() => setDefault(a.id)}
                          className="text-[#F25B29] hover:underline text-xs cursor-pointer"
                        >
                          Standaard
                        </button>
                      )}
                      <button
                        onClick={() => setEditingId(a.id)}
                        className="text-gray-400 hover:text-white text-xs cursor-pointer"
                      >
                        Bewerken
                      </button>
                      <button
                        onClick={() => removeAddress(a.id)}
                        className="text-red-400 hover:text-red-300 text-xs cursor-pointer"
                      >
                        Verwijderen
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {adding && (
            <div className="mt-4">
              <AddressForm
                submitLabel="Adres toevoegen"
                onSubmit={handleAdd}
                onCancel={() => setAdding(false)}
              />
            </div>
          )}

          {editingAddress === undefined && editingId !== null && (
            // safety: clear stale edit id
            <button onClick={() => setEditingId(null)} className="hidden" />
          )}
        </section>
      </div>
    </div>
  );
};

export default Settings;
