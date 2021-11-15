import './App.css';

import { ethers } from 'ethers';
import { Web3ReactProvider } from '@web3-react/core'
import Album from './components/Album.js';

function getLibrary(provider, connector) {
  return new ethers.provider.Web3Provider(provider);
}

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Album/>
    </Web3ReactProvider>
  );
}

export default App;
