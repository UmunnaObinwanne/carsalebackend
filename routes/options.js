import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// Define the path to the JSON files
const jsonFolderPath = path.join(__dirname, '../json');

// Get Transmission Options
router.get('/transmission-options', (req, res) => {
  res.sendFile(path.join(jsonFolderPath, 'transmissions.json'));
});

// Get Drive Type Options
router.get('/drive-options', (req, res) => {
  res.sendFile(path.join(jsonFolderPath, 'driveTypes.json'));
});

// Get Feature Options
router.get('/feature-options', (req, res) => {
  res.sendFile(path.join(jsonFolderPath, 'features.json'));
});

// Get Transaction Options
router.get('/transaction-options', (req, res) => {
  res.sendFile(path.join(jsonFolderPath, 'transaction.json'));
});

// Get Fuel Type Options
router.get('/fuel-type', (req, res) => {
  res.sendFile(path.join(jsonFolderPath, 'fuelTypes.json'));
});

export default router;
