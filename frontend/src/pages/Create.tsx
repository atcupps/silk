import Navbar from '../components/ui/Navbar';
import { Box, Typography, Button } from '@mui/material';
import { ChangeEvent, useState } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { countryNameToCode } from '../assets/CountryNameToCode';
import { Ticket, Item, UserMode } from '../types/interfaces';
import { useParams } from 'react-router-dom';
import { supabase } from '../App';
import { useNavigate } from 'react-router-dom';

const Create = (props: {
  items: Item[],
  setItems: React.Dispatch<React.SetStateAction<Item[]>>,
  tickets: Ticket[],
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>,
  userMode: UserMode,
  setUserMode: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void
}) => {
  const { item_id, buyer_id } = useParams();
  const item = props.items.find(i => String(i.item_id) === item_id);
  const [fulfillDate, setFulfillDate] = useState<Dayjs | null>(null);
  const navigate = useNavigate();

  const handleCreateListing = async () => {
    if (!item_id || !buyer_id || !fulfillDate) {
      alert("Missing item, buyer, or date.");
      return;
    }
  
    const { error } = await supabase.from('tickets').insert([
      {
        item_id: parseInt(item_id),
        buyer_id: parseInt(buyer_id),
        fulfiller_id: null,
        need_by: fulfillDate.toISOString(),
      }
    ]);
  
    if (error) {
      console.error("Error creating ticket:", error.message);
      alert("Failed to create listing.");
    } else {
      navigate("/Wishlist");
    }
  };
  

  if (!item) {
    return (
      <Box p={4}>
        <Navbar userMode={props.userMode} setUserMode={props.setUserMode} />
        <Typography variant="h5" color="error">Item not found.</Typography>
      </Box>
    );
  }

  const priceDiff = item.price_us - item.price_src;
  const countryCode = countryNameToCode[item.src_country];

  return (
    <Box
      width="100%"
      height="100vh"
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      <Navbar userMode={props.userMode} setUserMode={props.setUserMode} />

      <Box
        flex="1"
        overflow="hidden"
        display="flex"
        justifyContent="center"
        alignItems="flex-start"
        px={{ xs: 2, md: 8 }}
        py={6}
        boxSizing="border-box"
      >
        <Box width="100%" maxWidth="1200px" mt={4}>
          <Box display="flex" flexDirection="column" alignItems="flex-start" gap={4}>
            <Typography
              variant="h4"
              fontWeight="bold"
              color="black"
              align="center"
              width="100%"
            >
              Create Listing
            </Typography>

            <Box display="flex" gap={4} flexWrap="wrap">
              <Box
                bgcolor="#f0f0f0"
                p={3}
                borderRadius={2}
                width="350px"
                display="flex"
                flexDirection="column"
                alignItems="center"
              >
                <Typography variant="h5" fontWeight="bold" color="black" mb={2}>
                  {item.item_name}
                </Typography>
                <img
                  src={item.image_link}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/300x200?text=No+Image';
                  }}
                  style={{ borderRadius: 8, width: '100%', objectFit: 'cover', maxHeight: 200 }}
                />
                {/* <Typography mt={2} color="black">
                  {item.item_name}
                </Typography> */}
              </Box>

              <Box display="flex" flexDirection="column" gap={2} color="black">
                <Typography>
                  <strong>Country of Fulfillment:</strong>{' '}
                  {countryCode ? (
                    <span className={`fi fi-${countryCode}`} style={{ marginLeft: '8px' }}></span>
                  ) : (
                    'N/A'
                  )}
                </Typography>

                <Typography>
                  <strong>Price Difference:</strong> ${priceDiff.toFixed(2)}
                </Typography>

                <Typography>
                  <strong>Link:</strong>{' '}
                  <a href={item.link} target="_blank" rel="noreferrer" style={{ color: '#2a6bff' }}>
                    click here!
                  </a>
                </Typography>

                <Box>
                  <Typography mb={1}><strong>Date of Fulfillment:</strong></Typography>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                      label="Arrival"
                      views={['year', 'month', 'day']}
                      sx={{ maxWidth: 200 }}
                      value={fulfillDate}
                      onChange={(fulfillDate) => setFulfillDate(fulfillDate)}
                    />
                  </LocalizationProvider>
                </Box>

                <Button
                  variant="contained"
                  onClick={handleCreateListing}
                  sx={{
                    width: 'fit-content',
                    mt: 2,
                    backgroundColor: '#1e2520',
                    color: 'white',
                    borderRadius: '20px',
                    px: 3,
                    py: 1,
                    fontWeight: 'bold',
                    boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
                    '&:hover': {
                      backgroundColor: '#2d3630',
                    },
                  }}
                >
                  CREATE LISTING
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Create;
