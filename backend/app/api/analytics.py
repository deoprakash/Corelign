from fastapi import APIRouter, Request, HTTPException, Header
from app.analytics.schemas import (
    EventTrackingRequest, DownloadTrackingRequest, FileUploadTrackingRequest,
    QueryTrackingRequest, ErrorTrackingRequest, BlockAddressRequest,
    UnblockAddressRequest
)
from app.analytics.database import analytics_db
import os
from typing import Optional

router = APIRouter()

# Admin password verification
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

def verify_admin(x_admin_password: str = Header(None)):
    """Verify admin password"""
    if x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=403, detail="Unauthorized")
    return True


# ========== TRACKING ENDPOINTS (PUBLIC) ==========

@router.post("/get-client-ip")
async def get_client_ip(request: Request):
    """Get client IP address"""
    # Prefer X-Forwarded-For header (set by proxies like Railway/Vercel)
    xff = None
    # Header keys may be lowercase or mixed
    if request.headers:
        xff = request.headers.get('x-forwarded-for') or request.headers.get('X-Forwarded-For')

    if xff:
        # X-Forwarded-For may contain a comma-separated list; take the first public IP
        client_ip = xff.split(',')[0].strip()
    else:
        client_ip = request.client.host if request.client else "0.0.0.0"

    return {"ip_address": client_ip}


@router.post("/track-event")
async def track_event(request: EventTrackingRequest):
    """Track page view, click, scroll, etc."""
    if not analytics_db._db_available():
        raise HTTPException(status_code=503, detail="Analytics database is unavailable")

    success = analytics_db.track_page_view(
        visitor_id=request.visitor_id,
        page=request.page or "/",
        session_id=request.session_id,
        ip_address=request.ip_address,
        device_type=request.device_type,
        browser=request.browser,
        os=request.os,
        country=request.country,
        state=request.state,
        user_agent=request.user_agent
    )
    
    if request.event_type == "click" and request.button_name:
        analytics_db.track_button_click(
            button_name=request.button_name,
            visitor_id=request.visitor_id,
            page=request.page or "/",
            session_id=request.session_id,
            ip_address=request.ip_address,
            user_agent=request.user_agent,
            device_type=request.device_type,
            browser=request.browser,
            os=request.os
        )
    elif request.event_type == "scroll" and request.scroll_depth is not None:
        analytics_db.track_scroll(
            visitor_id=request.visitor_id,
            page=request.page or "/",
            scroll_depth=request.scroll_depth,
            session_id=request.session_id,
            ip_address=request.ip_address
        )
    
    if not success:
        return {"status": "blocked", "message": "This IP is blocked"}
    
    return {"status": "success", "message": "Event tracked"}


@router.post("/track-download")
async def track_download(request: DownloadTrackingRequest):
    """Track download button click"""
    if not analytics_db._db_available():
        raise HTTPException(status_code=503, detail="Analytics database is unavailable")

    success = analytics_db.track_download_button_click(
        platform=request.platform,
        visitor_id=request.visitor_id,
        session_id=request.session_id,
        ip_address=request.ip_address,
        device_type=request.device_type or "unknown",
        browser=request.browser or "unknown",
        os=request.os or "unknown",
        user_agent=request.user_agent
    )
    
    if not success:
        return {"status": "blocked", "message": "This IP is blocked"}
    
    return {"status": "success", "message": "Download tracked"}


@router.post("/track-installer-download")
async def track_installer_download(request):
    """Track actual installer download"""
    if not analytics_db._db_available():
        raise HTTPException(status_code=503, detail="Analytics database is unavailable")

    success = analytics_db.track_installer_download(
        platform=request.platform,
        visitor_id=request.visitor_id,
        session_id=request.session_id,
        ip_address=request.ip_address,
        file_size=request.file_size,
        download_speed=request.download_speed,
        user_agent=request.user_agent
    )
    
    if not success:
        return {"status": "blocked"}
    
    return {"status": "success"}


@router.post("/track-app-launch")
async def track_app_launch(request):
    """Track app launch after installation"""
    if not analytics_db._db_available():
        raise HTTPException(status_code=503, detail="Analytics database is unavailable")

    analytics_db.track_app_launch(
        platform=request.platform,
        visitor_id=request.visitor_id,
        app_version=request.app_version
    )
    return {"status": "success"}


@router.post("/track-file-upload")
async def track_file_upload(request: FileUploadTrackingRequest):
    """Track file upload in workspace"""
    if not analytics_db._db_available():
        raise HTTPException(status_code=503, detail="Analytics database is unavailable")

    analytics_db.track_file_upload(
        visitor_id=request.visitor_id,
        session_id=request.session_id,
        file_name=request.file_name,
        file_size=request.file_size,
        file_type=request.file_type,
        success=request.upload_success,
        duration=request.upload_duration
    )
    return {"status": "success"}


@router.post("/track-query")
async def track_query(request: QueryTrackingRequest):
    """Track query submission in workspace"""
    if not analytics_db._db_available():
        raise HTTPException(status_code=503, detail="Analytics database is unavailable")

    analytics_db.track_query(
        visitor_id=request.visitor_id,
        session_id=request.session_id,
        query_length=request.query_length,
        response_time=request.response_time,
        success=request.success
    )
    return {"status": "success"}


