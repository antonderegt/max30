![Build and Deploy](https://github.com/antonderegt/max30/workflows/Build%20and%20Deploy/badge.svg?branch=master)

# Manage a digital Wait List

View demo [here](https://max30-max100.web.app/)

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
profiles/{userID}
 - name
 - owner: true | false
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
waitlists/{waitlistID}
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
