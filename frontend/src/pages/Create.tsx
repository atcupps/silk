import { ChangeEvent } from "react";
import {Ticket, Item, User, SharedProps, UserMode} from "../types/interfaces";

const Create = (props:  {items:Item[],setItems:  React.Dispatch<React.SetStateAction<Item[]>>
  tickets:Ticket[],userMode: UserMode, setTickets:  React.Dispatch<React.SetStateAction<Ticket[]>>
  setUserMode: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void
}) =>{
    return <h1>Welcome to the Create Page</h1>
  }
  export default Create
  