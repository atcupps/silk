import Navbar from '../components/ui/Navbar';
import ListingCard from '../components/ui/ListingCard';
import { colors } from "../assets/colors";
import {Ticket, Item, User, SharedProps} from "../types/interfaces";
import { supabase } from "../App.tsx";
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useState } from 'react';

const Browse = (props: SharedProps) =>{
      /* grab the list of ticket items and filter by country, and if they are 
  unfufilled (fufiller id is null) */ 

  const [country, setCountry] = useState<string>('China'); // default value

  const handleCountryChange = (event: SelectChangeEvent) => {
    setCountry(event.target.value as string);
  };

  const openTickets: Ticket[] = props.tickets;

  const itemsList: Item[] = props.items;
  
  //hardcoded for now, allow user to choose with filter later
  const startDate = new Date("2025-03-20")
  const endDate = new Date("2025-05-30")
  
  // get ticket siwth null fulfiller_id and date in range
  const relevantTicketItemIds = openTickets
    .filter(ticket => (
      ticket.fulfiller_id === null &&
      new Date(ticket.need_by) >= startDate &&
     new Date(ticket.need_by) <= endDate
    ))
    .map(ticket => ticket.item_id)
  
  const relevantItems =  props.tickets
    .filter(ticket => ticket.fulfiller_id === null)
    .map(ticket => ticket.item_id)
    .map(itemId => props.items.find(item => item.item_id === itemId)) as Item[];
  
  const uniqueCountries = Array.from(new Set(relevantItems.map(item => item.src_country)));

  // convert item_ids to a Set for fast lookup
  const itemIdSet = new Set(relevantTicketItemIds)
  
  // filter items so that are relevant and from specified countries
  const filteredItems = itemsList.filter(item =>
    itemIdSet.has(item.item_id) &&
    item.src_country === country
  )

  console.log(relevantTicketItemIds)

    return (
        <>
            <Navbar />
            <h1>Browse</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {filteredItems.map((item) => (
                <ListingCard key={item.item_id} item={item} tickets={props.tickets} setTickets={props.setTickets} />
            ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="country-select-label">Country</InputLabel>
              <Select
                labelId="country-select-label"
                value={country}
                label="Country"
                onChange={handleCountryChange}
              >
                {uniqueCountries.map(countryName => (
                  <MenuItem key={countryName} value={countryName}>
                    {countryName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </>
    );
}
export default Browse;
