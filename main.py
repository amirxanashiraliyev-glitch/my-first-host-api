from fastapi import FastAPI, HTTPException
import requests
from bs4 import BeautifulSoup

app = FastAPI(title="Ism manosi API")

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}

@app.get("/")
def home():
    return {
        "message": "Ism ma'nosi API ishlayapti 🚀",
        "example": "/ism?name=Ali"
    }

@app.get("/ism")
def ism_manosi(name: str):
    url = f"https://ismlar.com/search?name={name}"

    try:
        r = requests.get(url, headers=HEADERS, timeout=10)
    except:
        raise HTTPException(500, detail="Ismlar.com bilan aloqa yo‘q")

    if r.status_code != 200:
        raise HTTPException(500, detail="Saytdan noto‘g‘ri javob")

    soup = BeautifulSoup(r.text, "html.parser")

    # ⚠️ selector taxminiy — sayt o‘zgarsa moslanadi
    text_blocks = soup.find_all("p")

    if not text_blocks:
        raise HTTPException(404, detail="Ism topilmadi")

    meaning = text_blocks[0].get_text(strip=True)

    return {
        "ism": name,
        "manosi": meaning,
        "dasturchi": "Amirxon Ashiraliyev"
    }
