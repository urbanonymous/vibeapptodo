from datetime import datetime
from typing import Any

from bson import ObjectId


def oid() -> ObjectId:
    return ObjectId()


def to_str_id(doc: dict[str, Any]) -> dict[str, Any]:
    if not doc:
        return doc
    d = dict(doc)
    if "_id" in d:
        d["id"] = str(d.pop("_id"))
    return d


def utcnow() -> datetime:
    return datetime.utcnow()

