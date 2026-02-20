from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, CandleViewSet

router = DefaultRouter()
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"candles", CandleViewSet, basename="candle")

urlpatterns = router.urls + [
]