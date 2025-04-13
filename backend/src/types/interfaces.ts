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
  item_name: string;
  link: string;
  country_code: string;
}

export interface Price {
  item_name: string;
  country_code: string;
  price_domestic: Number;
  price_foreign: Number;
  image_link: string;
  website_link: string;
}

export interface ForeignPrice {
  currency: string;
  price: number;
}