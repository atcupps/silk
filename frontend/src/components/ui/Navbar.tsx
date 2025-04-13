import { Flex, Box, Button } from '@chakra-ui/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { colors } from "../../assets/colors";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { FormControlLabel, Switch, Tooltip } from '@mui/material';

export const Navbar = () => {

    const [checked, setChecked] = useState(true);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setChecked(event.target.checked);
    };

    return (
        <Flex
            as="nav"
            align="center"
            justify="space-between"
            p={4}
            bg={colors.red1}
            color="white"
            position="fixed"
            top={0}
            left={0}
            width="100%"
            zIndex={1000} // Ensures it stays above other content
        >
            {/* Logo */}
            <Box>
                <Link to="/" style={{ color: colors.red4 }}>
                    tarrifins
                </Link>
            </Box>

            {/* Buttons */}
            <Box display="flex" flexDirection="row" alignItems="center" gap={4}>
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
    <FormControlLabel
        control={
            <Switch
                checked={checked}
                onChange={handleChange}
                sx={{
                     '& .MuiSwitch-switchBase.Mui-checked': {
                        color: "white", // Default color when unswitched
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: colors.red2,
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
        label="Buy"
    />
                <Button
                    variant="outline"
                    _hover={{ bg: colors.red2, color: 'white', boxShadow: 'none' }}
                    colorPalette={colors.red2}
                    transition="background-color 0.4s ease, color 0.4s ease"
                >
                    Sign In
                </Button>
                <Button
                    variant="solid"
                    _hover={{ bg: colors.red3, color: 'white', boxShadow: 'none' }}
                    colorPalette={colors.red3}
                    transition="background-color 0.4s ease, color 0.4s ease"
                >
                    Sign Up
                </Button>
            </Box>
        </Flex>
    );
};

export default Navbar;