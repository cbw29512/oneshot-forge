"""Verify original import bytes, local downloads, and honest review-only delivery."""
import hashlib
import json
import logging
import re
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PRODUCT_ID = "right-to-owlbear-arms"
SOURCE_BLOB = "93db213c977b7d94e78b39af1a96d081d436642c"
ARCHIVE = ROOT / "assets/bundles/right-to-owlbear-arms-v1.1.zip"
EXTRACTED = ROOT / "assets/bundles/owlbear-arms"
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")


def require(condition, message):
    if not condition:
        raise ValueError(message)


def validate():
    raw = ARCHIVE.read_bytes()
    git_blob = b"blob " + str(len(raw)).encode() + b"\0" + raw
    require(hashlib.sha1(git_blob).hexdigest() == SOURCE_BLOB,
            "Original v1.1 archive changed; create a new version instead")
    with zipfile.ZipFile(ARCHIVE) as archive:
        names = archive.namelist()
        require(len(names) == len(set(names)) == 13, "Expected 13 unique entries")
        manifest = json.loads(archive.read("MANIFEST.json"))
        require(manifest["version"] == "1.1", "Unexpected bundle version")
        require(manifest["archive_file_count"] == 13, "Manifest count changed")
        entries = manifest["files"]
        require(len(entries) == 12, "Expected 12 manifested payloads")
        require(set(names) == {item["path"] for item in entries} | {"MANIFEST.json"},
                "Unmanifested or missing archive entry")
        for name in names:
            target = (EXTRACTED / name).resolve()
            require(target.is_relative_to(EXTRACTED.resolve()), "Unsafe archive path")
            require(target.read_bytes() == archive.read(name), "Download drift: " + name)
        for item in entries:
            content = archive.read(item["path"])
            require(len(content) == item["size_bytes"], "Size mismatch: " + item["path"])
            require(hashlib.sha256(content).hexdigest() == item["sha256"],
                    "Checksum mismatch: " + item["path"])

    products = json.loads((ROOT / "data/products.json").read_text())["products"]
    matches = [item for item in products if item["id"] == PRODUCT_ID]
    require(len(matches) == 1, "Expected exactly one OwlBear Arms product")
    product = matches[0]
    for field, value in {"format": "download-bundle", "bundleVersion": "1.1",
                         "status": "review", "priceCents": 0, "sellable": False,
                         "currentAccess": "free-preview", "runnerUrl": None}.items():
        require(product.get(field) == value, "Review boundary changed: " + field)
    require(product["downloadUrl"] == str(ARCHIVE.relative_to(ROOT)), "Wrong download")
    require(not product["releaseGate"]["approved"], "Unresolved audit cannot be approved")
    require(not product["releaseGate"]["checkoutConfigured"], "Checkout opened too early")
    require("2014" in product["rulesEdition"], "Missing original edition")
    require((ROOT / product["auditUrl"]).is_file(), "Missing audit")
    page_path = ROOT / product["productUrl"]
    page = page_path.read_text()
    for fragment in ["start-here", "print-materials", "player-materials"]:
        require(f'id="{fragment}"' in page, "Missing setup section: " + fragment)
    for href in re.findall(r'href="([^"]+)"', page):
        if href.startswith(("#", "https:", "http:")):
            continue
        clean = href.split("#")[0].split("?")[0]
        require((page_path.parent / clean).exists(), "Broken kit link: " + href)
    index = (ROOT / "index.html").read_text()
    require(f'data-product-id="{PRODUCT_ID}"' in index, "Missing catalog card")
    require(f'href="{product["downloadUrl"]}"' in index, "Missing complete download")
    require("2014" in page and "review preview" in page, "Unclear preview or edition")
    logging.info("OwlBear Arms: original ZIP, 12 hashes, 13 downloads, links, and review gate OK")


if __name__ == "__main__":
    try:
        validate()
    except (OSError, ValueError, KeyError, zipfile.BadZipFile) as error:
        logging.error("OwlBear Arms import validation failed: %s", error)
        sys.exit(1)
