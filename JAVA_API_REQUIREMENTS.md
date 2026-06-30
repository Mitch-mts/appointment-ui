# Java backend API requirements

This document lists the API changes the **updated Next.js frontend** expects. Implement these on your Spring Boot service (base path `/v1`, proxied as `/api/*` from Next.js).

All responses should follow your existing envelope:

```json
{
  "success": true,
  "data": { },
  "message": "optional human-readable message",
  "error": ""
}
```

---

## Summary of changes

| Area | Change |
|------|--------|
| **Appointments** | Store `providerId` as a real FK; return it on reads |
| **Availability** | Support `providerId` query param; exclude booked slots per provider |
| **Create** | Accept `providerId` in body |
| **Update** | Accept reschedule fields (`date`, `time`, `providerId`) and `bookingStatus` |
| **Cancel** | `PUT` with `{ "bookingStatus": "CANCELLED" }` |
| **Optional** | Enrich list/detail with `providerName` |

---

## 1. Appointment entity (database)

Add or confirm columns on `appointments`:

| Column | Type | Notes |
|--------|------|--------|
| `id` | BIGINT PK | Existing |
| `provider_id` | BIGINT FK → `providers.id` | **Required for new bookings** |
| `user_id` | BIGINT FK → `users.id` | Optional if you key by email today |
| `full_name` | VARCHAR | Client name at booking time |
| `email` | VARCHAR | Client email |
| `booked_date` | DATE | Stored as date |
| `booked_time` | TIME or VARCHAR(5) | e.g. `09:00` |
| `notes` | TEXT | User notes only (not provider metadata) |
| `booking_status` | ENUM/VARCHAR | `PENDING`, `SCHEDULED`, `COMPLETED`, `CANCELLED` |
| `reference_number` | VARCHAR UNIQUE | Confirmation code |
| `created_at`, `updated_at` | TIMESTAMP | Existing |

**Status rules (recommended):**

- New booking → `SCHEDULED` (or `PENDING` if you require admin approval)
- Cancel → `CANCELLED`
- After visit → `COMPLETED`
- Reschedule → keep `SCHEDULED` (or `PENDING`)

---

## 2. Create appointment

**Existing route:** `POST /v1/appointments/create`

**Request body (updated):**

```json
{
  "date": "2026-05-20",
  "time": "09:00",
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "providerId": 1,
  "notes": "Optional user message"
}
```

**Validation:**

- `providerId` must exist and be active
- Slot must fall within provider working hours (parse `providers.availability` or a structured schedule table)
- Slot must not conflict with another non-cancelled appointment for the **same provider**
- Reject past date/time

**Response `data`:**

```json
{
  "id": 42,
  "referenceNumber": "APT-20260520-ABC12",
  "providerId": 1,
  "providerName": "Dr. Jane Smith",
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "bookedDate": "2026-05-20",
  "bookedTime": "09:00",
  "bookingStatus": "SCHEDULED",
  "notes": "Optional user message"
}
```

---

## 3. Update appointment (cancel, complete, reschedule)

**Existing route:** `PUT /v1/appointments/update/{id}`

### 3a. Cancel

```json
{ "bookingStatus": "CANCELLED" }
```

- Only owner (email match) or `ADMIN` may cancel
- Idempotent if already cancelled

### 3b. Complete

```json
{ "bookingStatus": "COMPLETED" }
```

### 3c. Reschedule

```json
{
  "date": "2026-05-22",
  "time": "10:30",
  "providerId": 1,
  "bookingStatus": "SCHEDULED"
}
```

- Re-run conflict checks for the target provider/date/time
- Optionally allow changing `providerId` if the new provider is free at that slot

**Response:** full updated appointment object (same shape as create response).

---

## 4. Availability (provider-scoped)

**Existing route:** `GET /v1/appointments/available`

**Query parameters:**

| Param | Required | Description |
|-------|----------|-------------|
| `startDate` | Yes | `yyyy-MM-dd` |
| `endDate` | Yes | `yyyy-MM-dd` |
| `providerId` | **Yes** (frontend always sends when booking) | Filter slots for one provider |
| `excludeAppointmentId` | No | When rescheduling, ignore this booking in conflict check |

**Response `data`:** array of days:

```json
[
  {
    "date": "2026-05-20",
    "availableSlots": [
      { "time": "08:00", "available": true },
      { "time": "08:30", "available": false },
      { "time": "09:00", "available": true }
    ]
  }
]
```

