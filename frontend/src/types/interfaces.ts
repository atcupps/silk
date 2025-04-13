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

  export interface SharedProps {
    items: Item[];
    setItems: React.Dispatch<React.SetStateAction<Item[]>>;
    tickets: Ticket[];
    setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  }

  export enum UserMode {
    Buyer = 'Buyer',
    Fulfiller = 'Fulfiller',
  }