package com.liveeuy.catalog_service.config;

public class MessageConstants {
    
    private MessageConstants() {
        
    }

    public static final class Media {
        public static final String FEATURED_SUCCESS = "Featured media retrieved successfully";
        public static final String FEATURED_EMPTY = "Catalog Service is Online (no featured media yet)";
        public static final String FEED_DEFAULT = "Curated media catalog feed";
        public static final String FEED_MEMBER_PREFIX = "Curated media catalog feed for member ";
        public static final String CREATED = "Media created successfully";
        public static final String UPDATED = "Media updated successfully";
        public static final String DELETED = "Media deleted successfully";
        public static final String TRANSCODE_LINKED = "Transcoding job linked successfully";
        public static final String TRANSCODE_SYNCED = "Transcoding status synchronized successfully";

        private Media() {}
    }

    public static final class TvHierarchy {
        public static final String SEASON_ADDED = "Season added successfully to TV Series";
        public static final String EPISODE_ADDED = "Episode added successfully to Season";

        private TvHierarchy() {}
    }

    public static final class Error {
        public static final String INTERNAL_SERVER_ERROR =
                "An internal server error occurred.";
        public static final String TYPE_CONFLICT =
                "Data conflict: The media type in the database does not match the request payload.";
        public static final String MEDIA_NOT_TV_SERIES =
                "Failed to add season: This media is a Movie, not a TV Series.";
        public static String mediaNotFound(String id) {
            return "Media with ID '" + id + "' was not found.";
        }
        public static String seasonNotFound(String id) {
            return "Season with ID '" + id + "' was not found.";
        }
        private Error() {}
    }

    public static final class Security {
        public static final String FORBIDDEN =
                "Forbidden: You do not have the required role to access this resource.";
        public static String unauthorized(String detail) {
            return "Unauthorized: The authentication token is invalid or missing (" + detail + ")";
        }
    }
}
