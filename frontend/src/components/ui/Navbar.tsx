import { Flex, Box, Button } from '@chakra-ui/react';
import { ChangeEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { colors } from "../../assets/colors";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { FormControlLabel, Switch, Tooltip } from '@mui/material';
import { UserMode } from "../../types/interfaces";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export const Navbar = (props: { userMode: UserMode, setUserMode: () => void }) => {

    return (
        <Flex
            as="nav"
            align="center"
            justify="space-between"
            p={4}
            bg={props.userMode == UserMode.Fulfiller ? colors.red1 : colors.green1}
            color="white"
            position="fixed"
            top={0}
            left={0}
            width="100%"
            zIndex={1000} // Ensures it stays above other content
            marginBottom={0} // Ensures no bottom margin
        >
            {/* Logo */}
            <Box>
                <Link to="/" style={{ color: colors.red4 }}>
                    tarrifins
                </Link>
            </Box>

            {/* Buttons */}
            <Box display="flex" flexDirection="row" alignItems="center" gap={4}>
                {(props.userMode == UserMode.Fulfiller) && (
                    <>
                        <Tooltip title="Find Items">
                            <Link to="/Browse" style={{ color: 'inherit' }}>
                                <TravelExploreIcon />
                            </Link>
                        </Tooltip>
                        <Tooltip title="My Fulfillments">
                            <Link to="/Fulfillments" style={{ color: 'inherit' }}>
                                <LocalShippingIcon />
                            </Link>
                        </Tooltip>
                    </>
                )}
                <FormControlLabel
                    control={
                        <Switch
                            checked={props.userMode == UserMode.Buyer}
                            onChange={props.setUserMode}
                            sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: "white", // Default color when unswitched
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    backgroundColor: UserMode.Fulfiller ? colors.red2: colors.green1,
                                },
                                '& .MuiSwitch-switchBase': {
                                    color: "white", // Default color when unswitched
                                },
                                '& .MuiSwitch-switchBase + .MuiSwitch-track': {
                                    backgroundColor: "white", // Default background color when unswitched
                                },
                            }}
                        />
                    }
                    label={props.userMode == UserMode.Buyer ? "Fulfill" : "Buy"}
                    labelPlacement={"start"}
                />
                <AccountCircleIcon sx={{ color: colors.bg }}/>
                {/* <Button
                    variant="outline"
                    _hover={{ bg: UserMode.Fulfiller ? colors.red2: colors.green2, color: 'white', boxShadow: 'none' }}
                    colorPalette={UserMode.Fulfiller ? colors.red2: colors.green1}
                    transition="background-color 0.4s ease, color 0.4s ease"
                >
                    Sign In
                </Button>
                <Button
                    variant="solid"
                    _hover={{ bg: UserMode.Fulfiller ? colors.red3: colors.green1, color: 'white', boxShadow: 'none' }}
                    colorPalette={UserMode.Fulfiller ? colors.red3: colors.green1}
                    transition="background-color 0.4s ease, color 0.4s ease"
                    onClick={() => window.location.href = '/Signup'}
                >
                    Sign Up
                </Button> */}
            </Box>
        </Flex>
    );
};

export default Navbar;