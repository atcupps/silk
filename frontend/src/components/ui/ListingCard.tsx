import { Button, Card, Image, Text } from "@chakra-ui/react"
import {Item, Ticket} from "../../types/interfaces";
import { supabase } from "../../App.tsx";
import { colors } from "../../assets/colors";

const ListingCard = (props: {item:Item,
  tickets:Ticket[],
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>
}) => {
  return (
    <Card.Root maxW="sm" overflow="hidden" variant="subtle" border="none" shadow="none">
      <Image
      src={props.item.image_link}
      />
      <Card.Body gap="2" bg={colors.red2} border="none">
      <Card.Title>{props.item.item_name}</Card.Title>
      <Text textStyle="2l" fontWeight="medium" letterSpacing="tight" mt="2">
        ${(props.item.price_us - props.item.price_src).toFixed(2)} earned
      </Text>
      <Text textStyle="2l" fontWeight="medium" letterSpacing="tight" mt="2">
        {new Date(props.tickets.find(ticket =>
          ticket.item_id === props.item.item_id
        )?.need_by || '').toLocaleDateString()}
      </Text>
      </Card.Body>
      <Card.Footer gap="2" bg={colors.red2} border="none">
      <Button
        variant="solid"
        onClick={async () => {
        const updatedTicketId = props.tickets.find(ticket =>
          ticket.item_id === props.item.item_id
        );
        if (updatedTicketId) {
          const { data, error } = await supabase
          .from('tickets')
          .update({ fulfiller_id: 2 }) // TODO update this hardcoded variable to actual
          .eq('item_id', updatedTicketId.item_id)
          .select();

          if (error) {
          console.error('Update failed:', error.message);
          } else {
          console.log('Updated ticket(s):', data);
          }
        }
        }}
      >
        Fulfill
      </Button>
      </Card.Footer>
    </Card.Root>
  )
}

export default ListingCard;