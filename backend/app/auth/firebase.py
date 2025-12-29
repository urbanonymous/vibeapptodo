import json

import firebase_admin
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials

from app.core.config import settings


def init_firebase() -> None:
    if firebase_admin._apps:
        return

    if settings.firebase_service_account_json:
        cred_dict = json.loads(settings.firebase_service_account_json)
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred, {"projectId": settings.firebase_project_id})
        return

    # Fallback: initialize without credentials (useful for local dev stubs).
    # Token verification will fail unless credentials are configured.
    firebase_admin.initialize_app(options={"projectId": settings.firebase_project_id})


def verify_bearer_token(token: str) -> dict:
    init_firebase()
    return firebase_auth.verify_id_token(token)

