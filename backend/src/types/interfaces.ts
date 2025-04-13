export interface Ticket{
  ticket_id: number,
  fulfiller_id: number|null,
  item_id: number,
  need_by: Date,
  buyer_id: number,
}

export interface Item{
  item_id: number,
  item_name: string,
  src_country: string,
  link: string,
  price_us: number,
  price_src: number,
   timestamp: Date,
   image_link: string,
}

export interface User {
  user_id: number;
  address: string;
}

export interface Link {
  link: string;
  country_code: string;
}

export interface Price {
  country_code: string;
  priceUSD: Number;
}

export interface ForeignPrice {
  currency: string;
  price: number;
}