import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Airtable configuration from environment variables
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_TABLE_ID;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'airtable-deleter-api'
  });
});

// Version endpoint
app.get('/version', (req, res) => {
  res.json({ version: '1.0.0' });
});

// Delete record endpoint
app.post('/delete-record', async (req, res) => {
  try {
    const { recordId } = req.body;

    // Validate required environment variables
    if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
      return res.status(500).json({
        success: false,
        error: 'Missing required environment variables (AIRTABLE_TOKEN, AIRTABLE_BASE_ID, AIRTABLE_TABLE_ID)'
      });
    }

    // Validate record ID
    if (!recordId) {
      return res.status(400).json({
        success: false,
        error: 'recordId is required in request body'
      });
    }

    if (typeof recordId !== 'string' || !recordId.startsWith('rec')) {
      return res.status(400).json({
        success: false,
        error: 'recordId must be a valid Airtable record ID starting with "rec"'
      });
    }

    // Make DELETE request to Airtable API
    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}/${recordId}`;
    
    const response = await fetch(airtableUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Airtable API error:', response.status, error);
      
      return res.status(response.status).json({
        success: false,
        error: `Failed to delete record: ${response.statusText}`,
        details: error
      });
    }

    const result = await response.json();
    console.log('Record deleted successfully:', result);

    res.json({
      success: true,
      message: 'Record deleted successfully',
      deletedRecordId: result.id
    });

  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Airtable Record Deleter API',
    endpoints: {
      'POST /delete-record': 'Delete a record by ID',
      'GET /healthz': 'Health check',
      'GET /version': 'API version'
    }
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Base ID: ${AIRTABLE_BASE_ID}`);
  console.log(`Table ID: ${AIRTABLE_TABLE_ID}`);
  console.log(`Token configured: ${AIRTABLE_TOKEN ? 'Yes' : 'No'}`);
});