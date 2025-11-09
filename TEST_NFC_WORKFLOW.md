# Testing NFC Scan-to-Application Workflow

## Prerequisites
1. Database migration run
2. Test user created with `card_uuid`
3. Organization created
4. Device provisioned (get `device_secret` and `device_id`)

## Step 1: Get Your Test Data

Run in Supabase SQL Editor:
```sql
-- Get card_uuid
SELECT card_uuid FROM public.users LIMIT 1;

-- Get device info
SELECT id, device_secret, organization_id 
FROM public.reader_devices 
WHERE is_active = true 
LIMIT 1;
```

**Save these values:**
- `CARD_UUID` - The user's card UUID
- `DEVICE_ID` - The reader device ID
- `DEVICE_SECRET` - The device secret (for auth)
- `ORG_ID` - The organization ID

## Step 2: Simulate NFC Scan

### Option A: Using curl (Terminal)
```bash
curl -X POST http://localhost:3000/api/nfc/scan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 182e65af-eb9d-4d28-9d5f-e52b50d5ef69" \
  -d '{
    "card_uuid": "4bb52b3a-aee5-4456-8c32-c499b1f4fc9c",
    "reader_id": "1b14bfd3-5065-4a34-a2b5-0e3699e1f3fe"
  }'
```

### Option B: Using Postman/Insomnia
1. **Method:** POST
2. **URL:** `http://localhost:3000/api/nfc/scan`
3. **Headers:**
   - `Content-Type: application/json`
   - `Authorization: Bearer YOUR_DEVICE_SECRET`
4. **Body (JSON):**
```json
{
  "card_uuid": "YOUR_CARD_UUID",
  "reader_id": "YOUR_DEVICE_ID"
}
```

### Expected Response:
```json
{
  "success": true,
  "application_id": "uuid-here"
}
```

## Step 3: Get Application Token

After successful scan, get the `public_token` from database:

```sql
SELECT public_token, token_expires_at, status
FROM public.informal_applications
ORDER BY created_at DESC
LIMIT 1;
```

**Save the `public_token`**

## Step 4: Test Application Completion

### Visit the completion page:
```
http://localhost:3000/apply/complete?token=YOUR_PUBLIC_TOKEN
```

### Expected Flow:
1. **Page loads** with application form
2. **If not authenticated:** Enter email → Receive magic link
3. **If authenticated:** Form appears directly
4. **Fill out form** (if questions exist)
5. **Submit application**
6. **Success message** appears

## Step 5: Verify in Dashboard

1. Visit organization dashboard:
   ```
   http://localhost:3000/org/YOUR_ORG_SLUG/applications
   ```
2. **Expected:** See the application in the list
3. **Status:** Should show "completed" after submission

## Quick Test Script

Save this as `test-nfc.sh`:

```bash
#!/bin/bash

# Set your values
DEVICE_SECRET="your-device-secret"
CARD_UUID="your-card-uuid"
DEVICE_ID="your-device-id"
APP_URL="http://localhost:3000"

echo "Testing NFC Scan..."
RESPONSE=$(curl -s -X POST "$APP_URL/api/nfc/scan" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DEVICE_SECRET" \
  -d "{
    \"card_uuid\": \"$CARD_UUID\",
    \"reader_id\": \"$DEVICE_ID\"
  }")

echo "Response: $RESPONSE"

# Extract application_id (requires jq)
APP_ID=$(echo $RESPONSE | jq -r '.application_id')
echo "Application ID: $APP_ID"

# Get public token from database (you'll need to do this manually)
echo "Next: Get public_token from database and visit:"
echo "$APP_URL/apply/complete?token=YOUR_PUBLIC_TOKEN"
```

Make it executable:
```bash
chmod +x test-nfc.sh
./test-nfc.sh
```

## Troubleshooting

### Error: "Invalid device credentials"
- Check `DEVICE_SECRET` matches exactly
- Verify device is `is_active = true` in database
- Check Authorization header format: `Bearer {secret}`

### Error: "Card not found"
- Verify `CARD_UUID` exists in `users` table
- Check UUID format (should be valid UUID)

### Error: "Missing required fields"
- Ensure both `card_uuid` and `reader_id` are in request body

### Application not appearing
- Check `informal_applications` table in Supabase
- Verify `organization_id` matches
- Check RLS policies allow reading

## Full Workflow Test Checklist

- [ ] Device provisioned and secret saved
- [ ] Test user created with card_uuid
- [ ] Scan endpoint called successfully
- [ ] Application record created in database
- [ ] Public token retrieved
- [ ] Completion page loads with token
- [ ] Application form displays
- [ ] Form submission works
- [ ] Application status updates to "completed"
- [ ] Application appears in org dashboard

