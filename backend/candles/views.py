from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend

from .models import Category, Candle
from .serializers import CategorySerializer, CandleSerializer
from .permissions import IsStaffOrReadOnly


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    search_fields = ["name", "slug"]
    filter_backends = [filters.SearchFilter]
    permission_classes = [IsStaffOrReadOnly]


class CandleViewSet(viewsets.ModelViewSet):
    queryset = Candle.objects.select_related("category").all()
    serializer_class = CandleSerializer
    lookup_field = "slug"
    permission_classes = [IsStaffOrReadOnly]

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["category", "in_stock"]
    search_fields = ["name", "description", "slug", "category__name"]
    ordering_fields = ["price", "created_at", "name"]
    ordering = ["-created_at"]