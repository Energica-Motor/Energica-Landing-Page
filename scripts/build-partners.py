"""Generate data/partners.generated.ts from the signed-partners sheet.

    python scripts/build-partners.py            # uses cached geocodes, geocodes new addresses
    python scripts/build-partners.py --regeocode

Source of truth: data/source/Energica_Signed_Partners_Final.xlsx, tab "Partners".
Only public fields are written. Legal entity, agreements, dates, signatories,
contacts, contract address, notes and sources never leave the sheet.
Geocodes (OpenStreetMap Nominatim) are cached in data/source/geocode.json and committed.
Requires: openpyxl.
"""
import json, re, sys, time, unicodedata, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SHEET = ROOT / "data/source/Energica_Signed_Partners_Final.xlsx"
CACHE = ROOT / "data/source/geocode.json"
MX_CACHE = ROOT / "data/source/mail-provider.json"
OUT = ROOT / "data/partners.generated.ts"

# Addresses without a house number (no digits) pin at the town centre; Directions = name + town.
def town_only(addr: str) -> bool:
    return not re.search(r"\d", addr)
REGIONS = {"Europe", "North America", "Asia", "Africa", "Oceania"}
ROLE_ORDER = ["country", "dealer", "service"]
# Third-party listings, not the partner's own site (e.g. a Ducati dealer page).
EXCLUDE_SITES = {"ducati.co.il"}

problems: list[str] = []


def cell(v) -> str:
    return re.sub(r"\s+", " ", str(v)).strip() if v is not None else ""


