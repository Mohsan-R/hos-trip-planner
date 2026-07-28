from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DefaultUserAdmin
from .models import Trip, TripUser

class TripInline(admin.StackedInline):
    model = Trip
    extra = 0
    show_change_link = True
    can_delete = True

@admin.register(TripUser)
class TripUserAdmin(DefaultUserAdmin):
    inlines = [TripInline]

@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'current_location', 'pickup_location', 'dropoff_location', 'created_at')
    search_fields = ('current_location', 'pickup_location', 'dropoff_location', 'user__username', 'user__first_name')
    list_filter = ('user', 'created_at')
    # Default admin.ModelAdmin allows deletion by default. 
    # Just to explicitly specify it if required:
    actions = ['delete_selected']