**Server logic:**

1. Load provider; derive working windows from `availability` string **or** structured `provider_schedules` table (recommended long-term).
2. Generate 30-minute slots inside those windows for each date in range.
3. Mark `available: false` for slots already booked (status not `CANCELLED`) for that `providerId`.
4. For today, mark past times as `available: false`.
5. Do not return days with zero available slots (optional but improves UX).

**Provider availability string format** (already used in admin UI):

```text
Monday - Friday, 8am-5pm
```

Parser rules are implemented in the frontend (`lib/providerAvailability.js`); mirror the same rules in Java or move to structured JSON on the provider record.

---

## 5. List & get appointments

### `GET /v1/appointments/list` (admin)

### `GET /v1/appointments/list-for-user?email={email}` (user)

**Each item should include:**

```json
{
  "id": 42,
  "referenceNumber": "APT-…",
  "providerId": 1,
  "providerName": "Dr. Jane Smith",
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "bookedDate": "2026-05-20",
  "bookedTime": "09:00",
  "bookingStatus": "SCHEDULED",
  "notes": "User notes only"
}
```

Optional nested object:

```json
"provider": {
  "id": 1,
  "title": "Dr.",
  "fullName": "Jane Smith",
  "service": "General checkup"
}
```

### `GET /v1/appointments/{id}`

### `GET /v1/appointments/get-by-referenceNumber/{referenceNumber}`

Same appointment shape as above.

---

## 6. Providers (mostly existing)

| Method | Path | Notes |
|--------|------|--------|
| GET | `/v1/providers` | List for booking dropdown |
| GET | `/v1/providers/{id}` | Confirmation page |
| POST | `/v1/providers` | Admin create |
| PUT | `/v1/providers/{id}` | Admin update |
| DELETE | `/v1/providers/{id}` | Admin delete; block if future appointments exist |

**Recommended addition (optional):** structured availability instead of only a string:

```json
{
  "title": "Dr.",
  "fullName": "Jane Smith",
  "service": "General practice",
  "availability": "Monday - Friday, 8am-5pm",
  "schedule": {
    "dayStart": "Monday",
    "dayEnd": "Friday",
    "timeStart": "08:00",
    "timeEnd": "17:00",
    "slotMinutes": 30
  }
}
```

---

## 7. Auth & users (unchanged)

Frontend continues to use:

- `POST /v1/auth/login`
- `POST /v1/auth/register`
- `GET /v1/users/me`
- `GET /v1/users/list` (admin)
- `PUT /v1/users/update/{id}`
- `PUT /v1/users/changePassword/{id}`
- `DELETE /v1/users/delete/{id}`

---

## 8. Optional future endpoints

Not required for the current UI but typical for a production appointment product:

| Endpoint | Purpose |
|----------|---------|
| `POST /v1/appointments/{id}/remind` | Trigger email/SMS reminder |
| `GET /v1/providers/{id}/appointments` | Provider day view |
| `PATCH /v1/providers/{id}/schedule` | Structured weekly hours |
| `POST /v1/appointments/validate` | Dry-run slot check before confirm |

---

## 9. Migration notes

1. **Backfill `provider_id`** on existing rows (nullable during migration).
2. **Parse legacy notes** starting with `Provider: …` only for display until backfill completes.
3. **Index** `(provider_id, booked_date, booked_time)` for conflict queries.
4. Align enum values: frontend uses `PENDING`, `SCHEDULED`, `COMPLETED`, `CANCELLED`.

---

## 10. Quick test checklist (Postman)

1. Create provider with availability `Monday - Friday, 8am-4pm`
2. `GET /appointments/available?providerId=1&startDate=2026-05-19&endDate=2026-05-26`
3. `POST /appointments/create` with `providerId`, date, time
4. Repeat create same slot → `409` or `success: false`
5. `PUT /appointments/update/{id}` with `{ "bookingStatus": "CANCELLED" }`
6. `PUT /appointments/update/{id}` with new `date`, `time`, `providerId`
7. List endpoints return `providerId` and `bookingStatus`

---

## Frontend fallback behavior

Until the Java APIs above are deployed:

- **Availability** falls back to client-side slots from the provider’s `availability` string (no conflict detection).
- **Create** still sends `providerId`; older backends may ignore it until the column exists.
- **Cancel** now always sends `{ "bookingStatus": "CANCELLED" }`.

Implement sections **2–5** first for a correct end-to-end booking experience.
