import type { ComponentType } from "react";
import BoltIcon from "../components/icons/BoltIcon";
import GamepadIcon from "../components/icons/GamepadIcon";
import LockIcon from "../components/icons/LockIcon";

export type USP = {
  Icon: ComponentType<{ className?: string }>;
  Title: string;
  Description: string;
};

export const Platforms: string[] = ["Steam", "Epic", "PS5", "Xbox", "Switch", "Ubisoft"];

export const USPs: USP[] = [
  {
    Icon: BoltIcon,
    Title: "Directe Levering",
    Description: "Ontvang je gamekey direct na betaling in je account. Geen wachttijd, geen gedoe.",
  },
  {
    Icon: GamepadIcon,
    Title: "Alle Platforms",
    Description: "Van PC tot console — wij bieden keys voor Steam, Epic, PlayStation, Xbox en meer.",
  },
  {
    Icon: LockIcon,
    Title: "Veilig & Betrouwbaar",
    Description: "Veilig betalen via onze beveiligde checkout. Al je aankopen staan overzichtelijk in je account.",
  },
];
