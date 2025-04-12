import Navbar from '../components/ui/Navbar';
import ListingCard from '../components/ui/ListingCard';
import { colors } from "../assets/colors";
import {Ticket, Item, User, SharedProps} from "../types/interfaces";
import { supabase } from "../App.tsx";
import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { countryNameToCode } from "../assets/CountryNameToCode"

const Browse = (props: SharedProps) =>{
      /* grab the list of ticket items and filter by country, and if they are 
  unfufilled (fufiller id is null) */ 

  const [country, setCountry] = useState<string>('China'); // default value

  const handleCountryChange = (event: SelectChangeEvent) => {
    setCountry(event.target.value as string);
  };

  const openTickets: Ticket[] = props.tickets;

  const itemsList: Item[] = props.items;
  

  const [startDate, setStartDate] = useState<Dayjs | null>(null); 
  const [endDate, setEndDate] = useState<Dayjs | null>(null); 

  
  // get ticket siwth null fulfiller_id and date in range
  const relevantTicketItemIds = (startDate!=null  && endDate !=null) ? openTickets
    .filter(ticket => (
      ticket.fulfiller_id === null &&
      dayjs(ticket.need_by).isAfter(dayjs(startDate)) &&
      dayjs(ticket.need_by).isBefore(dayjs(endDate))
    ))
    .map(ticket => ticket.item_id) : openTickets.filter(ticket=>(ticket.fulfiller_id===null)).map(ticket => ticket.item_id);
  
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
// Sort the filtered items by the need_by date in the tickets list
const sortedFilteredItems = filteredItems.sort((a, b) => {
    const ticketA = openTickets.find(ticket => ticket.item_id === a.item_id);
    const ticketB = openTickets.find(ticket => ticket.item_id === b.item_id);

    if (ticketA && ticketB) {
        return dayjs(ticketA.need_by).diff(dayjs(ticketB.need_by));
    }
    return 0;
});
    return (
        <Box  display="block" width="100%">
            <Navbar />
            <Box 
                display="flex" 
                flexDirection="row" 
                justifyContent="space-between" 
                alignItems="center"
                mb={4}
                mt={10}
            >
                <h1 style={{ color: "#280003" }}>Browse</h1>
                <Box display="flex" gap={2} alignItems="center">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                            label="Arrival"
                            views={['year', 'month', 'day']}
                            sx={{ maxWidth: 150 }}
                            value={startDate}
                            onChange={(newDate) => setStartDate(newDate)}
                        />
                        <DateTimePicker
                            label="Departure"
                            views={['year', 'month', 'day']}
                            sx={{ maxWidth: 150 }}
                            value={endDate}
                            onChange={(newDate) => setEndDate(newDate)}
                        />
                    </LocalizationProvider>

                    <FormControl sx={{ maxWidth: 150 }}>
                        <InputLabel id="country-select-label">Country</InputLabel>
                        <Select
                            labelId="country-select-label"
                            value={country}
                            label="Country"
                            onChange={handleCountryChange}
                        >
                            {uniqueCountries.map(countryName => (
                                <MenuItem key={countryName} value={countryName}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {countryNameToCode[countryName] ? <span className={`fi fi-${countryNameToCode[countryName]}`}></span> : '❓'}
                                        <span>{countryName}</span>
                                    </div>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            <Box sx={{      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "16px",  }}>
                {sortedFilteredItems.map((item) => (
                    <ListingCard key={item.item_id} item={item} tickets={props.tickets} setTickets={props.setTickets} />
                ))}
                </Box>
        </Box>
    );
}
export default Browse;
