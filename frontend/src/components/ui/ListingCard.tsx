import { Button, Card, Image, Text } from "@chakra-ui/react"
import {Item} from "../../types/interfaces";

const ListingCard = (props: Item) => {
  return (
    <Card.Root maxW="sm" overflow="hidden">
      <Image
        src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
        alt="Green double couch with wooden legs"
      />
      <Card.Body gap="2">
        <Card.Title>{props.item_name}</Card.Title>
        <Text textStyle="2xl" fontWeight="medium" letterSpacing="tight" mt="2">
          {props.price_us-props.price_src}
        </Text>
      </Card.Body>
      <Card.Footer gap="2">
        <Button variant="solid">Fufill</Button>
      </Card.Footer>
    </Card.Root>
  )
}

export default ListingCard;