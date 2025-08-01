# IPFS Setup Guide

This guide explains how to set up IPFS image upload functionality for the StakeCraft admin panel.

## Overview

The application now supports uploading images to IPFS (InterPlanetary File System) when creating or editing content in the admin panel. Images are uploaded to IPFS first, and then the IPFS hash is stored in the database.

## Setup Instructions

### 1. Choose an IPFS Service

You can use one of the following IPFS services:

#### Option A: Pinata (Recommended)

1. Go to [Pinata](https://pinata.cloud/)
2. Create an account and get your API keys
3. Add the following environment variables to your `.env` file:

```env
VITE_PINATA_API_KEY=your_pinata_api_key_here
VITE_PINATA_SECRET_KEY=your_pinata_secret_key_here
```

#### Option B: Infura IPFS

1. Go to [Infura](https://infura.io/)
2. Create an account and set up an IPFS project
3. Add the following environment variables to your `.env` file:

```env
VITE_INFURA_PROJECT_ID=your_infura_project_id_here
VITE_INFURA_PROJECT_SECRET=your_infura_project_secret_here
```

### 2. Environment Variables

Create a `.env` file in the frontend root directory with the following variables:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# IPFS Configuration (Pinata)
VITE_PINATA_API_KEY=your_pinata_api_key_here
VITE_PINATA_SECRET_KEY=your_pinata_secret_key_here

# Alternative IPFS Configuration (Infura)
# VITE_INFURA_PROJECT_ID=your_infura_project_id_here
# VITE_INFURA_PROJECT_SECRET=your_infura_project_secret_here
```

### 3. Backend Changes Required

Make sure your backend can handle IPFS hashes in the image field. The backend should:

1. Accept IPFS hashes in the `image` field instead of file uploads
2. Store the IPFS hash in the database
3. Return the IPFS hash when fetching content

### 4. Database Schema

Update your database schema to store IPFS hashes:

```javascript
// Example MongoDB schema
const contentSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String, // This will now store IPFS hash
  link: String,
  stakeCode: String,
  isActive: Boolean,
  type: String
})
```

## How It Works

### Upload Process

1. User selects an image file in the admin panel
2. When saving content, the image is first uploaded to IPFS
3. The IPFS hash is returned and stored in the database
4. The content is saved with the IPFS hash

### Display Process

1. When fetching content, the IPFS hash is retrieved from the database
2. The hash is converted to a full IPFS URL using the gateway
3. Images are displayed using the IPFS URL

## IPFS Gateway

The application uses `https://ipfs.io/ipfs/` as the default IPFS gateway. You can change this in the `useIPFS.js` composable if needed.

## Error Handling

The application includes error handling for:

- IPFS upload failures
- Network connectivity issues
- Invalid file types
- API key authentication errors

## Testing

To test the IPFS functionality:

1. Set up your IPFS service and API keys
2. Create a new mainnet/testnet entry in the admin panel
3. Upload an image file
4. Check that the image displays correctly on the frontend
5. Verify the IPFS hash is stored in your database

## Troubleshooting

### Common Issues

1. **"Failed to upload image to IPFS"**

   - Check your API keys are correct
   - Verify your IPFS service is working
   - Check network connectivity

2. **Images not displaying**

   - Verify the IPFS hash is stored correctly in the database
   - Check the IPFS gateway is accessible
   - Ensure the image was uploaded successfully to IPFS

3. **CORS errors**
   - Make sure your IPFS service allows requests from your domain
   - Check if you need to configure CORS settings

### Debug Mode

Enable debug logging by checking the browser console for detailed error messages during upload and display processes.
