import type { GameType } from "../types/game";

export type OrderStatus = "delivered" | "shipped" | "processing" | "completed";

export type OrderItem = {
  gameId: number;
  title: string;
  platform: string;
  type: GameType;
  quantity: number;
  price: number;
  /** Only set for digital key items */
  key?: string;
};

export type Order = {
  id: string;
  date: string; // ISO
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shippingPrice: number;
  total: number;
  paymentMethod: string;
  /** Only set if order contained a physical disc */
  shippingAddress?: {
    firstName: string;
    lastName: string;
    street: string;
    houseNumber: string;
    houseExt: string;
    postCode: string;
    city: string;
    country: string;
  };
};

// TODO: replace with GET /api/orders when backend exists.
export const mockOrders: Order[] = [
  {
    id: "VUUR-48211",
    date: "2026-04-22T15:34:00Z",
    status: "completed",
    paymentMethod: "iDEAL",
    items: [
      {
        gameId: 11,
        title: "The Witcher 3",
        platform: "PC",
        type: "key",
        quantity: 1,
        price: 9.99,
        key: "X4F2K-9BHJP-22LMR-7QW8T",
      },
      {
        gameId: 4,
        title: "Hades II",
        platform: "PC",
        type: "key",
        quantity: 1,
        price: 19.99,
        key: "P9MN2-44KLR-W8XQT-VH3FB",
      },
    ],
    subtotal: 29.98,
    shippingPrice: 0,
    total: 29.98,
  },
  {
    id: "VUUR-47998",
    date: "2026-03-08T11:12:00Z",
    status: "delivered",
    paymentMethod: "Visa / Mastercard",
    items: [
      {
        gameId: 12,
        title: "God of War Ragnarök",
        platform: "PS5",
        type: "disc",
        quantity: 1,
        price: 49.99,
      },
      {
        gameId: 2,
        title: "Elden Ring",
        platform: "PS5",
        type: "disc",
        quantity: 1,
        price: 39.99,
      },
    ],
    subtotal: 89.98,
    shippingPrice: 0,
    total: 89.98,
    shippingAddress: {
      firstName: "Jan",
      lastName: "de Vries",
      street: "Voorbeeldstraat",
      houseNumber: "42",
      houseExt: "",
      postCode: "1234 AB",
      city: "Amsterdam",
      country: "NL",
    },
  },
  {
    id: "VUUR-47512",
    date: "2026-01-30T09:50:00Z",
    status: "completed",
    paymentMethod: "PayPal",
    items: [
      {
        gameId: 1,
        title: "Cyberpunk 2077",
        platform: "PC",
        type: "key",
        quantity: 1,
        price: 14.99,
        key: "C2P77-AAA12-BBB34-CCC56",
      },
    ],
    subtotal: 14.99,
    shippingPrice: 0,
    total: 14.99,
  },
  {
    id: "VUUR-48402",
    date: "2026-05-14T17:01:00Z",
    status: "shipped",
    paymentMethod: "iDEAL",
    items: [
      {
        gameId: 15,
        title: "Forza Horizon 5",
        platform: "Xbox",
        type: "disc",
        quantity: 1,
        price: 34.99,
      },
    ],
    subtotal: 34.99,
    shippingPrice: 4.99,
    total: 39.98,
    shippingAddress: {
      firstName: "Jan",
      lastName: "de Vries",
      street: "Voorbeeldstraat",
      houseNumber: "42",
      houseExt: "",
      postCode: "1234 AB",
      city: "Amsterdam",
      country: "NL",
    },
  },
];
