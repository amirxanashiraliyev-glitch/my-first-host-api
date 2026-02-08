from fastapi import FastAPI, HTTPException
import requests
from bs4 import BeautifulSoup

app = FastAPI(title="Ism manosi API")

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}

@app.get("/ism")
def ism_manosi(name: str):
    url = f"https://ismlar.com/uz/search/{name.lower()}"

    r = requests.get(url, headers=HEADERS, timeout=10)
    if r.status_code != 200:
        raise HTTPException(500, detail="Ismlar.com ochilmadi")

    soup = BeautifulSoup(r.text, "html.parser")

    # 🔍 faqat asosiy kontentdan qidiramiz
    content = soup.find("div", class_="content")

    if not content:
        raise HTTPException(404, detail="Ism topilmadi")

    paragraphs = content.find_all("p")

    if not paragraphs:
        raise HTTPException(404, detail="Ma'no topilmadi")

    meaning = paragraphs[0].get_text(strip=True)

    return {
        "ism": name.capitalize(),
        "manosi": meaning,
        "Dasturchi": "Amirxon Ashiraliyev"
    }
