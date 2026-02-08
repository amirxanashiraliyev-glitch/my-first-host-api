from fastapi import FastAPI, HTTPException
import requests
from bs4 import BeautifulSoup

app = FastAPI(title="Ism ma'nosi API")

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}

BASE = "https://ismlar.com"


def get_ism_link(name: str):
    url = f"{BASE}/uz/search/{name}"
    r = requests.get(url, headers=HEADERS, timeout=10)

    if r.status_code != 200:
        return None

    soup = BeautifulSoup(r.text, "html.parser")

    # 🔎 qidiruv natijasidagi birinchi ism linki
    a = soup.select_one('a[href^="/uz/name/"]')
    if not a:
        return None

    return BASE + a["href"]


def get_ism_meaning(link: str):
    r = requests.get(link, headers=HEADERS, timeout=10)
    if r.status_code != 200:
        return None

    soup = BeautifulSoup(r.text, "html.parser")

    # ism sahifasidagi birinchi paragraf
    p = soup.select_one("article p")
    if not p:
        return None

    return p.get_text(strip=True)


@app.get("/ism")
def ism_manosi(name: str):
    slug = name.lower().strip()

    link = get_ism_link(slug)
    if not link:
        raise HTTPException(404, detail="Ism topilmadi")

    meaning = get_ism_meaning(link)
    if not meaning:
        raise HTTPException(404, detail="Ism ma'nosi topilmadi")

    return {
        "ism": name.capitalize(),
        "manosi": meaning,
        "manba": "ismlar.com"
    }
