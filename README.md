# BuyBlock - Decentralized Land Registry System

BuyBlock is a decentralized land registry system built on blockchain technology that allows for secure, transparent, and efficient management of land parcels. The system combines smart contracts, IPFS storage, and an interactive map interface to provide a comprehensive solution for land registration and management.

## Features

### 1. Interactive Map Interface

- **Leaflet-based map visualization** for land parcels across India
- **Interactive drawing tools** for selecting property boundaries
  - Polygon drawing for custom property shapes
  - Rectangle tool for quick area selection
  - Edit and delete capabilities for drawn shapes
  - Automatic area calculation in square meters
- **Real-time parcel selection** - Click on any parcel polygon to view details
- **Property boundaries** displayed with color-coded contracts
- **Map-based property registration** - Draw on the map to register new properties
- Intuitive zoom and pan controls with geolocation
- Restricted to India boundaries for focused land registry

### 2. Smart Contract Integration

- **Modern Solidity contracts** (LandRegistry.sol & PropertyToken.sol)
- Secure land registry using Ethereum smart contracts
- **ERC721 NFT integration** for property tokenization
- **Role-based access control** (ADMIN_ROLE, VERIFIER_ROLE, REGISTRAR_ROLE)
- **Property verification system** with status tracking
- **Dispute resolution mechanism** for boundary and ownership conflicts
- Digital signature verification for land transfers
- Pausable contract for emergency situations
- Immutable transaction history on blockchain

### 3. Property Management

- **Enhanced registration form** with comprehensive fields:
  - GeoJSON coordinates (auto-filled from map selection)
  - Property area in square meters (auto-calculated)
  - Location (city, state, country)
  - Property value in ETH
  - Owner wallet address
  - Property description
  - Document upload (PDF, images)
- **Complete property details view** including:
  - Database information (area, location, value, description)
  - Blockchain verification status
  - Registration timestamps
- View detailed property analytics and valuation trends
- Transfer ownership with digital signatures
- Upload and store property documents on IPFS (with local fallback)

### 4. Search and Analytics

- **Advanced search panel** with multiple filters:
  - Search by owner address
  - Filter by location
  - Property value range (min/max)
  - Property area range (min/max)
  - Verification status
  - Property status (active, disputed, etc.)
- **Search results display** with key property metrics
- Click search results to view on map
- **Property history tracking**:
  - Complete ownership transfer history
  - Previous and new owner records
  - Sale prices and transaction hashes
  - Transfer timestamps
- **Valuation analytics**:
  - Historical valuation trends over time
  - Multiple valuation types (market, insurance)
  - Professional appraiser records
  - Price per square meter calculations
- **Dispute management**:
  - View dispute history and status
  - Dispute type tracking (boundary, ownership, etc.)
  - Resolution notes and dates
- **Property documents** repository with IPFS links
- Real-time property status updates

### 5. Backend Features

- Express.js REST API with comprehensive endpoints:
  - `/api/parcels` - Get all parcels, register new properties
  - `/api/parcels/:id` - Get specific parcel details
  - `/api/parcels/search` - Advanced search with filters
  - `/api/parcels/:id/history` - Ownership and transaction history
  - `/api/parcels/:id/analytics` - Valuation trends and analytics
  - `/api/parcels/:id/documents` - Document management
- **Dual database support**: SQLite (preferred) with JSON fallback
- **Enhanced JSON database** with support for:
  - Ownership history tracking
  - Property valuations with timestamps
  - Dispute records and resolutions
  - Document storage references
- Blockchain event indexing for real-time updates
- **IPFS integration** with automatic fallback for document storage
- Multipart form handling for file uploads
- Rate limiting and security measures (Helmet, CORS)
- Comprehensive error handling

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

Follow these steps to run the BuyBlock application locally:

### Prerequisites

- Ensure you have Node.js (v16 or higher) installed
- Install PNPM if not already installed: `npm install -g pnpm`
- Install dependencies in all directories as described in the Installation section

### Quick Start (Simplified Setup)

For development and testing, you can run the application without a local blockchain:

1. **Start the Backend Server**:

   ```bash
   cd backend
   pnpm start
   ```

   The backend will run on `http://localhost:3001`.

2. **Start the Frontend Application** (in a new terminal):

   ```bash
   cd frontend
   PORT=3000 pnpm start
   ```

   The frontend will be available at `http://localhost:3000`.

3. **Access the Application**:
   - Open your browser and navigate to `http://localhost:3000`
   - The application will work with the JSON database for development
   - You can register properties, search, and view property details
   - IPFS features will use local fallback identifiers

### Full Setup with Blockchain (Optional)

For full blockchain integration:

1. **Start the Local Blockchain**:

   ```bash
   cd contracts
   pnpm hardhat node
   ```

   This starts a local Ethereum network on `http://localhost:8545`. Keep this terminal running.

   Note the test accounts displayed - you'll need these addresses for testing.

2. **Deploy Smart Contracts** (in a new terminal):

   ```bash
   cd contracts
   pnpm run deploy:localhost
   ```

   Note the deployed contract address from the output (e.g., `LandRegistry deployed to: 0x...`).

3. **Update Environment Variables**:

   - In `backend/.env`, update `CONTRACT_ADDRESS` with the deployed address from step 2.
   - In `frontend/.env`, update `REACT_APP_CONTRACT_ADDRESS` with the same address.

