# max30

Demo at [Plekkie.me](https://plekkie.me)

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your unit tests
```
npm run test:unit
```

### Lints and fixes files
```
npm run lint
```

## Cloud Firestore Data Model

### Users
```
users/{userID}
 - name
 - waitlist {
     - venueID1: true,
     - venueID2: true
   }
 - reservations {
     - venueID1: true
     - venueID2: true
   }
```
   
### Venues
```
venues/{venueID}
 - name
 - location
    - city
    - address
 - category {
     - categoryName1: true,
     - categoryName2: true
   }
 - capacity
 - presentCount
 - owners {
     - userID1: true,
     - userID2: true
   }
```

### Wait List
```
waitlist/{waitlistID}
 - userID
 - venueID
 - status
 - personCount
 - timestamp
```
### Reservations
```
reservations/{reservationID}
 - userID
 - venueID
 - status
 - personCount
 - createdTimestamp
 - reservedTimestamp
```
### Chats
```
chats/{venueID_userID}
 - userID
 - venueID
 - messages/{messageID}
    - content
    - sendBy: owner | user
    - timestamp
```