import logging
from typing import Optional

logger = logging.getLogger("fitnaija.firebase")

_firebase_app = None

def init_firebase():
    global _firebase_app
    try:
        import firebase_admin
        from firebase_admin import credentials
        cred = credentials.ApplicationDefault()
        _firebase_app = firebase_admin.initialize_app(cred)
        logger.info("Firebase Admin initialized with application default credentials")
    except Exception as e:
        logger.warning(f"Firebase not configured: {e}. Push notifications disabled.")

def is_firebase_ready() -> bool:
    return _firebase_app is not None

async def send_push_notification(
    token: str,
    title: str,
    body: str,
    data: Optional[dict] = None,
) -> bool:
    if not is_firebase_ready():
        logger.warning("Firebase not initialized, skipping push notification")
        return False
    try:
        from firebase_admin import messaging
        message = messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            data=data or {},
            token=token,
        )
        response = messaging.send(message)
        logger.info(f"Push notification sent: {response}")
        return True
    except Exception as e:
        logger.error(f"Failed to send push notification: {e}")
        return False

async def send_topic_notification(
    topic: str,
    title: str,
    body: str,
    data: Optional[dict] = None,
) -> bool:
    if not is_firebase_ready():
        logger.warning("Firebase not initialized, skipping topic notification")
        return False
    try:
        from firebase_admin import messaging
        message = messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            data=data or {},
            topic=topic,
        )
        response = messaging.send(message)
        logger.info(f"Topic notification sent to {topic}: {response}")
        return True
    except Exception as e:
        logger.error(f"Failed to send topic notification: {e}")
        return False
