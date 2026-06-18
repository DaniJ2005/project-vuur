import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import BoltIcon from "../components/icons/BoltIcon";

const WorkInProgress: React.FC = () => {
  useEffect(() => {
    document.title = "Binnenkort beschikbaar – VUUR";
  }, []);

  return (
    <div className="pt-16 min-h-screen bg-[#0D0D0D] flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#F25B29]/10 border border-[#F25B29]/30 flex items-center justify-center">
          <BoltIcon className="w-8 h-8 text-[#F25B29]" />
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Work in Progress</h1>
        <p className="text-gray-400 text-sm mb-1">Deze pagina is WIP (of niet)</p>
        <p className="text-gray-500 text-sm mb-8">
          Wegens tekort aan tijd zal deze feature waarschijnlijk nooit gemaakt worden.
        </p>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 bg-[#F25B29] hover:bg-[#d94e22] text-white px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200"
        >
          Terug naar de catalogus
        </Link>
      </div>
    </div>
  );
};

export default WorkInProgress;
