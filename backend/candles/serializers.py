# backend/candles/serializers.py
from rest_framework import serializers
from .models import Category, Candle


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]


class CandleSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",
        write_only=True,
    )

    class Meta:
        model = Candle
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "price",
            "stock_qty",
            "in_stock",
            "created_at",
            "image",
            "category",
            "category_id",
        ]
        read_only_fields = ["slug", "in_stock", "created_at", "category"]

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0.")
        return value

    def validate_stock_qty(self, value):
        if value < 0:
            raise serializers.ValidationError("stock_qty cannot be negative.")
        return value