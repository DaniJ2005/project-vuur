import React from "react";

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex text-[#F25B29] text-xs">
    {[1, 2, 3, 4, 5].map((i) => (
      <span key={i}>{i <= Math.floor(rating) ? "★" : "☆"}</span>
    ))}
  </div>
);

export default StarRating;
