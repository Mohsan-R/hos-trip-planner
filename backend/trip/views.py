from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import TripInputSerializer
from .services.trip_service import TripService

class TripCreateView(APIView):
    def post(self, request):
        serializer = TripInputSerializer(data=request.data)
        if serializer.is_valid():
            service = TripService()
            try:
                result = service.create_trip(serializer.validated_data)
                return Response(result, status=status.HTTP_201_CREATED)
            except Exception as e:
                if hasattr(e, 'status_code'):
                    return Response({"error": e.detail if hasattr(e, 'detail') else str(e)}, status=e.status_code)
                return Response({"error": "Unable to save trip."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        # Extract the first error message to match frontend expectations
        first_field = next(iter(serializer.errors))
        first_error = serializer.errors[first_field][0]
        return Response({"error": first_error}, status=status.HTTP_400_BAD_REQUEST)
