import React, { useState } from 'react';
import { TextField, Button, Box, Typography, FormControlLabel, Switch, Tooltip } from '@mui/material';
import { colors } from "../assets/colors";
import { Flex, Image} from '@chakra-ui/react';
import { UserMode } from '../types/interfaces';
import { Link } from 'react-router-dom';

const Signup = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        alert('Sign up successful!');
    };

    return (
        
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                padding: 2,
            }}
        >
             <Flex
            as="nav"
            align="center"
            justify="space-between"
            p={4}
            bg={colors.green1}
            color="white"
            position="fixed"
            top={0}
            left={0}
            width="100%"
            zIndex={1000} // Ensures it stays above other content
        >
            {/* Logo */}

              
            <Box display="flex" flexDirection="row" alignItems="center">
                <Box marginRight={2}>
                        <Image src="SilkLogo.svg" height="40px" />
                </Box>
 
            </Box>


        </Flex>
        
            <Typography variant="h4" color={colors.green1} mb={2}>
                Sign Up
            </Typography>
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    width: '100%',
                    maxWidth: 600,
                }}
            >
                <TextField
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    required
                    sx={{ backgroundColor: 'transparent' 
                    }}
                />
                <TextField
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    fullWidth
                    required
                />
                <TextField
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    fullWidth
                    required
                />
        <Button
            color="primary"
            variant="contained"
            sx={{
            backgroundColor: colors.green1,
            '&:hover': { backgroundColor: colors.green2, color: colors.bg },
            transition: 'background-color 0.4s',
            }}
            onClick={() => {
            window.location.href = '/Wishlist';
            }}
        >
            Sign Up
        </Button>
            </Box>
        </Box>
    );
};

export default Signup;