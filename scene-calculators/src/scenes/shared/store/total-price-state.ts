import { atom } from "@byko/lib-recoil";

export interface totalPrice {
  id: string;
  price: number;
  vat: number;
  discountedVat: number;
  discount: number;
  discountTotal: number;
}
export const totalPriceState = atom<totalPrice[]>({
  key: "totalPriceState",
  default: [],
});