@router.post("/track-error")
async def track_error(request: ErrorTrackingRequest):
    """Track frontend errors"""
    if not analytics_db._db_available():
        raise HTTPException(status_code=503, detail="Analytics database is unavailable")

    analytics_db.track_error(
        error_type=request.event_type,
        visitor_id=request.visitor_id,
        session_id=request.session_id,
        error_message=request.error_message,
        error_stack=request.error_stack,
        page=request.page,
        ip_address=request.ip_address
    )
    return {"status": "success"}


# ========== ADMIN ANALYTICS ENDPOINTS ==========

@router.get("/admin/dashboard")
async def get_dashboard(verified: bool = Header(None), x_admin_password: str = Header(None)):
    """Get complete dashboard overview"""
    verify_admin(x_admin_password)

    if not analytics_db._db_available():
        raise HTTPException(status_code=503, detail="Analytics database is unavailable")
    
    overview = analytics_db.get_dashboard_overview(days=30)
    return overview


@router.get("/admin/visitors")
async def get_visitor_analytics(x_admin_password: str = Header(None), days: int = 30):
    """Get visitor analytics"""
    verify_admin(x_admin_password)

    if not analytics_db._db_available():
        raise HTTPException(status_code=503, detail="Analytics database is unavailable")
    
    return {
        "total_visitors": analytics_db.get_total_visitors(days=days),
        "unique_today": analytics_db.get_unique_visitors_today(),
        "returning": analytics_db.get_returning_visitors(days=days),
        "session_analytics": analytics_db.get_session_analytics(days=days)
    }


@router.get("/admin/downloads")
async def get_download_analytics(x_admin_password: str = Header(None), days: int = 30):
    """Get download analytics"""
    verify_admin(x_admin_password)

    if not analytics_db._db_available():
        raise HTTPException(status_code=503, detail="Analytics database is unavailable")
    
    return analytics_db.get_download_analytics(days=days)


@router.get("/admin/pages")
async def get_page_analytics(x_admin_password: str = Header(None), days: int = 30):
    """Get page visit analytics"""
    verify_admin(x_admin_password)

    if not analytics_db._db_available():
        raise HTTPException(status_code=503, detail="Analytics database is unavailable")
    
    return analytics_db.get_page_analytics(days=days)


@router.get("/admin/button-clicks")
async def get_button_analytics(x_admin_password: str = Header(None), days: int = 30):
    """Get button click analytics"""
    verify_admin(x_admin_password)

    if not analytics_db._db_available():
        raise HTTPException(status_code=503, detail="Analytics database is unavailable")
    
    return analytics_db.get_button_click_analytics(days=days)


@router.get("/admin/device-analytics")
async def get_device_analytics(x_admin_password: str = Header(None), days: int = 30):
    """Get device breakdown"""
    verify_admin(x_admin_password)

    if not analytics_db._db_available():
        raise HTTPException(status_code=503, detail="Analytics database is unavailable")
    
    return analytics_db.get_device_analytics(days=days)


@router.get("/admin/browser-analytics")
async def get_browser_analytics(x_admin_password: str = Header(None), days: int = 30):
    """Get browser breakdown"""
    verify_admin(x_admin_password)
    
    return analytics_db.get_browser_analytics(days=days)


@router.get("/admin/country-analytics")
async def get_country_analytics(x_admin_password: str = Header(None), days: int = 30):
    """Get geographic analytics"""
    verify_admin(x_admin_password)
    
    return analytics_db.get_country_analytics(days=days)


@router.get("/admin/scroll-analytics")
async def get_scroll_analytics(x_admin_password: str = Header(None), days: int = 30):
    """Get scroll depth analytics"""
    verify_admin(x_admin_password)
    
    return analytics_db.get_scroll_analytics(days=days)


@router.get("/admin/workspace-analytics")
async def get_workspace_analytics(x_admin_password: str = Header(None), days: int = 30):
    """Get workspace/demo analytics"""
    verify_admin(x_admin_password)
    
    return analytics_db.get_workspace_analytics(days=days)


@router.get("/admin/errors")
async def get_error_analytics(x_admin_password: str = Header(None), days: int = 1):
    """Get error analytics"""
    verify_admin(x_admin_password)
    
    return analytics_db.get_error_analytics(days=days)


# ========== ADMIN BLOCKING ENDPOINTS ==========

@router.post("/admin/block-ip")
async def block_ip(request: BlockAddressRequest, x_admin_password: str = Header(None)):
    """Block an IP address"""
    verify_admin(x_admin_password)
    
    if not request.ip_address:
        raise HTTPException(status_code=400, detail="IP address required")
    
    success = analytics_db.add_blocked_address(
        ip_address=request.ip_address,
        reason=request.reason
    )
    
    if not success:
        return {"status": "error", "message": "IP already blocked"}
    
    return {"status": "success", "message": f"IP {request.ip_address} blocked"}


@router.post("/admin/unblock-ip")
async def unblock_ip(request: UnblockAddressRequest, x_admin_password: str = Header(None)):
    """Unblock an IP address"""
    verify_admin(x_admin_password)
    
    if not request.ip_address:
        raise HTTPException(status_code=400, detail="IP address required")
    
    success = analytics_db.remove_blocked_address(request.ip_address)
    
    if not success:
        return {"status": "error", "message": "IP not found in blocked list"}
    
    return {"status": "success", "message": f"IP {request.ip_address} unblocked"}


@router.get("/admin/blocked-ips")
async def get_blocked_ips(x_admin_password: str = Header(None)):
    """Get all blocked IPs"""
    verify_admin(x_admin_password)
    
    return {"blocked_addresses": analytics_db.get_blocked_addresses()}
