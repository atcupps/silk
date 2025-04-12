import Navbar from '../components/ui/Navbar';
import ListingCard from '../components/ui/ListingCard';
import { colors } from "../assets/colors";
import {Ticket, Item, User, SharedProps} from "../types/interfaces";
import { supabase } from "../App.tsx";

const Browse = (props: SharedProps) =>{
      /* grab the list of ticket items and filter by country, and if they are 
  unfufilled (fufiller id is null) */ 

  const openTickets: Ticket[] = props.tickets;

  const itemsList: Item[] = props.items;

  console.log(openTickets)
  console.log(itemsList)
  
  //hardcoded for now, allow user to choose with filter later
  const startDate = new Date("2025-03-20")
  const endDate = new Date("2025-04-20")
  const countryFilter = "China" 
  
  // get ticket siwth null fulfiller_id and date in range
  const relevantTicketItemIds = openTickets
    .filter(ticket => (
      ticket.fulfiller_id === null &&
      ticket.need_by >= startDate &&
      ticket.need_by <= endDate
    ))
    .map(ticket => ticket.item_id)
  
  // convert item_ids to a Set for fast lookup
  const itemIdSet = new Set(relevantTicketItemIds)
  
  // filter items so that are relevant and from specified countries
  const filteredItems = itemsList.filter(item =>
    itemIdSet.has(item.item_id) &&
    item.src_country === countryFilter
  )


async function testSupabaseConnection() {
    const { data, error } = await supabase.from('users').insert([{ user_id: 12, address: '456 Cypress Rd, Austin, TX' }]).select();
    if (error) {
      console.error('Error inserting data:', error);
    } else {
      console.log('Inserted data:', data);
    }
  }
    return (
        <>
            <Navbar />
            <h1>Browse</h1>
            <button onClick={testSupabaseConnection}>Test Supabase Connection</button>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {filteredItems.map((item) => (
                <ListingCard key={item.item_id} {...item} />
            ))}
            </div>
        </>
    );
}
export default Browse;
