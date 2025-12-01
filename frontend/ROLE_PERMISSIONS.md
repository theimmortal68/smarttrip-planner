# Trip Planner - Role-Based Permissions System

## Overview
The application now includes a comprehensive role-based access control (RBAC) system for trip management with four distinct roles.

## Roles and Permissions

### 1. **Creator (Owner)**
- **Database role value**: `owner`
- **Badge color**: Yellow (`bg-yellow-400`)
- **Permissions**:
  - ✅ Full access to all trip features
  - ✅ Can edit trip details and itinerary
  - ✅ Can delete the trip
  - ✅ Can add/remove members (except cannot remove themselves)
  - ✅ Can assign any role to members (viewer, editor, co_owner)
  - ✅ Can change roles of all members
  - ✅ Access to Manage Sharing page

### 2. **Co-Creator (Co-Owner)**
- **Database role value**: `co_owner`
- **Badge color**: Orange (`bg-orange-400`)
- **Permissions**:
  - ✅ Can edit trip details and itinerary
  - ❌ **CANNOT** delete the trip
  - ✅ Can add/remove members (except owner and other co-owners)
  - ✅ Can assign roles to members (viewer, editor only - NOT co_owner or owner)
  - ✅ Can change roles of editors and viewers
  - ❌ **CANNOT** change their own role to owner
  - ✅ Access to Manage Sharing page

### 3. **Editor**
- **Database role value**: `editor`
- **Badge color**: Green (`bg-green-400`)
- **Permissions**:
  - ✅ Can edit trip itinerary items (flights, lodging, activities, car rentals)
  - ✅ Can edit trip details (name, location, dates, description)
  - ❌ **CANNOT** delete the trip
  - ❌ **CANNOT** add/remove members
  - ❌ **CANNOT** change roles
  - ❌ No access to Manage Sharing page
  - ❌ No access to Delete Trip button

### 4. **Member (Viewer)**
- **Database role value**: `viewer`
- **Badge color**: Blue (`bg-blue-300`)
- **Permissions**:
  - ✅ Can view trip details
  - ✅ Can view all itinerary items
  - ❌ **CANNOT** edit anything
  - ❌ **CANNOT** delete the trip
  - ❌ **CANNOT** add/remove members
  - ❌ **CANNOT** change roles
  - ❌ No access to Edit Trip page
  - ❌ No access to Manage Sharing page
  - ❌ No access to Delete Trip button

## Implementation Details

### Frontend Permission Checks

#### ManageSharingPage.jsx
```javascript
// Check if user can manage roles (add/remove members, change roles)
const canManageRoles = () => {
  return currentUserRole === 'owner' || currentUserRole === 'co_owner'
}

// Check if user can remove a specific member
const canRemoveMember = (memberRole) => {
  if (memberRole === 'owner') return false // Can't remove owner
  if (currentUserRole === 'owner') return true // Owner can remove anyone except owner
  if (currentUserRole === 'co_owner' && memberRole !== 'co_owner') return true
  return false
}

// Get available roles based on current user's role
const getAvailableRoles = () => {
  if (currentUserRole === 'owner') {
    return ['viewer', 'editor', 'co_owner']
  }
  if (currentUserRole === 'co_owner') {
    return ['viewer', 'editor'] // Cannot assign co_owner or owner
  }
  return []
}
```

#### TripDetailsPage.jsx
```javascript
// Check if user can edit the trip
const canEdit = () => {
  return userRole === 'owner' || userRole === 'co_owner' || userRole === 'editor'
}

// Check if user can delete the trip
const canDelete = () => {
  return userRole === 'owner' // Only owner can delete
}
```

## Backend Requirements

### 1. **Trip Members Table**
Ensure the trip members table includes:
```sql
trip_members (
  id INT PRIMARY KEY,
  trip_id INT,
  user_id INT,
  role ENUM('owner', 'co_owner', 'editor', 'viewer'),
  FOREIGN KEY (trip_id) REFERENCES trips(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
)
```

### 2. **API Endpoints to Implement**

#### Get User's Role for a Trip
```
GET /api/trips/:tripId/members/me
Response: { user_id, role, first_name, last_name, email }
```

#### Add Trip Member
```
POST /api/trips/:tripId/members
Body: { email, role }
Authorization: Requires owner or co_owner role
Validation: 
  - Co-owners cannot assign 'co_owner' or 'owner' roles
  - Only owners can assign 'co_owner' role
```

#### Update Member Role
```
PUT /api/trips/:tripId/members/:memberId
Body: { role }
Authorization: Requires owner or co_owner role
Validation:
  - Cannot change owner's role
  - Co-owners cannot assign 'co_owner' or 'owner' roles
  - Co-owners cannot change other co-owners' roles
```

#### Remove Trip Member
```
DELETE /api/trips/:tripId/members/:memberId
Authorization: Requires owner or co_owner role
Validation:
  - Cannot remove owner
  - Co-owners cannot remove other co-owners
  - Co-owners cannot remove owner
```

#### Update Trip
```
PUT /api/trips/:tripId
Authorization: Requires owner, co_owner, or editor role
```

#### Delete Trip
```
DELETE /api/trips/:tripId
Authorization: Requires owner role ONLY
```

### 3. **Middleware for Role Checking**

Example authorization middleware:
```javascript
const checkTripRole = (allowedRoles) => {
  return async (req, res, next) => {
    const { tripId } = req.params
    const userId = req.user.id // From JWT
    
    const member = await getTripMember(tripId, userId)
    
    if (!member || !allowedRoles.includes(member.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' })
    }
    
    req.userRole = member.role
    next()
  }
}

// Usage:
router.delete('/trips/:tripId', 
  authenticate, 
  checkTripRole(['owner']), 
  deleteTrip
)

router.put('/trips/:tripId', 
  authenticate, 
  checkTripRole(['owner', 'co_owner', 'editor']), 
  updateTrip
)
```

## Testing the Role System

### Current Mock Data Setup (ManageSharingPage.jsx)
```javascript
const mockMembers = [
  { id: 1, user_id: 1, role: 'owner', ... },
  { id: 2, user_id: 2, role: 'editor', ... },
  { id: 3, user_id: 3, role: 'viewer', ... }
]
```

To test different roles:
1. Change `mockCurrentUser.id` to match different member IDs
2. Observe permission changes in the UI

### Testing Checklist
- [ ] Owner can see all management options
- [ ] Co-owner can add members but not assign co_owner role
- [ ] Co-owner cannot delete trip
- [ ] Editor can only see Edit Trip button
- [ ] Viewer cannot see Manage Trip section at all
- [ ] Remove button only shows for members the current user can remove

## Integration Steps

1. **Backend**: Implement role-based authorization middleware
2. **Backend**: Add role validation to all trip-related endpoints
3. **Frontend**: Uncomment API calls in ManageSharingPage.jsx (lines 7, 78-85, 107-113, 143-148)
4. **Frontend**: Uncomment API calls in TripDetailsPage.jsx to fetch user role
5. **Frontend**: Remove mock data (lines 17-31 in ManageSharingPage.jsx)
6. **Testing**: Verify all permission scenarios work correctly

## Security Notes
- **Always validate permissions on the backend** - frontend checks are for UX only
- Owner role should be assigned automatically when creating a trip
- Prevent role escalation (users promoting themselves)
- Ensure at least one owner exists per trip at all times
