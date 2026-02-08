from fastapi import FastAPI, HTTPException
import requests
from bs4 import BeautifulSoup

app = FastAPI(title="Ism ma'nosi API")

HEADERS = {"User-Agent": "Mozilla/5.0"}


def ism_manosi(ism: str):
    ism = ism.strip().capitalize()
    url = f"https://ismlar.com/name/{ism}"

    try:
        res = requests.get(url, headers=HEADERS, timeout=10)
        if res.status_code != 200:
            return None

        soup = BeautifulSoup(res.text, "html.parser")

        h1 = soup.find("h1")
        if not h1:
            return None

        p = h1.find_next("p")
        if not p:
            return None

        return p.get_text(strip=True)

    except Exception:
        return None


@app.get("/")
def home():
    return {
        "message": "Ism ma'nosi API ishlayapti 🚀",
        "example": "/ism?name=Amirxan"
    }


@app.get("/ism")
def get_ism(name: str):
    manosi = ism_manosi(name)

    if not manosi:
        raise HTTPException(status_code=404, detail="Ism topilmadi")

    return {
        "Ism": name.capitalize(),
        "Manosi": manosi,
        "Dasturchi": "ismlar.com"
    }
