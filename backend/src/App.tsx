// File: App.tsx

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Types
interface Item {
  item_id: number;
  item_name: string;
  src_country: string;
  link: string;
  image_link: string,
  price_us: number;
  price_src: number;
  timestamp: number;
}

interface User {
  user_id: number;
  address: string;
}

interface Ticket {
  ticket_id: number;
  fulfiller_id: number;
  item_id: number;
  need_by: string;
  buyer_id: number;
}

export default function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [itemForm, setItemForm] = useState({ item_name: '', src_country: '', link: '', image_link: '', price_us: '', price_src: '' });
  const [userForm, setUserForm] = useState({ address: '' });
  const [ticketForm, setTicketForm] = useState({ fulfiller_id: '', item_id: '', need_by: '', buyer_id: '' });

  useEffect(() => {
    fetchItems();
    fetchUsers();
    fetchTickets();
  }, []);

  async function fetchItems() {
    const { data, error } = await supabase.from('items').select('*');
    if (!error && data) setItems(data as Item[]);
  }

  async function fetchUsers() {
    const { data, error } = await supabase.from('users').select('*');
    if (!error && data) setUsers(data as User[]);
  }

  async function fetchTickets() {
    const { data, error } = await supabase.from('tickets').select('*');
    if (!error && data) setTickets(data as Ticket[]);
  }

  async function addItem() {
    await supabase.from('items').insert([
      {
        ...itemForm,
        price_us: parseFloat(itemForm.price_us),
        price_src: parseFloat(itemForm.price_src),
        timestamp: Date.now()
      }
    ]);
    setItemForm({ item_name: '', src_country: '', link: '', image_link: '', price_us: '', price_src: '' });
    fetchItems();
  }

  async function addUser() {
    await supabase.from('users').insert([{ address: userForm.address }]);
    setUserForm({ address: '' });
    fetchUsers();
  }

  async function addTicket() {
    await supabase.from('tickets').insert([
      {
        ...ticketForm,
        item_id: parseInt(ticketForm.item_id),
        fulfiller_id: parseInt(ticketForm.fulfiller_id),
        buyer_id: parseInt(ticketForm.buyer_id),
      }
    ]);
    setTicketForm({ fulfiller_id: '', item_id: '', need_by: '', buyer_id: '' });
    fetchTickets();
  }

  async function deleteRow(table: 'items' | 'users' | 'tickets', idColumn: string, id: number) {
    await supabase.from(table).delete().eq(idColumn, id);
    if (table === 'items') fetchItems();
    if (table === 'users') fetchUsers();
    if (table === 'tickets') fetchTickets();
  }

  return (
    <div className="p-4 space-y-8">
      <section>
        <h1 className="text-xl font-bold">Items</h1>
        <input placeholder="Name" value={itemForm.item_name} onChange={e => setItemForm({ ...itemForm, item_name: e.target.value })} />
        <input placeholder="Country" value={itemForm.src_country} onChange={e => setItemForm({ ...itemForm, src_country: e.target.value })} />
        <input placeholder="Link" value={itemForm.link} onChange={e => setItemForm({ ...itemForm, link: e.target.value })} />
        <input placeholder="USD" value={itemForm.price_us} onChange={e => setItemForm({ ...itemForm, price_us: e.target.value })} />
        <input placeholder="Src price" value={itemForm.price_src} onChange={e => setItemForm({ ...itemForm, price_src: e.target.value })} />
        <button onClick={addItem}>Add</button>
        <ul>
          {items.map(i => (
            <li key={i.item_id}>
              {i.item_name} <button onClick={() => deleteRow('items', 'item_id', i.item_id)}>Delete</button>
              {i.image_link && <img src={i.image_link} alt={i.item_name} className="w-32 mt-2" />}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h1 className="text-xl font-bold">Users</h1>
        <input placeholder="Address" value={userForm.address} onChange={e => setUserForm({ ...userForm, address: e.target.value })} />
        <button onClick={addUser}>Add</button>
        <ul>
          {users.map(u => (
            <li key={u.user_id}>{u.address} <button onClick={() => deleteRow('users', 'user_id', u.user_id)}>Delete</button></li>
          ))}
        </ul>
      </section>

      <section>
        <h1 className="text-xl font-bold">Tickets</h1>
        <input placeholder="Fulfiller ID" value={ticketForm.fulfiller_id} onChange={e => setTicketForm({ ...ticketForm, fulfiller_id: e.target.value })} />
        <input placeholder="Item ID" value={ticketForm.item_id} onChange={e => setTicketForm({ ...ticketForm, item_id: e.target.value })} />
        <input placeholder="Need by (YYYY-MM-DD)" value={ticketForm.need_by} onChange={e => setTicketForm({ ...ticketForm, need_by: e.target.value })} />
        <input placeholder="Buyer ID" value={ticketForm.buyer_id} onChange={e => setTicketForm({ ...ticketForm, buyer_id: e.target.value })} />
        <button onClick={addTicket}>Add</button>
        <ul>
          {tickets.map(t => (
            <li key={t.ticket_id}>Item {t.item_id} for Buyer {t.buyer_id} <button onClick={() => deleteRow('tickets', 'ticket_id', t.ticket_id)}>Delete</button></li>
          ))}
        </ul>
      </section>
    </div>
  );
}
