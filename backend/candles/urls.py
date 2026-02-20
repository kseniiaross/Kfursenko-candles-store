from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, CandleViewSet

router = DefaultRouter()
router.register(r"categories", CategoryViewSet)
router.register(r"candles", CandleViewSet)

urlpatterns = router.urls