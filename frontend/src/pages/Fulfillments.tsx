import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { countryNameToCode } from "../assets/CountryNameToCode"
import "/node_modules/flag-icons/css/flag-icons.min.css";
import { Item, Ticket, UserMode } from "../types/interfaces"
import Navbar from '../components/ui/Navbar';
import { Divider, IconButton, ListItemAvatar, Radio, Toolbar, Tooltip } from '@mui/material';
import { ChangeEvent, useState } from 'react';
import CancelIcon from '@mui/icons-material/Cancel';
import { colors } from "../assets/colors";
import { supabase } from "../App.tsx";

const Fulfillments = (props: {items:Item[],
  tickets:Ticket[],userMode: UserMode, 
  setUserMode:  () => void}) => {
  const my_id = 2;
  // get list of countries by finding tickets assigned to us, then finding 
  // the items with matching item ids, then find their country
  const alltickets: Ticket[] = props.tickets ?? [];
  const itemsList: Item[] = props.items ?? [];
  const relevantItems = alltickets
    .filter(ticket => ticket.fulfiller_id === my_id)
    .map(ticket => ticket.item_id)
    .map(itemId => itemsList.find(item => item.item_id === itemId)) as Item[];

  const uniqueCountries = Array.from(new Set(relevantItems.map(item => item.src_country)));
  const drawerWidth = 240;

  const [selectedCountry, setSelectedCountry] = useState(uniqueCountries.length > 0 ? uniqueCountries[0]:"");

  const relevantItemsFromCountry =  relevantItems
  .filter(item => item.src_country===selectedCountry) as Item[];
  
  const [checkedItems, setCheckedItems] = useState<{ [key: number]: boolean }>({});

  const handleToggle = (itemId: number) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };
  
  return (
    <>
    <Box position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1,  }}>
      <Navbar userMode={props.userMode} setUserMode={props.setUserMode}/>
      </Box>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'hidden' }}>
            <List sx={{ backgroundColor: colors.red2, height: '100vh' }}>
            <ListItem 
              sx={{ 
              backgroundColor: colors.red2, 
              color: colors.bg, 
              padding: "16px", 
              '& .MuiListItemText-primary': {
              fontSize: "1.5rem", 
              fontWeight: "bold"
              }
              }}
            >
              <ListItemText 
              primary={"Fulfillments"} 
              />
            </ListItem>
            {uniqueCountries.map((country) => (
              <ListItem 
                      key={`list-item-${country}`} 
                      disablePadding 
                      sx={{
                      backgroundColor: country === selectedCountry ? colors.red3 : colors.red2,  
                      color: colors.bg,  
                      transition: 'background-color 0.3s ease', // Added hover transition
                      '&:hover': {
                        backgroundColor: colors.red1,
                      }
                      }}
                      >
                      <ListItemButton onClick={() => setSelectedCountry(country)}>
                      <ListItemIcon>
                        <div key={`icon-${country}`} className="flex items-center gap-1">
                        {countryNameToCode[country] ? <span className={`fi fi-${countryNameToCode[country]}`}></span> : '❓'}
                        </div>
                      </ListItemIcon>
                      <ListItemText primary={country} />
                      </ListItemButton>
                        </ListItem>
              ))}</List>
          </Box>
        </Drawer>
  
        <Box sx={{width: '100%'}}>
                     <List sx={{ width: '900px',  marginLeft: "240px", padding: 1 }}>
                     {relevantItemsFromCountry.map((item) => (
                    <ListItem
                      key={item.item_id}
                      sx={{ 
                      width: '100%', 
                      margin: '10px auto', 
                      bgcolor: colors.red3, 
                      borderRadius: '20px', 
                      padding: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      }}
                    >
                      <ListItemAvatar>
                        <Radio
                        checked={checkedItems[item.item_id] || false}
                        onClick={() => handleToggle(item.item_id)}
                        sx={{
                          '& .MuiSvgIcon-root': {
                          fontSize: 25,
                          color: colors.bg,
                          },
                        }}
                        />
                      </ListItemAvatar>
                        <ListItemText 
                        primary={
                          <>
                            {item.item_name} 
                            <span style={{ marginLeft:"10px", color: colors.red1 }}>
                              ${(item.price_us - item.price_src).toFixed(2)} to be earned
                            </span>
                          </>
                        } 
                        secondary={
                        <a 
                          href={item.link} 
                          style={{ 
                          color: 'inherit', 
                          textDecoration: 'none', 
                          transition: 'text-decoration 0.3s ease' 
                          }} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                        >
                       Item Link
                        </a>
                        }
                        />
                      <Box sx={{ display:"flex", flexDirection:"row", marginLeft: "auto", color: colors.red1, alignItems:"center" }}>
                      {new Date(props.tickets.find(ticket =>
                        ticket.item_id === item.item_id
                      )?.need_by || '').toLocaleDateString()}
                        <Tooltip title="Cancel Fulfillment" placement="top">
                        <IconButton sx={{ color: colors.bg, marginLeft:"5px" }}
                         onClick={async () => {
                          const updatedTicketId = props.tickets.find(ticket =>
                            ticket.item_id === item.item_id
                          );
                          if (updatedTicketId) {
                            const { data, error } = await supabase
                            .from('tickets')
                            .update({ fulfiller_id: null })
                            .eq('item_id', updatedTicketId.item_id)
                            .select();
                  
                            if (error) {
                            console.error('Update failed:', error.message);
                            } else {
                            console.log('Updated ticket(s):', data);
                            }
                          }}}>
                          <CancelIcon />
                        </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItem>
                     ))}
                     </List>
                     {relevantItemsFromCountry.length === 0 && (
                     <Box 
                       sx={{ 
                       textAlign: 'center', 
                       marginLeft: "240px",
                       fontSize: '1.2rem', 
                       color: colors.red1 
                       }}
                     >
                       You do not have any items to fulfill.
                     </Box>
                     )}
  </Box>
    </>
  );
};

export default Fulfillments;