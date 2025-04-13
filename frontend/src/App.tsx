import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import './App.css'
import Browse from './pages/Browse'
import Fulfillments from './pages/Fulfillments'
import Wishlist from './pages/Wishlist'
import Create from './pages/Create'
import { createClient } from '@supabase/supabase-js';
import {Ticket, Item, User, SharedProps, UserMode} from "./types/interfaces";
import React, { ChangeEvent, useEffect, useState } from 'react'
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function App() {
  const [userMode, setUserMode] = useState<UserMode>(UserMode.Buyer);

  const navigate = useNavigate();

  function toggleMode() {
    console.log("switching modes from " + userMode);
    const newMode = userMode === UserMode.Buyer ? UserMode.Fulfiller : UserMode.Buyer;
    setUserMode(newMode);
    navigate(newMode === UserMode.Buyer ? '/Wishlist' : '/Browse');
  }
  const user_id = 1;

  const [items, setItems] = useState<Item[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [itemForm, setItemForm] = useState({ item_name: '', src_country: '', link: '', image_link: '', price_us: '', price_src: '' });
  const [userForm, setUserForm] = useState({ address: '' });
  const [ticketForm, setTicketForm] = useState({ fulfiller_id: '', item_id: '', need_by: '', buyer_id: '' });

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

useEffect(() => {
  const itemSub = supabase
    .channel('items-watch')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'items',
    }, payload => {
      console.log('Item change:', payload);
      fetchItems(); // re-fetch on any change
    })
    .subscribe();

  const userSub = supabase
    .channel('users-watch')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'users',
    }, payload => {
      console.log('User change:', payload);
      fetchUsers();
    })
    .subscribe();

  const ticketSub = supabase
    .channel('tickets-watch')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'tickets',
    }, payload => {
      console.log('Ticket change:', payload);
      fetchTickets();
    })
    .subscribe();

    fetchItems();
    fetchUsers();
    fetchTickets();

  return () => {
    supabase.removeChannel(itemSub);
    supabase.removeChannel(userSub);
    supabase.removeChannel(ticketSub);
  };
}, []);


  return (
    <Routes>
      <Route path="/Browse" element={<Navigate to="/" />} />
      <Route path="/" element={<Browse items={items} tickets={tickets} setTickets={setTickets} userMode={userMode} setUserMode={toggleMode} />} />
      <Route path="/Fulfillments" element={<Fulfillments items={items} tickets={tickets}  userMode={userMode} setUserMode={toggleMode} />} />
      <Route path="/Wishlist" element={<Wishlist items={items} tickets={tickets}  userMode={userMode} setUserMode={toggleMode} />} />
      <Route path="/Create" element={<Create items={items} setItems={setItems}  tickets={tickets} setTickets={setTickets}  userMode={userMode} setUserMode={toggleMode}/>} />
    </Routes>
  )
}

export default App