def slug(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def strip_notes(s: str) -> str:
    # Bracketed notes only, e.g. "(mobile/WhatsApp)"; keeps area codes like "(07)".
    return re.sub(r"\s*\([^)]*[A-Za-z][^)]*\)", "", s).strip()


def clean_address(addr: str) -> str:
    """Drop sheet comments: "(near Malmö)", "– street not found", "(house no. not legible)".
    Keeps codes like "(MO)"."""
    a = re.sub(r"\s*\((?=[^)]*[a-z])[^)]*\)", "", addr)
    a = re.sub(r"\s*[–—-]\s*street not found.*$", "", a, flags=re.I)
    return a.strip(" ,")


def roles(ptype: str, agreements: str) -> list[str]:
    t, a = ptype.lower(), agreements.lower()
    r = set()
    if t.startswith("importer"):
        r.add("country")
    if t.startswith("dealer"):
        r.add("dealer")
    if t.startswith("service") or "us service centre" in t:
        r.add("service")
    if re.search(r"\bservice\b.*\b(agreement|terms)\b", a):
        r.add("service")
    return [x for x in ROLE_ORDER if x in r]


def phones(raw: str, name: str) -> list[str]:
    if not raw or re.search(r"not found|no company number", raw, re.I):
        return []
    out = []
    for part in raw.split(";"):
        p = strip_notes(part)
        p = re.sub(r"^[A-Za-z][A-Za-z .'-]*?\s+(?=[+(\d])", "", p)  # "Kobus 083 …" → "083 …"
        if re.search(r"\d{5,}", re.sub(r"\D", "", p)):
            out.append(p)
        elif p:
            problems.append(f"{name}: phone part not parsed: {part!r}")
    return out


def emails(raw: str) -> list[str]:
    # "info@x.dk (older site pages)" → "info@x.dk"; "No generic address…" → skipped.
    out = []
    for part in raw.split(";"):
        m = re.search(r"[\w.+-]+@[\w-]+(\.[\w-]+)+", part)
        if m:
            out.append(m.group(0))
    return out


def websites(raw: str) -> list[str]:
    if not raw or raw.lower().startswith("none"):
        return []
    out = []
    for part in raw.split(";"):
        d = strip_notes(part).strip().rstrip("/")
        if d and d.lower() not in EXCLUDE_SITES:
            out.append(d if d.startswith("http") else f"https://{d}")
    return out


def geocode(query: str, cache: dict, force: bool):
    if query in cache and not force:
        return cache[query]
    url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode({"q": query, "format": "json", "limit": 1})
    req = urllib.request.Request(url, headers={"User-Agent": "partner-locator-build/1.0"})
    time.sleep(1.1)  # Nominatim usage policy: max 1 request per second
    with urllib.request.urlopen(req, timeout=30) as r:
        res = json.load(r)
    hit = {"lat": round(float(res[0]["lat"]), 5), "lng": round(float(res[0]["lon"]), 5)} if res else None
    cache[query] = hit
    return hit


def mail_provider(email: str, cache: dict, force: bool) -> str:
    """'gmail' (Google), 'outlook' (Microsoft 365) or 'other' (any other mail host).
    Gmail/Outlook: the Email button opens a new message there; other: a plain mailto link."""
    dom = email.split("@")[1].lower()
    if dom in cache and not force:
        return cache[dom]
    req = urllib.request.Request(f"https://cloudflare-dns.com/dns-query?name={dom}&type=MX", headers={"accept": "application/dns-json"})
    with urllib.request.urlopen(req, timeout=20) as r:
        mx = " ".join(a["data"].lower() for a in json.load(r).get("Answer", []))
    cache[dom] = "outlook" if "outlook.com" in mx else "gmail" if "google" in mx else "other"
    return cache[dom]


def main():
    import openpyxl

    force = "--regeocode" in sys.argv
    cache = json.loads(CACHE.read_text("utf-8")) if CACHE.exists() else {}
    mx_cache = json.loads(MX_CACHE.read_text("utf-8")) if MX_CACHE.exists() else {}
    ws = openpyxl.load_workbook(SHEET, data_only=True)["Partners"]
    rows = [r for r in ws.iter_rows(values_only=True) if any(c is not None for c in r)]
    head = [cell(h) for h in rows[0]]
    out = []
    for raw in rows[1:]:
        d = {h: cell(v) for h, v in zip(head, raw)}
        name, country, city, addr = d["Partner (trading name)"], d["Country"], d["City"], d["Current Address"]
        region = d["Continent"]
        if region not in REGIONS:
            problems.append(f"{name}: unknown continent {region!r}")
        r = roles(d["Partner Type"], d["Signed Agreements on File"])
        if not r:
            problems.append(f"{name}: no role from {d['Partner Type']!r}")
        town = strip_notes(city)
        shown = clean_address(addr)
        if town_only(shown):  # no street left: "Marieholm, Sweden"
            shown = f"{town}, {country}"
        p = {"id": slug(name.split("(")[0]), "name": name, "types": r, "region": region, "country": country, "city": city, "address": shown}
        if town_only(addr):
            loc, prec = geocode(f"{town}, {country}", cache, force), "town"
            p["directionsQuery"] = f"{name}, {town}, {country}"
        else:
            loc, prec = geocode(f"{addr}, {country}", cache, force), "address"
            # Variants: drop unit/building prefixes ("B3 G/F, …", "#02-10 …") and "ul." street prefixes.
            segs = [s.strip() for s in re.sub(r"\bul\.\s*", "", addr).split(",")]
            for i in range(len(segs)):
                if loc:
                    break
                v = ", ".join(re.sub(r"#\S+\s*", "", s) for s in segs[i:] if s)
                if v and len(segs) - i >= 2:
                    loc = geocode(f"{v}, {country}", cache, force)
            if not loc:  # fall back to street + town, then town
                street = addr.split(",")[0]
                loc, prec = geocode(f"{re.sub(r'[0-9].*$', '', street).strip()}, {town}, {country}", cache, force), "street"
            if not loc:
                loc, prec = geocode(f"{town}, {country}", cache, force), "town"
            if prec != "address":
                problems.append(f"{name}: address not geocoded exactly, pinned at {prec} level")
        if loc:
            p.update(lat=loc["lat"], lng=loc["lng"], geocodePrecision=prec)
        else:
            problems.append(f"{name}: could not geocode")
        for key, vals in (("phones", phones(d["Phone"], name)), ("emails", emails(d.get("Email(s)") or d.get("Generic Email (website)", ""))), ("websites", websites(d["Website"]))):
            if vals:
                p[key] = vals
        if p.get("emails"):
            prov = mail_provider(p["emails"][0], mx_cache, force)
            if prov != "other":
                p["mailProvider"] = prov
        out.append(p)

    MX_CACHE.write_text(json.dumps(mx_cache, indent=2, sort_keys=True) + "\n", "utf-8")
    CACHE.write_text(json.dumps(cache, indent=2, ensure_ascii=False, sort_keys=True) + "\n", "utf-8")
    body = json.dumps(out, indent=2, ensure_ascii=False)
    OUT.write_text(
        "// GENERATED by scripts/build-partners.py from data/source/Energica_Signed_Partners_Final.xlsx.\n"
        "// Do not edit by hand: update the sheet and rerun the script.\n"
        'import type { Partner } from "./partners";\n\n'
        f"export const partners: Partner[] = {body};\n",
        "utf-8",
    )
    print(f"{len(out)} partners → {OUT.relative_to(ROOT)}")
    for x in problems:
        print("  !", x)


if __name__ == "__main__":
    main()
