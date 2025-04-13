import Navbar from '../components/ui/Navbar';
import ListingCard from '../components/ui/ListingCard';
import { colors } from "../assets/colors";
import {Ticket, Item, User, SharedProps, UserMode} from "../types/interfaces";
import { supabase } from "../App.tsx";
import { Box } from '@mui/material';
import WishlistCard from "../components/ui/WishlistCard.tsx"
import { ChangeEvent } from 'react';
import { useEffect } from 'react';

const Wishlist = (props:  {items:Item[],
  tickets:Ticket[],userMode: UserMode, 
  setUserMode:  () => void
}) =>{
      /* grab the list of ticket items and filter by country, and if they are 
  unfufilled (fufiller id is null) */ 

  const allTickets: Ticket[] = props.tickets;

  const itemsList: Item[] = props.items;
  
  const relevantTicketItemIds =  allTickets.filter(ticket => (
      ticket.buyer_id === 1 // TODO remove the hardcode
    ))
    .map(ticket => ticket.item_id);
  
  const relevantItems =  relevantTicketItemIds
    .map(itemId => props.items.find(item => item.item_id === itemId))
    .filter((item): item is Item => item !== undefined && item !== null);

    return (
        <>
            <Navbar userMode={props.userMode} setUserMode={props.setUserMode} />
            <Box 
          display="flex" 
          flexDirection="column"  
          alignItems="flex-start"
          justifyContent="flex-start"
          width="100%" 
          mb={2}
          mt={6} 
            >
          <h1 style={{ color:colors.green1 }}>Your Wishlist</h1>
            </Box>
            

            <Box sx={{      
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",  
        }}>
              {relevantItems.map((item) => (
          <WishlistCard key={item.item_id} item={item} tickets={props.tickets} />
              ))}
            </Box>
        </>
    );
}
export default Wishlist;
