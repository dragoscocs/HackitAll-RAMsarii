#!/bin/bash

NAMES=("Alexandru Ionescu" "Elena Popescu" "Mihai Georgescu" "Andreea Diaconu" "Cristian Radu" "Simona Dumitru" "Adrian Stoica" "Maria Marin" "Bogdan Nita" "Cristina Lupu" "Florin Stan" "Denisa Voicu" "George Barbu" "Anca Matei" "Stefan Dobre" "Raluca Sandu" "Gabriel Oprea" "Ioana Păun" "Victor Enache" "Laura Drăghici" "Dorin Munteanu" "Oana Sava" "Valentin Albu" "Monica Rusu" "Paul Neagu" "Iulia Toma" "Robert Balaș" "Silvia Cojocaru" "Tudor Moraru" "Adina Vasile")

SPORTS=("Padel" "Ping Pong" "Tennis" "Badminton" "Football" "Yoga" "Cycling" "Ski" "Running")
CITIES=("București" "Cluj-Napoca" "Timișoara" "Brașov" "Iași")

echo "Starting seed of 30 users..."

for i in {0..29}
do
    NAME="${NAMES[$i]}"
    EMAIL="user$((i+200))@ecosync.ro"
    CITY="${CITIES[$((RANDOM % 5))]}"
    
    # Pick 2 random sports
    S1="${SPORTS[$((RANDOM % 9))]}"
    S2="${SPORTS[$((RANDOM % 9))]}"
    
    JSON_DATA=$(cat <<EOF
{
  "name": "$NAME",
  "email": "$EMAIL",
  "password": "demo123",
  "city": "$CITY",
  "preferredSports": ["$S1", "$S2"],
  "workSchedule": "09:00 - 18:00"
}
EOF
)

    curl -s -X POST http://localhost:8080/api/auth/register \
         -H "Content-Type: application/json" \
         -d "$JSON_DATA" > /dev/null
    
    echo "[$((i+1))/30] Added $NAME ($EMAIL) in $CITY"
done

echo "Done!"
