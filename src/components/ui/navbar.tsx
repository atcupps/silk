import { Flex, Box, Button } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { colors } from "../../assets/colors";

export const Navbar = () => {
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
                TheSilkRoad
                </Link>
            </Box>

            {/* Buttons */}
            <Box>
                <Button
                    variant="outline"
                    mr={4}
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