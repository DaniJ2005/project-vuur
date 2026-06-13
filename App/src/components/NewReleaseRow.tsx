import { useNavigate } from "react-router-dom";

interface Game {
  id: string;
  title: string;
  platforms: string[];
  genre: string;
  minPrice: number;
  imageUrl?: string;
}

interface Props {
  game: Game;
  onAddToCart: () => void;
}

const NewReleaseRow: React.FC<Props> = ({ game, onAddToCart }) => {
  const navigate = useNavigate();

  const handleRowClick = () => {
    navigate(`/game/${game.id}`);
  };

  const handleCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent row click firing too
    onAddToCart();
  };

  return (
    <div
      onClick={handleRowClick}
      className="group flex items-center gap-4 bg-[#111] hover:bg-[#161616] border border-[#1A1A1A] hover:border-[#F25B29]/30 rounded-xl px-4 py-3 cursor-pointer transition-all duration-150"
    >
      {/* Thumbnail */}
      <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-[#1A1A1A]">
        {game.imageUrl ? (
          <img src={game.imageUrl} alt={game.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#F25B29] font-black text-lg">
            {game.title.charAt(0)}
          </div>
        )}
      </div>

      {/* Title + meta */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm truncate group-hover:text-[#F25B29] transition-colors">
          {game.title}
        </p>
        <p className="text-gray-500 text-xs mt-0.5">
          {game.genre} · {game.platforms.join(" / ")}
        </p>
      </div>

      {/* NEW badge */}
      <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#F25B29]/10 text-[#F25B29] border border-[#F25B29]/20 flex-shrink-0">
        Nieuw
      </span>

      {/* Price */}
      <span className="text-white font-bold text-sm flex-shrink-0 w-16 text-right">
        €{game.minPrice.toFixed(2).replace(".", ",")}
      </span>

      {/* Add to cart */}
      <button
        onClick={handleCart}
        aria-label={`${game.title} toevoegen aan winkelwagen`}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border border-[#2A2A2A] hover:border-[#F25B29] hover:bg-[#F25B29]/10 text-gray-500 hover:text-[#F25B29] transition-all duration-150"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      </button>
    </div>
  );
};

export default NewReleaseRow;