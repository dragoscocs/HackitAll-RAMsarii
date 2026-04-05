#!/bin/bash

SPORTS=("Padel" "Ping Pong" "Tennis" "Badminton" "Football" "Yoga" "Cycling" "Ski" "Running")
CITIES=("București" "Cluj-Napoca" "Timișoara" "Brașov" "Iași")

# Name pool for variety
FIRST_NAMES=("Alexandru" "Elena" "Mihai" "Andreea" "Cristian" "Simona" "Adrian" "Maria" "Bogdan" "Cristina" "Florin" "Denisa" "George" "Anca" "Stefan" "Raluca" "Gabriel" "Ioana" "Victor" "Laura" "Dorin" "Oana" "Valentin" "Monica" "Paul" "Iulia" "Robert" "Silvia" "Tudor" "Adina")
LAST_NAMES=("Ionescu" "Popescu" "Georgescu" "Diaconu" "Radu" "Dumitru" "Stoica" "Marin" "Nita" "Lupu" "Stan" "Voicu" "Barbu" "Matei" "Dobre" "Sandu" "Oprea" "Paun" "Enache" "Draghici" "Munteanu" "Sava" "Albu" "Rusu" "Neagu" "Toma" "Balas" "Cojocaru" "Moraru" "Vasile")

echo "Starting seed of 20 users per city (Total 100)..."

USER_IDX=300

for CITY in "${CITIES[@]}"
do
    echo "--- Adding 20 users for $CITY ---"
    for i in {1..20}
    do
        # Pick random names
        FNAME="${FIRST_NAMES[$((RANDOM % 30))]}"
        LNAME="${LAST_NAMES[$((RANDOM % 30))]}"
        NAME="$FNAME $LNAME"
        EMAIL="user$USER_IDX@ecosync.ro"
        
        # Pick 2-3 random sports
        S1="${SPORTS[$((RANDOM % 9))]}"
        S2="${SPORTS[$((RANDOM % 9))]}"
        S3="${SPORTS[$((RANDOM % 9))]}"
        
        JSON_DATA=$(cat <<EOF
{
  "name": "$NAME",
  "email": "$EMAIL",
  "password": "demo123",
  "city": "$CITY",
  "preferredSports": ["$S1", "$S2", "$S3"],
  "workSchedule": "09:00 - 18:00"
}
EOF
)

        curl -s -X POST http://localhost:8080/api/auth/register \
             -H "Content-Type: application/json" \
             -d "$JSON_DATA" > /dev/null
        
        echo "[$USER_IDX] Added $NAME ($EMAIL) in $CITY"
        USER_IDX=$((USER_IDX + 1))
    done
done

echo "Done! Added 100 new users."
