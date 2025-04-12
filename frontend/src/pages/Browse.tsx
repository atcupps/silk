import Navbar from '../components/ui/Navbar';
import ListingCard from '../components/ui/ListingCard';
import { colors } from "../assets/colors";
import {ticket, item} from "../types/interfaces";

  /* grab the list of ticket items and filter by country, and if they are 
  unfufilled (fufiller id is null) store in this var right now is dummy data */ 

  const openTickets: ticket[] = [{
    ticket_id: 0,
    fulfiller_id: null,
    item_id: 0,
    need_by: new Date(),
    buyer_id: 0,
},
{
    ticket_id: 1,
    fulfiller_id: null,
    item_id: 1,
    need_by: new Date(),
    buyer_id: 0,
},
{
    ticket_id: 2,
    fulfiller_id: null,
    item_id: 2,
    need_by: new Date(),
    buyer_id: 0,
},
{
    ticket_id: 3,
    fulfiller_id: null,
    item_id: 3,
    need_by: new Date(),
    buyer_id: 0,
}];

const itemsList: item[] = [{
    item_id: 0,
    item_name: "legos",
    src_country: "China",
    link: "",
    price_us: 300,
    price_src: 100,
    timestamp:  new Date(),
    image_link: "",
},
{
    item_id: 1,
    item_name: "prada purse",
    src_country: "Italy",
    link: "",
    price_us: 3500,
    price_src: 1900,
    timestamp:  new Date(),
    image_link: "",
},
{
    item_id: 2,
    item_name: "keyboard",
    src_country: "China",
    link: "",
    price_us: 900,
    price_src: 700,
    timestamp:  new Date(),
    image_link: "",
},
{
    item_id: 3,
    item_name: "airpods",
    src_country: "China",
    link: "",
    price_us: 300,
    price_src: 150,
    timestamp:  new Date(),
    image_link: "",
},]

//hardcoded for now, allow user to choose with filter later
const startDate = new Date("2025-04-9")
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

function Browse() {
    return (
        <>
            <Navbar />
            <h1>Browse</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {filteredItems.map((item) => (
                <ListingCard key={item.item_id} {...item} />
            ))}
            </div>
        </>
    );
}
export default Browse;
