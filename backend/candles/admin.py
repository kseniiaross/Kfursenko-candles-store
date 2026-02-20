from django.contrib import admin

from .models import Category, Candle


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "slug")
    search_fields = ("name", "slug")
    ordering = ("name",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Candle)
class CandleAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "category", "price", "in_stock", "created_at")
    list_filter = ("in_stock", "category", "created_at")
    search_fields = ("name", "slug", "description", "category__name", "category__slug")
    ordering = ("-created_at",)
    date_hierarchy = "created_at"

    # Fast edits прямо в списке (очень удобно для одного администратора)
    list_editable = ("price", "in_stock")

    # Чтобы не было конфликтов: поле из list_display не должно быть первым editable
    # (Django requirement). У нас первым идёт id — ок.

    prepopulated_fields = {"slug": ("name",)}

    # Optional: nicer form layout
    fieldsets = (
        (None, {"fields": ("category", "name", "slug")}),
        ("Details", {"fields": ("description", "image")}),
        ("Inventory & Pricing", {"fields": ("price", "in_stock")}),
        ("Timestamps", {"fields": ("created_at",), "classes": ("collapse",)}),
    )
    readonly_fields = ("created_at",)