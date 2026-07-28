from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import TripInputSerializer
from .services.trip_service import TripService
from .models import Trip
from django.forms.models import model_to_dict

class TripCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = TripInputSerializer(data=request.data)
        if serializer.is_valid():
            service = TripService()
            try:
                # the result dict does not contain the trip instance, so we need to modify trip_service or pass user
                # But since trip_service creates it, we can just fetch the last trip and update it, or pass user.
                # Actually, let's pass request.user to create_trip
                result = service.create_trip(serializer.validated_data, user=request.user)
                return Response(result, status=status.HTTP_201_CREATED)
            except Exception as e:
                if hasattr(e, 'status_code'):
                    return Response({"error": e.detail if hasattr(e, 'detail') else str(e)}, status=e.status_code)
                return Response({"error": "Unable to save trip."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        # Extract the first error message to match frontend expectations
        first_field = next(iter(serializer.errors))
        first_error = serializer.errors[first_field][0]
        return Response({"error": first_error}, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        trips = Trip.objects.filter(user=request.user).order_by('-created_at')
        # Serialize the list
        results = []
        for trip in trips:
            results.append({
                "id": trip.id,
                "current_location": trip.current_location,
                "pickup_location": trip.pickup_location,
                "dropoff_location": trip.dropoff_location,
                "created_at": trip.created_at,
                "summary": {
                    "distance": trip.distance,
                    "driving_hours": trip.driving_time
                },
                "timeline": trip.timeline,
                "log_sheets": trip.log_sheets,
                "geometry": trip.route_geometry
            })
        return Response(results, status=status.HTTP_200_OK)
