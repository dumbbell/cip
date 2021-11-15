import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import LocationCity from '@mui/icons-material/LocationCity';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { useState, useEffect } from 'react';
import ClubImmoPrivilege from '../artifacts/contracts/ClubImmoPrivilege.sol/ClubImmoPrivilege.json'

const clubImmoAddress = "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f"; // Localhost
//const clubImmoAddress = "0x6c6C4007bc6c5ebb48ceB1E95bA5aCf521274867"; // Ropsten

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Jean-Sébastien Pédron
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const theme = createTheme();

export default function Album() {
  const web3React = useWeb3React();
  const [studentAddress, setStudentAddress] = useState();
  const [privileges, setPrivilegesList] = useState([]);

  // request access to the user's MetaMask account
  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  async function grantPrivileges() {
    if (!studentAddress) return;

    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(clubImmoAddress, ClubImmoPrivilege.abi, signer);

      const thisPage = new URL(window.location.href);
      const basePath = 'privileges/';
      const paths = [
        'creation-sci.json',
        'creation-holding.json',
        'coaching.json',
        'workshop.json',
      ];
      const URIs = [];
      for (var path of paths) {
        var url = new URL(basePath + path, thisPage);
        console.log(url.href);
        URIs.push(url.href);
      }

      const address = ethers.utils.getAddress(studentAddress);
      const transaction = await contract.grantPrivileges(address, URIs);
      await transaction.wait();
      fetchPrivileges();
    }
  }

  async function fetchPrivileges() {
    await web3React.activate();

    if (typeof window.ethereum !== 'undefined') {
      const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        clubImmoAddress, ClubImmoPrivilege.abi, provider);

      try {
        const balance = await contract.balanceOf(account);
        console.log('Privileges count:', balance.toString())

        let array = [];
        for (var i = 0; i < balance; i++) {
          const privilegeId = await contract.tokenOfOwnerByIndex(account, i);
          const privilegeUri = await contract.tokenURI(privilegeId);
          console.log('Privilege URI:', privilegeUri);

          const response = await fetch(privilegeUri);
          const json = await response.json();
          json.id = privilegeId;
          console.log('Privilege JSON:', json);
          array.push(json);
        }
        console.log('Privileges: ', array)
        setPrivilegesList(array);
      } catch (err) {
        console.log("Error:", err)
      }
    }
  }

  useEffect(() => {
    async function updatePrivileges() {
      await fetchPrivileges();
    }
    updatePrivileges()
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="relative">
        <Toolbar>
          <LocationCity sx={{ mr: 2 }} />
          <Typography variant="h6" color="inherit" noWrap>
            Mes privilèges Club Immobilier
          </Typography>
        </Toolbar>
      </AppBar>
      <main>
        {/* Hero unit */}
        <Box
          sx={{
            bgcolor: 'background.paper',
            pt: 8,
            pb: 6,
          }}
        >
          <Container maxWidth="sm">
            <Typography
              component="h1"
              variant="h2"
              align="center"
              color="text.primary"
              gutterBottom
            >
              Mes privilèges Club&nbsp;Immobilier
            </Typography>
            <Typography variant="h5" align="center" color="text.secondary" paragraph>
              Voici la liste des privilèges Club Immobilier en votre
              possession. Libre à vous de vous en servir ou de les échanger
              avec les autres élèves Club Immobilier grâce à la <em>blockchain
              Ethereum</em>.
            </Typography>
            <Stack
              sx={{ pt: 4 }}
              direction="row"
              spacing={2}
              justifyContent="center"
            >
              <Button
                align="center"
                onClick={fetchPrivileges}
              >
                Récupérer mes privilèges
              </Button>
            </Stack>
          </Container>
        </Box>
        <Container sx={{ py: 8 }} maxWidth="md">
          {/* End hero unit */}
          <Grid container spacing={4}>
            {privileges.map((privilege) => (
              <Grid item key={privilege.id} xs={12} sm={6} md={4}>
                <Card
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <CardMedia
                    component="img"
                    image={process.env.PUBLIC_URL + privilege.image}
                    alt={privilege.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {privilege.name}
                    </Typography>
                    <Typography>
                      {privilege.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small">Transférer</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </main>
      {/* Footer */}
      <Box sx={{ bgcolor: 'background.paper', p: 6 }} component="footer">
        <Typography variant="h6" align="center" gutterBottom>
          Mes privilèges Club Immobilier
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          component="p"
        >
          Un outil qu'il est bien pour s'initier à la blockchain !
        </Typography>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
        >
          <TextField
            required
            id="standard-required"
            label="Adresse Ethereum de l'étudiant"
            defaultValue=""
            variant="standard"
            onChange={e => setStudentAddress(e.target.value)}
          />
          <Button
            align="center"
            onClick={grantPrivileges}
          >
            Attribuer les privilèges
          </Button>
        </Stack>
        <Copyright />
      </Box>
      {/* End footer */}
    </ThemeProvider>
  );
}
