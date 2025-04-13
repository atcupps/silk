import { Badge, Box, Button, Card, HStack, Image, Text } from "@chakra-ui/react"
import {Item, Ticket} from "../../types/interfaces";
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
      src={props.item.image_link}
    />
    <Box>
      <Card.Body bg={colors.green1}>
        <Card.Title mb="2" >{props.item.item_name}</Card.Title>
        <Card.Description mr="2" pr="4" maxWidth={165} >
          <a 
            href={props.item.link} 
             target="_blank" 
             rel="noreferrer"
            style={{ 
              color: "inherit", 
              textDecoration: "none", 
              transition: "text-decoration 0.2s ease-in-out" 
            }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
          >
Item Link
          </a>
        </Card.Description>
        <HStack mt="4" wrap="wrap" maxWidth={165}>
          <Badge
            bg={colors.green2}
            _hover={{
              transform: "scale(1.1)",
              transition: "transform 0.2s ease-in-out",
            }}
          >
            <b>${(props.item.price_us - props.item.price_src).toFixed(2)}</b> saved
          </Badge>
          <Badge
            bg={colors.green2}
            _hover={{
              transform: "scale(1.1)",
              transition: "transform 0.2s ease-in-out",
            }}
          >
            {new Date(
              props.tickets.find((ticket) => ticket.item_id === props.item.item_id)
            ?.need_by || ""
            ).toLocaleDateString()}
          </Badge>
          <Badge
            bg={
              props.tickets.find((ticket) => ticket.item_id === props.item.item_id)
            ?.fulfiller_id != null
            ? colors.green2
            : colors.red2
            }
            _hover={{
              transform: "scale(1.1)",
              transition: "transform 0.2s ease-in-out",
            }}
          >
            {props.tickets.find((ticket) => ticket.item_id === props.item.item_id)
              ?.fulfiller_id != null
              ? "Fulfilled on " +
            new Date(props.item.timestamp).toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
            })
              : "Unfulfilled"}
          </Badge>
          <Badge
            bg={colors.green2}
            _hover={{
              transform: "scale(1.1)",
              transition: "transform 0.2s ease-in-out",
            }}
          >
            <div
              key={`icon-${props.item.src_country}`}
              className="flex items-center gap-1"
            >
              {countryNameToCode[props.item.src_country] ? (
            <span
              className={`fi fi-${countryNameToCode[props.item.src_country]}`}
            ></span>
              ) : (
            "❓"
              )}
            </div>
          </Badge>
        </HStack>
      </Card.Body>
    <Card.Footer bg={colors.green1}>
      {props.tickets.find(ticket =>
        ticket.item_id === props.item.item_id
      )?.fulfiller_id != null && (
        <Button
        bg={colors.bg}
        pt="1"
        pb="1"
        pr="3"
        pl="3"
        color={colors.green1}
        _hover={{ bg: colors.green2, color: colors.bg }}
        transition="background-color 0.4s"
        >
        Track
        </Button>
      )}
    </Card.Footer>
    </Box>
  </Card.Root>
  </>
  )
}

export default WishlistCard;