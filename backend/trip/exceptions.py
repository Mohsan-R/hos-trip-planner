from rest_framework.exceptions import APIException

class LocationNotFound(APIException):
    status_code = 404
    default_detail = 'Location not found.'
    default_code = 'location_not_found'

class RoutingServiceUnavailable(APIException):
    status_code = 503
    default_detail = 'Routing service unavailable.'
    default_code = 'service_unavailable'

class RoutingTimeout(APIException):
    status_code = 503
    default_detail = 'Request timed out.'
    default_code = 'timeout'

class RoutingTooManyRequests(APIException):
    status_code = 429
    default_detail = 'Too many requests. Please try again later.'
    default_code = 'too_many_requests'

class RoutingBadGateway(APIException):
    status_code = 502
    default_detail = 'Routing provider encountered an error.'
    default_code = 'bad_gateway'

class RouteCalculationError(APIException):
    status_code = 400
    default_detail = 'Route cannot be calculated between locations.'
    default_code = 'route_error'
