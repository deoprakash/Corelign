from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ========== EVENT TRACKING SCHEMAS ==========

class EventTrackingRequest(BaseModel):
    event_type: str  # "page_view", "click", "scroll", "download", "error", "query", "upload", "demo_access"
    button_name: Optional[str] = None
    page: Optional[str] = None
    visitor_id: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    ip_address: str
    mac_address: Optional[str] = None
    user_agent: Optional[str] = None
    
    # Device & Browser info
    device_type: Optional[str] = None  # "desktop", "mobile", "tablet"
    browser: Optional[str] = None
    os: Optional[str] = None
    screen_size: Optional[str] = None
    
    # Geographic
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    
    # Scroll tracking
    scroll_depth: Optional[float] = None  # 0-100 percentage
    
    metadata: Optional[dict] = None


# ========== DOWNLOAD TRACKING SCHEMAS ==========

class DownloadTrackingRequest(BaseModel):
    platform: str  # "windows", "linux", "mac"
    visitor_id: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    ip_address: str
    mac_address: Optional[str] = None
    user_agent: Optional[str] = None
    device_type: Optional[str] = None
    browser: Optional[str] = None
    os: Optional[str] = None


class InstallerDownloadTrackingRequest(BaseModel):
    platform: str
    visitor_id: str
    session_id: Optional[str] = None
    ip_address: str
    user_agent: Optional[str] = None
    file_size: Optional[float] = None  # in MB
    download_speed: Optional[float] = None  # in Mbps


class AppLaunchTrackingRequest(BaseModel):
    platform: str
    visitor_id: str
    session_id: Optional[str] = None
    app_version: Optional[str] = None


# ========== WORKSPACE/DEMO TRACKING SCHEMAS ==========

class FileUploadTrackingRequest(BaseModel):
    visitor_id: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[float] = None
    file_type: Optional[str] = None
    upload_success: bool
    upload_duration: Optional[float] = None  # in seconds


class QueryTrackingRequest(BaseModel):
    visitor_id: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    query_length: Optional[int] = None
    response_time: Optional[float] = None
    success: bool


class ErrorTrackingRequest(BaseModel):
    event_type: str  # "console_error", "api_error", "crash", "failed_download"
    error_message: Optional[str] = None
    error_stack: Optional[str] = None
    page: Optional[str] = None
    visitor_id: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    ip_address: str
    user_agent: Optional[str] = None


# ========== ADMIN BLOCKING SCHEMAS ==========

class BlockAddressRequest(BaseModel):
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None
    reason: Optional[str] = None


class UnblockAddressRequest(BaseModel):
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None


# ========== ANALYTICS RESPONSE SCHEMAS ==========

class MetricCardResponse(BaseModel):
    label: str
    value: int
    change_percent: Optional[float] = None
    trend: Optional[str] = None  # "up", "down", "stable"


class DownloadMetricResponse(BaseModel):
    platform: str
    button_clicks: int
    installer_downloads: int
    app_launches: int
    unique_visitors: int


class ButtonClickResponse(BaseModel):
    button_name: str
    total_clicks: int
    unique_users: int
    repeated_users: int
    click_through_rate: Optional[float] = None


class PageAnalyticsResponse(BaseModel):
    page: str
    total_visits: int
    unique_visitors: int
    avg_session_duration: float
    bounce_rate: float
    most_scrolled_depth: float


class DeviceAnalyticsResponse(BaseModel):
    device_type: str
    count: int
    percentage: float


class BrowserAnalyticsResponse(BaseModel):
    browser: str
    count: int
    percentage: float


class CountryAnalyticsResponse(BaseModel):
    country: str
    visitors: int
    downloads: int


class ScrollAnalyticsResponse(BaseModel):
    depth_range: str  # "0-25%", "25-50%", "50-75%", "75-100%"
    user_count: int
    percentage: float


class SessionAnalyticsResponse(BaseModel):
    avg_duration: float
    total_sessions: int
    returning_visitors: int
    returning_percentage: float


class DashboardOverviewResponse(BaseModel):
    total_visitors: int
    unique_visitors_today: int
    returning_visitors: int
    total_sessions: int
    avg_session_duration: float
    total_downloads: int
    downloads_by_platform: dict
    total_button_clicks: int
    top_pages: List[PageAnalyticsResponse]
    top_buttons: List[ButtonClickResponse]
    device_breakdown: List[DeviceAnalyticsResponse]
    error_count_today: int


class BlockedAddressResponse(BaseModel):
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None
    reason: Optional[str] = None
    blocked_at: datetime
