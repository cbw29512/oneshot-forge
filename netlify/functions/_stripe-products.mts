export type StripeProduct = {
  id: string;
  title: string;
  amountCents: number;
};

const PRODUCTS: Record<string, StripeProduct> = {
  "the-well-that-would-not-dry": {
    id: "the-well-that-would-not-dry",
    title: "The Well That Would Not Dry",
    amountCents: 99,
  },
  "birthday-one-shot": {
    id: "birthday-one-shot",
    title: "Birthday One Shot",
    amountCents: 99,
  },
  "the-owlbear-egg": {
    id: "the-owlbear-egg",
    title: "The Owlbear Egg",
    amountCents: 99,
  },
  "whispers-of-the-oakhaven-hollow": {
    id: "whispers-of-the-oakhaven-hollow",
    title: "Whispers of the Oakhaven Hollow",
    amountCents: 99,
  },
  "beneath-the-eastern-watchtower": {
    id: "beneath-the-eastern-watchtower",
    title: "Beneath the Eastern Watchtower",
    amountCents: 99,
  },
  "the-black-orchard": {
    id: "the-black-orchard",
    title: "The Black Orchard",
    amountCents: 99,
  },
  "the-ashen-bridge": {
    id: "the-ashen-bridge",
    title: "The Ashen Bridge",
    amountCents: 99,
  },
  "the-bell-beneath-the-mere": {
    id: "the-bell-beneath-the-mere",
    title: "The Bell Beneath the Mere",
    amountCents: 99,
  },
  "right-to-owlbear-arms": {
    id: "right-to-owlbear-arms",
    title: "Right to OwlBear Arms",
    amountCents: 99,
  },
};

export function getStripeProduct(productId: string): StripeProduct | null {
  return PRODUCTS[productId] ?? null;
}
