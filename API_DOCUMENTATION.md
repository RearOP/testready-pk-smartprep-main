# TestReady.pk API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "student@example.com",
  "username": "student123",
  "password": "password123",
  "fullName": "John Doe",
  "city": "Lahore",
  "examType": "mdcat"
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

### Student Profile

#### Complete Profile
```http
POST /students/profile/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "schoolName": "ABC School",
  "age": 16,
  "classGrade": "10th Grade",
  "whatsappNumber": "+923001234567",
  "consentWhatsapp": true
}
```

#### Get Profile
```http
GET /students/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /students/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "schoolName": "Updated School",
  "age": 17,
  "classGrade": "11th Grade"
}
```

#### Get Progress
```http
GET /students/progress
Authorization: Bearer <token>
```

### Tests

#### List Available Tests
```http
GET /tests
```

#### Get Test Details
```http
GET /tests/:testId
```

#### Start Test
```http
POST /tests/:testId/start
Authorization: Bearer <token>
```

#### Submit Test
```http
POST /tests/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "attemptId": "attempt-id",
  "answers": [
    {
      "questionId": "question-id",
      "answer": "a"
    }
  ]
}
```

#### Get Test History
```http
GET /tests/history/all
Authorization: Bearer <token>
```

### Admin Panel

#### Dashboard Statistics
```http
GET /admin/dashboard
Authorization: Bearer <token>
```

#### List Students
```http
GET /admin/students?page=1&limit=10&search=john
Authorization: Bearer <token>
```

#### Export Students
```http
GET /admin/students/export
Authorization: Bearer <token>
```

#### Import Students
```http
POST /admin/students/import
Authorization: Bearer <token>
Content-Type: multipart/form-data

csv: <file>
```

#### List Tests
```http
GET /admin/tests
Authorization: Bearer <token>
```

#### Create Test
```http
POST /admin/tests
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Biology Test",
  "description": "Test description",
  "totalMarks": 100,
  "timeLimit": 1800,
  "questions": [
    {
      "text": "What is photosynthesis?",
      "options": [
        {"id": "a", "text": "Option A"},
        {"id": "b", "text": "Option B"}
      ],
      "correctAnswer": "a",
      "marks": 1,
      "explanation": "Explanation text"
    }
  ]
}
```

#### Update Test
```http
PUT /admin/tests/:testId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "isActive": true
}
```

#### Delete Test
```http
DELETE /admin/tests/:testId
Authorization: Bearer <token>
```

### WhatsApp Integration

#### Send WhatsApp Message
```http
POST /whatsapp/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "studentId": "student-id",
  "message": "Test completed! Score: 85%",
  "type": "TEST_RESULT"
}
```

#### Send Test Result Notification
```http
POST /whatsapp/test-result/:attemptId
Authorization: Bearer <token>
```

#### Get Notification Logs
```http
GET /whatsapp/logs?page=1&limit=20&status=SENT
Authorization: Bearer <token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

- **Window**: 15 minutes
- **Limit**: 100 requests per IP
- **Headers**: 
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## Error Handling

All errors follow a consistent format and include appropriate HTTP status codes. Validation errors include detailed field-specific messages.

## Testing

Use the provided Postman collection or test endpoints using curl:

```bash
# Login example
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@testready.pk","password":"student123"}'
```