4. **Start the Backend Server** (in a new terminal):

   ```bash
   cd backend
   pnpm start
   ```

   The backend will run on `http://localhost:3001`.

5. **Start the Blockchain Indexer** (Optional - in a new terminal):

   ```bash
   cd backend
   pnpm run indexer
   ```

   This indexes blockchain events. Keep it running for real-time updates.

6. **Start the Frontend Application** (in a new terminal):
   ```bash
   cd frontend
   PORT=3000 pnpm start
   ```
   The frontend will be available at `http://localhost:3000`.

### Accessing the Application

- Open your browser and navigate to `http://localhost:3000`
- **For Quick Start**: Use the drawing tools to select areas and register properties
- **For Full Setup**: Connect MetaMask to the local network (`http://localhost:8545`) with Chain ID 31337
- Import one of the Hardhat test accounts into MetaMask using the private keys shown in the Hardhat node output

### Using the Application

#### Registering a New Property

1. Click the **drawing tools** (polygon/rectangle) on the map
2. Draw the property boundary on the map
3. The registration form will appear with auto-filled coordinates and area
4. Fill in the required fields:
   - **Owner Address**: Use a test account address (e.g., `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`)
   - **Location**: Enter city, state, country
   - **Property Value**: Enter value in ETH
   - **Description**: Add property details
   - **Documents**: Upload property documents (PDF, images)
5. Click **Register Property**

#### Viewing Property Details

1. Click on any **colored polygon** on the map
2. The sidebar will show:
   - Property details (owner, area, location, value)
   - Blockchain verification status
   - Ownership history (for properties with history)
   - Registration date

#### Searching Properties

1. Click the **Search** tab in the sidebar
2. Use filters:
   - Owner address
   - Location
   - Value range
   - Area range
   - Verification status
3. Click **Search** to see results
4. Click any result to view it on the map

#### Viewing Property History and Analytics

1. Click on **Parcel 2** (Delhi area) to see sample data including:
   - 3 ownership transfers with sale prices
   - 5 property valuations over time
   - 1 resolved boundary dispute
   - Property documents on IPFS

### Sample Test Data

The application includes sample data for testing:

- **Parcel 1**: Mumbai area - Basic parcel
- **Parcel 2**: New Delhi area - Complete with ownership history, valuations, and dispute records
- **Parcel 3**: Bengaluru area - Basic parcel

### Troubleshooting

- Ensure all terminals are running in the background
- Check that ports are not in use:
  - **8545**: Local blockchain (if using full setup)
  - **3001**: Backend server
  - **3000**: Frontend application
- If ports are in use, kill existing processes:
  ```bash
  pkill -f "node.*server.js"  # Kill backend
  pkill -f "react-scripts"    # Kill frontend
  ```
- If IPFS uploads fail, the system will automatically use local fallback identifiers
- For map drawing issues, refresh the page and try again
- Check browser console for any JavaScript errors

## Testing

### Smart Contracts

```bash
cd contracts
pnpm test
```

## Technology Stack

### Frontend

- **React.js** - UI framework
- **Leaflet** - Interactive maps
- **Leaflet-Draw** - Drawing tools for property boundaries
- **Leaflet-GeometryUtil** - Area calculations
- **Axios** - HTTP client
- **Web3.js/Ethers.js** - Blockchain interaction

### Backend

- **Express.js** - REST API server
- **SQLite** - Primary database (with JSON fallback)
- **Multer** - File upload handling
- **IPFS HTTP Client** - Decentralized storage
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - API protection

### Smart Contracts

- **Solidity** - Smart contract language
- **Hardhat** - Development environment
- **OpenZeppelin** - Contract libraries (ERC721, AccessControl, Pausable)
- **Ethers.js** - Contract deployment and interaction

### Storage

- **IPFS** - Decentralized document storage
- **SQLite/JSON** - Metadata and query optimization

## Development Workflow

1. Deploy smart contracts to your desired network
2. Update the contract addresses in backend and frontend .env files
3. Start the backend server and indexer
4. Run the frontend application
5. Connect MetaMask to the appropriate network
6. Start interacting with the application

## Recent Updates

### Version 2.0 - November 2025

**Major Features Added:**

1. **Interactive Map Property Registration**

   - Polygon and rectangle drawing tools
   - Automatic area calculation in square meters
   - Auto-fill coordinates from map selection
   - Visual feedback during drawing

2. **Enhanced Property Management**

   - Comprehensive registration form with area, location, and value fields
   - Detailed property information display
   - Support for property descriptions

3. **Advanced Search and Analytics**

   - Multi-criteria search with filters
   - Complete ownership history tracking
   - Property valuation trends over time
   - Dispute management system
   - Document repository with IPFS integration

4. **Improved Smart Contracts**

   - New LandRegistry.sol with enhanced features
   - PropertyToken.sol for NFT-based property tokens
   - Role-based access control system
   - Property verification workflow
   - Dispute resolution mechanism

5. **Database Enhancements**

   - Support for ownership history
   - Valuation tracking with timestamps
   - Dispute records with resolution tracking
   - Document metadata storage
   - Improved query handling for complex data

6. **User Experience Improvements**
   - Click-on-parcel for instant details
   - Search results with key metrics
   - Responsive sidebar with tabs
   - Better error handling and feedback
   - Local fallback for IPFS when unavailable

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
