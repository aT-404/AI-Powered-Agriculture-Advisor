"""
Alert Service for evaluating and dispatching farmer commodity price alerts.
"""

import logging
from django.utils import timezone
from typing import Dict, Any, List, Optional, Tuple
from .market_service import market_service

logger = logging.getLogger(__name__)


class AlertService:
    """
    Evaluates commodity price alerts against real-time mandi prices and dispatches notifications.
    """

    @staticmethod
    def evaluate_alert(alert, current_price: Optional[float] = None) -> Tuple[bool, Optional[str]]:
        """
        Evaluate a single PriceAlert instance against market prices.
        Returns (is_triggered, notification_message).
        """
        if not alert.is_active:
            return False, None

        if current_price is None:
            # Fetch current market price
            matching = market_service.get_market_prices(
                commodity=alert.commodity,
                state=alert.state,
                district=alert.district,
                market=alert.market,
            )
            if not matching:
                return False, None
            current_price = float(matching[0]["modal_price"])

        target = float(alert.target_price)
        condition = alert.condition.upper() if alert.condition else "GTE"

        triggered = False
        if condition == "GTE" and current_price >= target:
            triggered = True
        elif condition == "LTE" and current_price <= target:
            triggered = True

        if triggered:
            alert.is_triggered = True
            alert.triggered_at = timezone.now()
            alert.triggered_price = current_price
            alert.save(update_fields=["is_triggered", "triggered_at", "triggered_price", "updated_at"])

            direction_text = "reached or exceeded" if condition == "GTE" else "fallen to"
            message = (
                f"🔔 {alert.commodity} price has {direction_text} target ₹{target:.0f}/quintal "
                f"(Current: ₹{current_price:.0f}/quintal) at {alert.market}."
            )

            AlertService.dispatch_notification(alert, message)
            return True, message

        return False, None

    @staticmethod
    def evaluate_all_active_alerts() -> List[Dict[str, Any]]:
        """
        Evaluate all active alerts against current market prices.
        """
        from prediction.models import PriceAlert
        active_alerts = PriceAlert.objects.filter(is_active=True)
        results = []

        for alert in active_alerts:
            triggered, message = AlertService.evaluate_alert(alert)
            results.append({
                "alert_id": alert.id,
                "commodity": alert.commodity,
                "market": alert.market,
                "target_price": alert.target_price,
                "is_triggered": alert.is_triggered,
                "message": message,
            })

        return results

    @staticmethod
    def dispatch_notification(alert, message: str) -> None:
        """
        Modular notification dispatcher.
        Logs to application logger and provides extension hook for SMS/Email/Push.
        """
        logger.info("[PRICE ALERT TRIGGERED] %s (Alert ID: %s)", message, alert.id)


alert_service = AlertService()
