from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import DuplicateKeyError, ServerSelectionTimeoutError, OperationFailure, PyMongoError
from datetime import datetime, timedelta
from typing import List, Optional
import os
import logging

logger = logging.getLogger(__name__)

MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = "CorelignWeb-Admin"

class AnalyticsDB:
    def __init__(self, mongo_uri: str = MONGO_URI, db_name: str = DB_NAME):
        try:
            # Initialize with longer timeout for connection
            self.client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000, retryWrites=True)
            self.db = self.client[db_name]
            # Test connection immediately
            self.client.admin.command('ping')
            self.init_collections()
            logger.info("MongoDB connected successfully")
        except (ServerSelectionTimeoutError, OperationFailure, PyMongoError, Exception) as e:
            logger.error(f"MongoDB connection failed: {e}")
            self.client = None
            self.db = None
            # Don't raise - allow server to continue running

    def _db_available(self) -> bool:
        return self.db is not None

    def init_collections(self):
        """Initialize all collections and indexes"""
        if not self.db:
            logger.warning("Database not initialized, skipping collection setup")
            return
        
        try:
            # Visitors collection
            self.db.visitors.create_index([("visitor_id", ASCENDING)], unique=True)
            self.db.visitors.create_index([("ip_address", ASCENDING)])
            self.db.visitors.create_index([("last_visit", DESCENDING)])

            # Events collection
            self.db.events.create_index([("visitor_id", ASCENDING)])
            self.db.events.create_index([("event_type", ASCENDING)])
            self.db.events.create_index([("button_name", ASCENDING)])
            self.db.events.create_index([("timestamp", DESCENDING)])
            self.db.events.create_index([("page", ASCENDING)])

            # Downloads collection
            self.db.downloads.create_index([("visitor_id", ASCENDING)])
            self.db.downloads.create_index([("platform", ASCENDING)])
            self.db.downloads.create_index([("event_type", ASCENDING)])
            self.db.downloads.create_index([("timestamp", DESCENDING)])

            # Workspace/Demo tracking
            self.db.workspace_events.create_index([("visitor_id", ASCENDING)])
            self.db.workspace_events.create_index([("event_type", ASCENDING)])
            self.db.workspace_events.create_index([("timestamp", DESCENDING)])

            # Errors tracking
            self.db.errors.create_index([("visitor_id", ASCENDING)])
            self.db.errors.create_index([("error_type", ASCENDING)])
            self.db.errors.create_index([("timestamp", DESCENDING)])

            # Blocked addresses
            self.db.blocked_addresses.create_index([("ip_address", ASCENDING)])
            self.db.blocked_addresses.create_index([("mac_address", ASCENDING)])
        except Exception as e:
            logger.error(f"Error creating indexes: {e}")

    def is_blocked(self, ip_address: Optional[str], mac_address: Optional[str]) -> bool:
        """Check if IP or MAC is blocked"""
        if not self.db:
            return False
            
        if ip_address:
            if self.db.blocked_addresses.find_one({"ip_address": ip_address}):
                return True
        if mac_address:
            if self.db.blocked_addresses.find_one({"mac_address": mac_address}):
                return True
        return False

    # ========== VISITOR TRACKING ==========

    def track_visitor(self, visitor_id: str, ip_address: str, user_agent: str,
                     device_type: Optional[str], browser: Optional[str], os: Optional[str],
                     country: Optional[str], state: Optional[str]) -> bool:
        """Track or update visitor"""
        if not self.db:
            logger.warning("Database not available for visitor tracking")
            return False
            
        if self.is_blocked(ip_address, None):
            return False

        try:
            self.db.visitors.update_one(
                {"visitor_id": visitor_id},
                {
                    "$set": {
                        "ip_address": ip_address,
                        "user_agent": user_agent,
                        "device_type": device_type,
                        "browser": browser,
                        "os": os,
                        "country": country,
                        "state": state,
                        "last_visit": datetime.utcnow()
                    },
                    "$setOnInsert": {
                        "first_visit": datetime.utcnow(),
                        "visit_count": 1
                    },
                    "$inc": {"visit_count": 1}
                },
                upsert=True
            )
            return True
        except Exception as e:
            logger.error(f"Error tracking visitor: {e}")
            return False

    # ========== PAGE VIEW TRACKING ==========

    def track_page_view(self, visitor_id: str, page: str, session_id: str, ip_address: str,
                       device_type: Optional[str], browser: Optional[str], os: Optional[str],
                       country: Optional[str], state: Optional[str], user_agent: str) -> bool:
        """Track page view"""
        if not self.db:
            logger.warning("Database not available for page view tracking")
            return False
            
        if self.is_blocked(ip_address, None):
            return False

        try:
            self.track_visitor(visitor_id, ip_address, user_agent, device_type, browser, os, country, state)

            self.db.events.insert_one({
                "event_type": "page_view",
                "page": page,
                "visitor_id": visitor_id,
                "session_id": session_id,
                "ip_address": ip_address,
                "user_agent": user_agent,
                "timestamp": datetime.utcnow()
            })
            return True
        except Exception as e:
            logger.error(f"Error tracking page view: {e}")
            return False

    # ========== BUTTON CLICK TRACKING ==========

    def track_button_click(self, button_name: str, visitor_id: str, page: str, session_id: str,
                          ip_address: str, user_agent: str) -> bool:
        """Track button clicks"""
        if not self.db:
            logger.warning("Database not available for button click tracking")
            return False
            
        if self.is_blocked(ip_address, None):
            return False

        try:
            self.db.events.insert_one({
                "event_type": "click",
                "button_name": button_name,
                "page": page,
                "visitor_id": visitor_id,
                "session_id": session_id,
                "ip_address": ip_address,
                "user_agent": user_agent,
                "timestamp": datetime.utcnow()
            })
            return True
        except Exception as e:
            logger.error(f"Error tracking button click: {e}")
            return False

    # ========== SCROLL TRACKING ==========

    def track_scroll(self, visitor_id: str, page: str, scroll_depth: float,
                    session_id: str, ip_address: str) -> bool:
        """Track scroll depth"""
        if not self._db_available():
            logger.warning("Database not available for scroll tracking")
            return False

        if self.is_blocked(ip_address, None):
            return False

        self.db.events.insert_one({
            "event_type": "scroll",
            "page": page,
            "scroll_depth": scroll_depth,
            "visitor_id": visitor_id,
            "session_id": session_id,
            "ip_address": ip_address,
            "timestamp": datetime.utcnow()
        })
        return True

    # ========== DOWNLOAD TRACKING ==========

    def track_download_button_click(self, platform: str, visitor_id: str, session_id: str,
                                   ip_address: str, device_type: str, browser: str,
                                   os: str, user_agent: str) -> bool:
        """Track download button click"""
        if not self._db_available():
            logger.warning("Database not available for download tracking")
            return False

        if self.is_blocked(ip_address, None):
            return False

        self.db.downloads.insert_one({
            "event_type": "button_click",
            "platform": platform,
            "visitor_id": visitor_id,
            "session_id": session_id,
            "ip_address": ip_address,
            "device_type": device_type,
            "browser": browser,
            "os": os,
            "user_agent": user_agent,
            "timestamp": datetime.utcnow()
        })
        return True

    def track_installer_download(self, platform: str, visitor_id: str, session_id: str,
                                ip_address: str, file_size: Optional[float],
                                download_speed: Optional[float], user_agent: str) -> bool:
        """Track actual installer download"""
        if not self._db_available():
            logger.warning("Database not available for installer download tracking")
            return False

        if self.is_blocked(ip_address, None):
            return False

        self.db.downloads.insert_one({
            "event_type": "installer_downloaded",
            "platform": platform,
            "visitor_id": visitor_id,
            "session_id": session_id,
            "ip_address": ip_address,
            "file_size": file_size,
            "download_speed": download_speed,
            "user_agent": user_agent,
            "timestamp": datetime.utcnow()
        })
        return True

    def track_app_launch(self, platform: str, visitor_id: str, app_version: Optional[str]) -> bool:
        """Track app launch after installation"""
        if not self._db_available():
            logger.warning("Database not available for app launch tracking")
            return False

        self.db.downloads.insert_one({
            "event_type": "app_launched",
            "platform": platform,
            "visitor_id": visitor_id,
            "app_version": app_version,
            "timestamp": datetime.utcnow()
        })
        return True

    # ========== WORKSPACE/DEMO TRACKING ==========

    def track_file_upload(self, visitor_id: str, session_id: str, file_name: Optional[str],
                         file_size: Optional[float], file_type: Optional[str],
                         success: bool, duration: Optional[float]) -> bool:
        """Track file upload"""
        if not self._db_available():
            logger.warning("Database not available for file upload tracking")
            return False

        self.db.workspace_events.insert_one({
            "event_type": "file_upload",
            "visitor_id": visitor_id,
            "session_id": session_id,
            "file_name": file_name,
            "file_size": file_size,
            "file_type": file_type,
            "success": success,
            "duration": duration,
            "timestamp": datetime.utcnow()
        })
        return True

    def track_query(self, visitor_id: str, session_id: str, query_length: Optional[int],
                   response_time: Optional[float], success: bool) -> bool:
        """Track query submission"""
        if not self._db_available():
            logger.warning("Database not available for query tracking")
            return False

        self.db.workspace_events.insert_one({
            "event_type": "query",
            "visitor_id": visitor_id,
            "session_id": session_id,
            "query_length": query_length,
            "response_time": response_time,
            "success": success,
            "timestamp": datetime.utcnow()
        })
        return True

    # ========== ERROR TRACKING ==========

    def track_error(self, error_type: str, visitor_id: str, session_id: Optional[str],
                   error_message: Optional[str], error_stack: Optional[str],
                   page: Optional[str], ip_address: str) -> bool:
        """Track errors"""
        if not self._db_available():
            logger.warning("Database not available for error tracking")
            return False

        if self.is_blocked(ip_address, None):
            return False

        self.db.errors.insert_one({
            "error_type": error_type,
            "error_message": error_message,
            "error_stack": error_stack,
            "page": page,
            "visitor_id": visitor_id,
            "session_id": session_id,
            "ip_address": ip_address,
            "timestamp": datetime.utcnow()
        })
        return True

    # ========== BLOCKING MANAGEMENT ==========

    def add_blocked_address(self, ip_address: Optional[str], reason: Optional[str]) -> bool:
        """Block an IP address"""
        if not self._db_available():
            return False

        try:
            self.db.blocked_addresses.insert_one({
                "ip_address": ip_address,
                "reason": reason,
                "blocked_at": datetime.utcnow()
            })
            return True
        except DuplicateKeyError:
            return False

    def remove_blocked_address(self, ip_address: str) -> bool:
        """Unblock an IP address"""
        if not self._db_available():
            return False

        result = self.db.blocked_addresses.delete_one({"ip_address": ip_address})
        return result.deleted_count > 0

    def get_blocked_addresses(self) -> List[dict]:
        """Get all blocked addresses"""
        if not self._db_available():
            return []

        blocked = list(self.db.blocked_addresses.find({}, {"_id": 0}))
        for item in blocked:
            if "blocked_at" in item:
                item["blocked_at"] = item["blocked_at"].isoformat()
        return blocked

    # ========== ANALYTICS QUERIES ==========

    def get_total_visitors(self, days: int = 30) -> int:
        """Get total unique visitors"""
        if not self._db_available():
            return 0

        cutoff = datetime.utcnow() - timedelta(days=days)
        unique = self.db.visitors.count_documents({"first_visit": {"$gt": cutoff}})
        return unique

    def get_unique_visitors_today(self) -> int:
        """Get unique visitors today"""
        return self.get_total_visitors(days=1)

    def get_returning_visitors(self, days: int = 30) -> int:
        """Get returning visitors (visit_count > 1)"""
        if not self._db_available():
            return 0

        cutoff = datetime.utcnow() - timedelta(days=days)
        count = self.db.visitors.count_documents({
            "first_visit": {"$lt": cutoff},
            "last_visit": {"$gt": cutoff},
            "visit_count": {"$gt": 1}
        })
        return count

    def get_page_analytics(self, days: int = 30) -> List[dict]:
        """Get analytics per page"""
        if not self._db_available():
            return []

        cutoff = datetime.utcnow() - timedelta(days=days)
        pipeline = [
            {"$match": {"event_type": "page_view", "timestamp": {"$gt": cutoff}}},
            {
                "$group": {
                    "_id": "$page",
                    "total_visits": {"$sum": 1},
                    "unique_visitors": {"$addToSet": "$visitor_id"},
                    "avg_scroll": {"$avg": "$scroll_depth"}
                }
            },
            {
                "$project": {
                    "page": "$_id",
                    "total_visits": 1,
                    "unique_visitors": {"$size": "$unique_visitors"},
                    "avg_scroll_depth": {"$ifNull": ["$avg_scroll", 0]},
                    "_id": 0
                }
            },
            {"$sort": {"total_visits": -1}}
        ]
        return list(self.db.events.aggregate(pipeline))

    def get_button_click_analytics(self, days: int = 30) -> List[dict]:
        """Get button click analytics"""
        if not self._db_available():
            return []

        cutoff = datetime.utcnow() - timedelta(days=days)
        pipeline = [
            {"$match": {"event_type": "click", "timestamp": {"$gt": cutoff}, "button_name": {"$ne": None}}},
            {
                "$group": {
                    "_id": "$button_name",
                    "total_clicks": {"$sum": 1},
                    "unique_users": {"$addToSet": "$visitor_id"}
                }
            },
            {
                "$project": {
                    "button_name": "$_id",
                    "total_clicks": 1,
                    "unique_users": {"$size": "$unique_users"},
                    "repeated_users": {"$subtract": ["$total_clicks", {"$size": "$unique_users"}]},
                    "_id": 0
                }
            },
            {"$sort": {"total_clicks": -1}}
        ]
        return list(self.db.events.aggregate(pipeline))

    def get_download_analytics(self, days: int = 30) -> dict:
        """Get download analytics by platform"""
        if not self._db_available():
            return {
                "button_clicks": {"windows": 0, "linux": 0, "mac": 0},
                "installer_downloads": {"windows": 0, "linux": 0, "mac": 0},
                "app_launches": {"windows": 0, "linux": 0, "mac": 0},
                "total_downloads": 0,
            }

        cutoff = datetime.utcnow() - timedelta(days=days)
        
        # Button clicks
        button_clicks = {}
        for platform in ["windows", "linux", "mac"]:
            count = self.db.downloads.count_documents({
                "event_type": "button_click",
                "platform": platform,
                "timestamp": {"$gt": cutoff}
            })
            button_clicks[platform] = count

        # Installer downloads
        installer_downloads = {}
        for platform in ["windows", "linux", "mac"]:
            count = self.db.downloads.count_documents({
                "event_type": "installer_downloaded",
                "platform": platform,
                "timestamp": {"$gt": cutoff}
            })
            installer_downloads[platform] = count

        # App launches
        app_launches = {}
        for platform in ["windows", "linux", "mac"]:
            count = self.db.downloads.count_documents({
                "event_type": "app_launched",
                "platform": platform,
                "timestamp": {"$gt": cutoff}
            })
            app_launches[platform] = count

        return {
            "button_clicks": button_clicks,
            "installer_downloads": installer_downloads,
            "app_launches": app_launches,
            "total_downloads": sum(installer_downloads.values())
        }

    def get_device_analytics(self, days: int = 30) -> List[dict]:
        """Get device breakdown"""
        if not self._db_available():
            return []

        cutoff = datetime.utcnow() - timedelta(days=days)
        pipeline = [
            {"$match": {"timestamp": {"$gt": cutoff}, "device_type": {"$ne": None}}},
            {
                "$group": {
                    "_id": "$device_type",
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"count": -1}}
        ]
        results = list(self.db.visitors.aggregate(pipeline))
        total = sum(r["count"] for r in results)
        
        for r in results:
            r["device_type"] = r.pop("_id")
            r["percentage"] = round((r["count"] / total) * 100, 2) if total > 0 else 0
        
        return results

    def get_browser_analytics(self, days: int = 30) -> List[dict]:
        """Get browser breakdown"""
        if not self._db_available():
            return []

        cutoff = datetime.utcnow() - timedelta(days=days)
        pipeline = [
            {"$match": {"timestamp": {"$gt": cutoff}, "browser": {"$ne": None}}},
            {
                "$group": {
                    "_id": "$browser",
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]
        results = list(self.db.visitors.aggregate(pipeline))
        total = sum(r["count"] for r in results)
        
        for r in results:
            r["browser"] = r.pop("_id")
            r["percentage"] = round((r["count"] / total) * 100, 2) if total > 0 else 0
        
        return results

    def get_country_analytics(self, days: int = 30) -> List[dict]:
        """Get geographic breakdown"""
        if not self._db_available():
            return []

        cutoff = datetime.utcnow() - timedelta(days=days)
        pipeline = [
            {"$match": {"last_visit": {"$gt": cutoff}, "country": {"$ne": None}}},
            {
                "$group": {
                    "_id": "$country",
                    "visitors": {"$sum": 1}
                }
            },
            {"$sort": {"visitors": -1}},
            {"$limit": 20}
        ]
        results = list(self.db.visitors.aggregate(pipeline))
        
        for r in results:
            r["country"] = r.pop("_id")
        
        return results

    def get_scroll_analytics(self, days: int = 30) -> dict:
        """Get scroll depth analytics"""
        if not self._db_available():
            return {
                "0-25%": {"user_count": 0, "percentage": 0},
                "25-50%": {"user_count": 0, "percentage": 0},
                "50-75%": {"user_count": 0, "percentage": 0},
                "75-100%": {"user_count": 0, "percentage": 0},
            }

        cutoff = datetime.utcnow() - timedelta(days=days)
        
        ranges = {
            "0-25%": {"$lt": 25},
            "25-50%": {"$gte": 25, "$lt": 50},
            "50-75%": {"$gte": 50, "$lt": 75},
            "75-100%": {"$gte": 75}
        }
        
        result = {}
        total_scrolls = 0
        
        for range_label, range_query in ranges.items():
            count = self.db.events.count_documents({
                "event_type": "scroll",
                "timestamp": {"$gt": cutoff},
                "scroll_depth": range_query
            })
            result[range_label] = count
            total_scrolls += count
        
        # Calculate percentages
        for range_label in result:
            result[range_label] = {
                "user_count": result[range_label],
                "percentage": round((result[range_label] / total_scrolls) * 100, 2) if total_scrolls > 0 else 0
            }
        
        return result

    def get_workspace_analytics(self, days: int = 30) -> dict:
        """Get workspace/demo analytics"""
        if not self._db_available():
            return {
                "successful_uploads": 0,
                "failed_uploads": 0,
                "total_uploads": 0,
                "successful_queries": 0,
                "failed_queries": 0,
                "total_queries": 0,
            }

        cutoff = datetime.utcnow() - timedelta(days=days)
        
        uploads = self.db.workspace_events.count_documents({
            "event_type": "file_upload",
            "timestamp": {"$gt": cutoff},
            "success": True
        })
        
        failed_uploads = self.db.workspace_events.count_documents({
            "event_type": "file_upload",
            "timestamp": {"$gt": cutoff},
            "success": False
        })
        
        queries = self.db.workspace_events.count_documents({
            "event_type": "query",
            "timestamp": {"$gt": cutoff},
            "success": True
        })
        
        failed_queries = self.db.workspace_events.count_documents({
            "event_type": "query",
            "timestamp": {"$gt": cutoff},
            "success": False
        })
        
        return {
            "successful_uploads": uploads,
            "failed_uploads": failed_uploads,
            "total_uploads": uploads + failed_uploads,
            "successful_queries": queries,
            "failed_queries": failed_queries,
            "total_queries": queries + failed_queries
        }

    def get_error_analytics(self, days: int = 1) -> dict:
        """Get error statistics"""
        if not self._db_available():
            return {"total_errors": 0, "by_type": {}}

        cutoff = datetime.utcnow() - timedelta(days=days)
        
        pipeline = [
            {"$match": {"timestamp": {"$gt": cutoff}}},
            {
                "$group": {
                    "_id": "$error_type",
                    "count": {"$sum": 1}
                }
            }
        ]
        
        errors = list(self.db.errors.aggregate(pipeline))
        result = {}
        total = 0
        
        for err in errors:
            result[err["_id"]] = err["count"]
            total += err["count"]
        
        return {"total_errors": total, "by_type": result}

    def get_session_analytics(self, days: int = 30) -> dict:
        """Get session analytics"""
        if not self._db_available():
            return {
                "total_sessions": 0,
                "returning_visitors": 0,
                "new_visitors": 0,
                "total_unique_visitors": 0,
                "returning_percentage": 0,
            }

        cutoff = datetime.utcnow() - timedelta(days=days)
        
        total_sessions = self.db.events.distinct(
            "session_id",
            {"timestamp": {"$gt": cutoff}}
        )
        
        returning = self.db.visitors.count_documents({
            "visit_count": {"$gt": 1},
            "last_visit": {"$gt": cutoff}
        })
        
        new_visitors = self.db.visitors.count_documents({
            "first_visit": {"$gt": cutoff}
        })
        
        total_visitors = self.db.events.distinct(
            "visitor_id",
            {"timestamp": {"$gt": cutoff}}
        )
        
        return {
            "total_sessions": len(total_sessions),
            "returning_visitors": returning,
            "new_visitors": new_visitors,
            "total_unique_visitors": len(total_visitors),
            "returning_percentage": round((returning / len(total_visitors) * 100), 2) if total_visitors else 0
        }

    def get_dashboard_overview(self, days: int = 30) -> dict:
        """Get complete dashboard overview"""
        if not self._db_available():
            return {
                "total_visitors": 0,
                "unique_visitors_today": 0,
                "returning_visitors": 0,
                "session_analytics": self.get_session_analytics(days=days),
                "download_analytics": self.get_download_analytics(days=days),
                "button_clicks": [],
                "top_pages": [],
                "device_breakdown": [],
                "error_count_today": 0,
                "workspace_analytics": self.get_workspace_analytics(days=days),
            }

        today_downloads = self.get_download_analytics(days=1)
        downloads = self.get_download_analytics(days=days)
        
        return {
            "total_visitors": self.get_total_visitors(days=days),
            "unique_visitors_today": self.get_unique_visitors_today(),
            "returning_visitors": self.get_returning_visitors(days=days),
            "session_analytics": self.get_session_analytics(days=days),
            "download_analytics": downloads,
            "button_clicks": self.get_button_click_analytics(days=days)[:5],
            "top_pages": self.get_page_analytics(days=days)[:5],
            "device_breakdown": self.get_device_analytics(days=days),
            "error_count_today": self.get_error_analytics(days=1)["total_errors"],
            "workspace_analytics": self.get_workspace_analytics(days=days)
        }


# Initialize global instance
analytics_db = AnalyticsDB()
