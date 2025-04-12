import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import { countryNameToCode } from "../assets/CountryNameToCode"
import "/node_modules/flag-icons/css/flag-icons.min.css";
import { Item, SharedProps, Ticket } from "../types/interfaces"
import Navbar from '../components/ui/Navbar';
import { Divider, IconButton, ListItemAvatar, Radio, Toolbar } from '@mui/material';
import { useState } from 'react';
import CancelIcon from '@mui/icons-material/Cancel';

const Fulfillments = (props: SharedProps) => {
  const my_id = 1;
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

  const [selectedCountry, setSelectedCountry] = useState("");

  const relevantItemsFromCountry =  relevantItems
  .filter(item => item.src_country===selectedCountry) as Item[];
  
  return (
    <>
    <Box position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Navbar />
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
          <List>
            {uniqueCountries.map((country) => (
                <><ListItem key={`list-item-${country}`} disablePadding>
              <ListItemButton onClick={() => setSelectedCountry(country)}>
              <ListItemIcon>
                <div key={`icon-${country}`} className="flex items-center gap-1">
                {countryNameToCode[country] ? <span className={`fi fi-${countryNameToCode[country]}`}></span> : '❓'}
                </div>
              </ListItemIcon>
              <ListItemText primary={country} />
              </ListItemButton>
                </ListItem><Divider key={`divider-${country}`} /></>
            ))}</List>
        </Box>
                   </Drawer>

                   <Box sx={{width: '100%' }}>
                   <List sx={{ width: '100%', bgcolor: 'lightgray' }}>
                   {relevantItemsFromCountry.map((item)=>(
    
                    <ListItem
                      sx={{ width: '100%' }}
                      secondaryAction={<>
                        <IconButton edge="end" aria-label="delete">
                          <CancelIcon />
                        </IconButton>
                        </>
                      }
                    >
                      <ListItemAvatar>
                        <Radio
                          checked={true}
                          onChange={() => {}}
                        />
                      </ListItemAvatar>
                      <ListItemText primary={item.item_name} secondary={new Date(props.tickets.find(ticket =>
          ticket.item_id === item.item_id
        )?.need_by || '').toLocaleDateString()} />

                  
                    </ListItem>
                ))}
                                  </List>
  </Box>
    </>
  );
};

export default Fulfillments;