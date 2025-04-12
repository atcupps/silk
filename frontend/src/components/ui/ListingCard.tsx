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
      src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
      alt="Green double couch with wooden legs"
      />
      <Card.Body gap="2" bg={colors.red2} border="none">
      <Card.Title>{props.item.item_name}</Card.Title>
      <Text textStyle="2l" fontWeight="medium" letterSpacing="tight" mt="2">
        {props.item.price_us - props.item.price_src}
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
          .update({ fulfiller_id: 1 }) // TODO update this hardcoded variable to actual
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