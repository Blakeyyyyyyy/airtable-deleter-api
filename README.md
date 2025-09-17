# Airtable Record Deleter API

Web service for safely deleting records from Airtable via HTTP API.

## Quick Start

### API Endpoint
Send a POST request to delete a record:

```bash
curl -X POST https://your-service-url.com/delete-record \
  -H "Content-Type: application/json" \
  -d '{"recordId": "recXXXXXXXXXXXXXX"}'
```

### Response
```json
{
  "success": true,
  "message": "Record deleted successfully",
  "deletedRecordId": "recXXXXXXXXXXXXXX"
}
```

## Environment Variables

The service requires these environment variables:

- `AIRTABLE_TOKEN` - Your Airtable Personal Access Token
- `AIRTABLE_BASE_ID` - The Airtable Base ID (starts with `app`)  
- `AIRTABLE_TABLE_ID` - The Table ID or name (starts with `tbl`)

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Endpoints

- `POST /delete-record` - Delete a record by ID
- `GET /healthz` - Health check
- `GET /version` - API version
- `GET /` - API documentation

## Error Handling

The API returns appropriate HTTP status codes and error messages for:
- Missing or invalid record IDs
- Airtable API errors
- Missing environment variables
- Server errors