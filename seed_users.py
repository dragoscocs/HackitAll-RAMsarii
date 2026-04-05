import requests
import random
import json

URL = "http://localhost:8080/api/auth/register"

NAMES = [
    "Alexandru Ionescu", "Elena Popescu", "Mihai Georgescu", "Andreea Diaconu", "Cristian Radu",
    "Simona Dumitru", "Adrian Stoica", "Maria Marin", "Bogdan Nita", "Cristina Lupu",
    "Florin Stan", "Denisa Voicu", "George Barbu", "Anca Matei", "Stefan Dobre",
    "Raluca Sandu", "Gabriel Oprea", "Ioana Păun", "Victor Enache", "Laura Drăghici",
    "Dorin Munteanu", "Oana Sava", "Valentin Albu", "Monica Rusu", "Paul Neagu",
    "Iulia Toma", "Robert Balaș", "Silvia Cojocaru", "Tudor Moraru", "Adina Vasile"
]

SPORTS = ["Padel", "Ping Pong", "Tennis", "Badminton", "Football", "Yoga", "Cycling", "Ski", "Running"]
CITIES = ["București", "Cluj-Napoca", "Timișoara", "Brașov", "Iași"]

def seed():
    print(f"Starting to seed 30 users to {URL}...")
    for i, name in enumerate(NAMES):
        email = f"user{i+100}@ecosync.ro"
        data = {
            "name": name,
            "email": email,
            "password": "demo123",
            "city": random.choice(CITIES),
            "preferredSports": random.sample(SPORTS, random.randint(1, 4)),
            "workSchedule": "09:00 - 18:00"
        }
        
        try:
            response = requests.post(URL, json=data)
            if response.status_code == 200:
                print(f"[{i+1}/30] Succes: {name} ({email})")
            else:
                print(f"[{i+1}/30] Error {response.status_code}: {response.text}")
        except Exception as e:
            print(f"[{i+1}/30] Critical error: {e}")

if __name__ == "__main__":
    seed()
