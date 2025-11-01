# BuyBlock - Decentralized Land Registry System

BuyBlock is a decentralized land registry system built on blockchain technology that allows for secure, transparent, and efficient management of land parcels. The system combines smart contracts, IPFS storage, and an interactive map interface to provide a comprehensive solution for land registration and management.

## Features

### 1. Interactive Map Interface

- Leaflet-based map visualization for land parcels
- Real-time parcel selection and viewing
- Property boundaries displayed on the map
- Intuitive zoom and pan controls

### 2. Smart Contract Integration

- Secure land registry using Ethereum smart contracts
- Digital signature verification for land transfers
- Role-based access control for administrators
- Immutable transaction history

### 3. Property Management

- Register new land parcels with detailed information
- View property analytics and history
- Transfer ownership with digital signatures
- Upload and store property documents on IPFS

### 4. Search and Analytics

- Search parcels by location or owner
- View property transaction history
- Property analytics dashboard
- Real-time property status updates

### 5. Backend Features

- Express.js REST API
- SQLite database for efficient data querying
- Blockchain event indexing
- IPFS integration for document storage
- Rate limiting and security measures

## Prerequisites

- Node.js (v16 or higher)
- PNPM package manager
- Hardhat for local blockchain development
- MetaMask wallet
- Git

## Project Structure

```
buyblock/
├── backend/         # Express.js backend server
├── contracts/       # Solidity smart contracts
├── frontend/        # React.js frontend application
└── deployments/     # Deployment configurations
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Successful-Santa/buyblock.git
cd buyblock
```

### 2. Smart Contracts Setup

```bash
cd contracts
pnpm install
pnpm run compile
pnpm run deploy:localhost  # For local development
```

Create a `.env` file in the contracts directory:

```
PRIVATE_KEY=your_private_key
ALCHEMY_API_KEY=your_alchemy_api_key
```

### 3. Backend Setup

```bash
cd ../backend
pnpm install
```

Create a `.env` file in the backend directory:

```
PORT=3001
IPFS_PROJECT_ID=your_ipfs_project_id
IPFS_PROJECT_SECRET=your_ipfs_project_secret
CONTRACT_ADDRESS=your_deployed_contract_address
RPC_URL=http://localhost:8545  # For local development
```

### 4. Frontend Setup

```bash
cd ../frontend
pnpm install
```

Create a `.env` file in the frontend directory:

```
REACT_APP_API_URL=http://localhost:3001
REACT_APP_CONTRACT_ADDRESS=your_deployed_contract_address
```

## Running the Application

1. Start the Local Blockchain (for development):

```bash
cd contracts
pnpm hardhat node
```

2. Start the Backend Server:

```bash
cd ../backend
pnpm start
# In a separate terminal, start the indexer:
pnpm run indexer
```

3. Start the Frontend Application:

```bash
cd ../frontend
pnpm start
```

The application will be available at `http://localhost:3000`

## Testing

### Smart Contracts

```bash
cd contracts
pnpm test
```

## Development Workflow

1. Deploy smart contracts to your desired network
2. Update the contract addresses in backend and frontend .env files
3. Start the backend server and indexer
4. Run the frontend application
5. Connect MetaMask to the appropriate network
6. Start interacting with the application

## Security Considerations

- Always use MetaMask or a secure wallet for transactions
- Keep your private keys and API secrets secure
- Never commit .env files to version control
- Regularly update dependencies for security patches
- Use the built-in rate limiting for API protection

## License

MIT License

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support

For support, please open an issue in the GitHub repository.
