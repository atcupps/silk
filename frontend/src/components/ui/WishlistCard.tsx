import { Badge, Box, Button, Card, HStack, Image, Text } from "@chakra-ui/react"
import {Item, Ticket} from "../../types/interfaces";
import { supabase } from "../../App.tsx";
import { colors } from "../../assets/colors";
import { countryNameToCode } from "../../assets/CountryNameToCode"

const WishlistCard = (props: {item:Item,
  tickets:Ticket[],
}) => {
  return (
<>
    <Card.Root flexDirection="row" overflow="hidden" maxW="xl" bg={colors.green1} border="none" shadow="none">
    <Image
      objectFit="cover"
      maxW="200px"
      src="https://images.unsplash.com/photo-1667489022797-ab608913feeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw5fHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=800&q=60"
    />
    <Box>
      <Card.Body bg={colors.green1}>
        <Card.Title mb="2" >{props.item.item_name}</Card.Title>
        <HStack mt="4" wrap="wrap" >
          <Badge bg={colors.green2}>  ${props.item.price_us - props.item.price_src} saved</Badge>
          <Badge bg={colors.green2}>  {new Date(props.tickets.find(ticket =>
          ticket.item_id === props.item.item_id
        )?.need_by || '').toLocaleDateString()}</Badge>
          <Badge bg={colors.green2}>      <div key={`icon-${props.item.src_country}`} className="flex items-center gap-1">
            {countryNameToCode[props.item.src_country] ? <span className={`fi fi-${countryNameToCode[props.item.src_country]}`}></span> : '❓'}
            </div> </Badge>
        </HStack>
      </Card.Body>
      <Card.Footer bg={colors.green1}>
        <Button bg={colors.bg}>Track</Button>
      </Card.Footer>
    </Box>
  </Card.Root>
  </>
  )
}

export default WishlistCard;