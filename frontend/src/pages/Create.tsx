import Navbar from '../components/ui/Navbar';
import { Box, Typography } from '@mui/material';
import { useState } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import { countryNameToCode } from '../assets/CountryNameToCode';
import { Ticket, Item, UserMode } from '../types/interfaces';
import { useParams } from 'react-router-dom';
import { supabase } from '../App';
import { useNavigate } from 'react-router-dom';
import { colors } from "../assets/colors";
import {Card, Image, Button, Badge, HStack} from "@chakra-ui/react"

const Create = (props: {
  items: Item[],
  setItems: React.Dispatch<React.SetStateAction<Item[]>>,
  tickets: Ticket[],
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>,
  userMode: UserMode,
  setUserMode: () => void
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
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      <Navbar userMode={props.userMode} setUserMode={props.setUserMode} />

      <Box
        flex="1"
        overflow="hidden"
        display="flex"
        justifyContent="flex-start"
        alignItems="flex-start"
        px={{ xs: 2, md: 8 }}
        py={6}
        boxSizing="border-box"
      >
        <Box width="100%" maxWidth="1200px" mt={4}>
          <Box display="flex" flexDirection="column" alignItems="flex-start" gap={4}>
            <h1 style={{ color: colors.green1 }}>Create Listing</h1>

            <Card.Root flexDirection="row" maxW="1200px" overflow="hidden" variant="subtle" border="none" shadow="none" style={{ flexGrow: 1 }}>
              <Image
                src={item.image_link}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/300x200?text=No+Image';
                }}
                  objectFit="cover"
      maxW="500px"
              />
              <Box display="flex" flexDirection="column">
              <Card.Body gap="2" bg={colors.green2} border="none">
                <Card.Title fontSize="2xl" color={colors.green1}>{item.item_name}</Card.Title>
                <HStack mt="4" wrap="wrap" maxWidth={1000} gap={8}>
                  <Badge
                    bg={colors.green1}
                    fontSize="xl"
                    p={4}
                    _hover={{
                      transform: "scale(1.1)",
                      transition: "transform 0.2s ease-in-out",
                    }}
                  >     <Typography>
                   Country of Fulfillment:
                    {countryCode ? (
                      <span className={`fi fi-${countryCode}`} style={{ marginLeft: '8px' }}></span>
                    ) : (
                      'N/A'
                    )}
                       </Typography>
                  </Badge>
                  <Badge
                    bg={colors.green1}
                    fontSize="xl"
                    p={4}
                    _hover={{
                      transform: "scale(1.1)",
                      transition: "transform 0.2s ease-in-out",
                    }}
                  >
                      <Typography>
                      <span className={`fi fi-us`} style={{ marginRight: '8px' }}></span>
                       </Typography>  <Typography>
                US Price: ${item.price_us.toFixed(2)}
                    </Typography>
                    </Badge>
                  <Badge
                    bg={colors.green1}
                    fontSize="xl"
                    p={4}
                    _hover={{
                      transform: "scale(1.1)",
                      transition: "transform 0.2s ease-in-out",
                    }}
                  >
                      <Typography>
                    {countryCode ? (
                      <span className={`fi fi-${countryCode}`} style={{ marginRight: '8px' }}></span>
                    ) : (
                      'N/A'
                    )}
                       </Typography>

                    <Typography >
                {item.src_country} Price: ${item.price_src.toFixed(2)}
                    </Typography>
                    </Badge>
                  <Badge
                    bg={colors.green1}
                    fontSize="xl"
                    p={4}
                    _hover={{
                      transform: "scale(1.1)",
                      transition: "transform 0.2s ease-in-out",
                    }}
                  >
                    <Typography 
                      style={{ textDecoration: 'underline' }}
                    >
                 Price Difference: ${priceDiff.toFixed(2)}
                    </Typography>
                  </Badge>
                  <Badge
                    bg={colors.green1}
                    fontSize="xl"
                    p={4}
                    _hover={{
                      transform: "scale(1.1)",
                      transition: "transform 0.2s ease-in-out",
                    }}
                  >
                    <Typography>
                      <a 
                      href={item.link} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ textDecoration: 'none', color: 'inherit' }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                      >
                      Item Link
                      </a>
                    </Typography>
                  </Badge>
                </HStack>
        <Box mt={4} mb={4}> 
                    <Typography mb={1}><strong>Date of Fulfillment:</strong></Typography>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateTimePicker
                      views={['year', 'month', 'day']}
                      sx={{ maxWidth: 200, border: 'none', borderRadius: '4px', backgroundColor: colors.bg }}
                      value={fulfillDate}
                      onChange={(fulfillDate) => setFulfillDate(fulfillDate)}
                      />
                    </LocalizationProvider>
                  </Box>
 
            
              </Card.Body>
              <Card.Footer gap="2" bg={colors.green2} border="none" style={{ justifyContent: "center" }}>
                <Button
                 bg={colors.green1}
                 color={colors.bg}
                  onClick={handleCreateListing}
                  _hover={{ bg: colors.bg, color: colors.green1 }}
                  transition="background-color 0.3s"
                  >
                  Create Listing
                </Button>
              </Card.Footer>
              </Box>
            </Card.Root>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Create;
