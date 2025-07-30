# 6. Message Queue Infrastructure

## 6.1. Event-Driven Architecture

```yaml
event_architecture:
  message_broker:
    primary: Apache Kafka
    fallback: RabbitMQ
    cluster_size: 3 brokers minimum

  topics:
    user_events:
      partitions: 12
      replication_factor: 3
      retention: 7 days

    project_events:
      partitions: 24
      replication_factor: 3
      retention: 30 days

    canvas_events:
      partitions: 48
      replication_factor: 3
      retention: 7 days

    pipeline_events:
      partitions: 12
      replication_factor: 3
      retention: 90 days

    system_events:
      partitions: 6
      replication_factor: 3
      retention: 30 days

  consumers:
    real_time_sync:
      group_id: realtime-sync-group
      auto_offset_reset: latest
      max_poll_records: 100

    notification_processor:
      group_id: notification-group
      auto_offset_reset: earliest
      max_poll_records: 50

    analytics_collector:
      group_id: analytics-group
      auto_offset_reset: earliest
      max_poll_records: 1000

    pipeline_orchestrator:
      group_id: pipeline-group
      auto_offset_reset: earliest
      max_poll_records: 10

  schema_registry:
    url: http://schema-registry:8081
    compatibility: BACKWARD
    security: SSL/SASL
```

## 6.2. Event Patterns

```python
# Event Schema Examples
from typing import Dict, Any, Optional
from datetime import datetime
from enum import Enum

class EventType(Enum):
    USER_CREATED = "user.created"
    USER_UPDATED = "user.updated"
    PROJECT_CREATED = "project.created"
    PROJECT_SHARED = "project.shared"
    CANVAS_MODIFIED = "canvas.modified"
    PIPELINE_STARTED = "pipeline.started"
    PIPELINE_COMPLETED = "pipeline.completed"
    PIPELINE_FAILED = "pipeline.failed"

class BaseEvent:
    def __init__(
        self,
        event_type: EventType,
        source_service: str,
        entity_id: str,
        user_id: Optional[str] = None,
        organization_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        self.event_id = str(uuid.uuid4())
        self.event_type = event_type
        self.source_service = source_service
        self.entity_id = entity_id
        self.user_id = user_id
        self.organization_id = organization_id
        self.timestamp = datetime.utcnow()
        self.metadata = metadata or {}

# Usage Examples
class PipelineEventProducer:
    async def pipeline_started(self, pipeline_id: str, user_id: str):
        event = BaseEvent(
            event_type=EventType.PIPELINE_STARTED,
            source_service="pipeline-service",
            entity_id=pipeline_id,
            user_id=user_id,
            metadata={
                "pipeline_name": "Daily Sales Sync",
                "estimated_duration": "5 minutes",
                "scheduled": True
            }
        )
        await self.publish_event(event)

    async def pipeline_completed(self, pipeline_id: str, metrics: Dict):
        event = BaseEvent(
            event_type=EventType.PIPELINE_COMPLETED,
            source_service="pipeline-service",
            entity_id=pipeline_id,
            metadata={
                "duration": metrics["duration"],
                "rows_processed": metrics["rows_processed"],
                "success": True
            }
        )
        await self.publish_event(event)
```

## 6.3. Event Patterns

```python
# Comprehensive Event Schema Definitions for Jabiru Platform
from typing import Dict, Any, Optional, List
from datetime import datetime
from enum import Enum
import uuid

class EventPriority(Enum):
    LOW = "low"
    NORMAL = "normal" 
    HIGH = "high"
    CRITICAL = "critical"

class EventCategory(Enum):
    USER = "user"
    PROJECT = "project"
    DATA = "data"
    ANALYTICS = "analytics"
    COLLABORATION = "collaboration"
    SYSTEM = "system"
    SECURITY = "security"

class BaseEventV2:
    """Enhanced base event class with additional metadata"""
    def __init__(
        self,
        event_type: EventType,
        source_service: str,
        entity_id: str,
        user_id: Optional[str] = None,
        organization_id: Optional[str] = None,
        correlation_id: Optional[str] = None,
        priority: EventPriority = EventPriority.NORMAL,
        category: EventCategory = EventCategory.SYSTEM,
        metadata: Optional[Dict[str, Any]] = None
    ):
        self.event_id = str(uuid.uuid4())
        self.event_type = event_type
        self.source_service = source_service
        self.entity_id = entity_id
        self.user_id = user_id
        self.organization_id = organization_id
        self.correlation_id = correlation_id or str(uuid.uuid4())
        self.timestamp = datetime.utcnow()
        self.priority = priority
        self.category = category
        self.metadata = metadata or {}
        self.version = "2.0"

# Extended Event Types
class ExtendedEventType(Enum):
    # User Events
    USER_CREATED = "user.created"
    USER_UPDATED = "user.updated"
    USER_DELETED = "user.deleted"
    USER_LOGIN = "user.login"
    USER_LOGOUT = "user.logout"
    USER_INVITED = "user.invited"
    
    # Project Events
    PROJECT_CREATED = "project.created"
    PROJECT_UPDATED = "project.updated"
    PROJECT_DELETED = "project.deleted"
    PROJECT_SHARED = "project.shared"
    PROJECT_EXPORTED = "project.exported"
    
    # Canvas Events
    CANVAS_CREATED = "canvas.created"
    CANVAS_MODIFIED = "canvas.modified"
    CANVAS_DELETED = "canvas.deleted"
    CANVAS_SHARED = "canvas.shared"
    CANVAS_COMMENTED = "canvas.commented"
    
    # Data Events
    DATA_UPLOADED = "data.uploaded"
    DATA_PROCESSED = "data.processed"
    DATA_TRANSFORMED = "data.transformed"
    DATA_QUALITY_CHECK = "data.quality_check"
    DATA_EXPORT = "data.export"
    
    # Pipeline Events
    PIPELINE_CREATED = "pipeline.created"
    PIPELINE_STARTED = "pipeline.started"
    PIPELINE_COMPLETED = "pipeline.completed"
    PIPELINE_FAILED = "pipeline.failed"
    PIPELINE_PAUSED = "pipeline.paused"
    PIPELINE_RESUMED = "pipeline.resumed"
    
    # AI Events
    AI_QUERY_SUBMITTED = "ai.query_submitted"
    AI_RESPONSE_GENERATED = "ai.response_generated"
    AI_SUGGESTION_ACCEPTED = "ai.suggestion_accepted"
    AI_SUGGESTION_REJECTED = "ai.suggestion_rejected"
    
    # Collaboration Events
    COMMENT_ADDED = "collaboration.comment_added"
    MENTION_CREATED = "collaboration.mention_created"
    SHARE_LINK_CREATED = "collaboration.share_link_created"
    REAL_TIME_SESSION_STARTED = "collaboration.session_started"
    REAL_TIME_SESSION_ENDED = "collaboration.session_ended"
    
    # System Events
    SERVICE_HEALTH_CHECK = "system.health_check"
    SERVICE_ERROR = "system.error"
    RATE_LIMIT_EXCEEDED = "system.rate_limit_exceeded"
    STORAGE_THRESHOLD = "system.storage_threshold"
    
    # Security Events
    SECURITY_ALERT = "security.alert"
    ACCESS_DENIED = "security.access_denied"
    SUSPICIOUS_ACTIVITY = "security.suspicious_activity"

# Event Payload Schemas
class DataUploadedPayload:
    def __init__(
        self,
        file_name: str,
        file_size: int,
        file_type: str,
        source_type: str,
        project_id: str,
        upload_duration: float,
        validation_status: str
    ):
        self.file_name = file_name
        self.file_size = file_size
        self.file_type = file_type
        self.source_type = source_type
        self.project_id = project_id
        self.upload_duration = upload_duration
        self.validation_status = validation_status

class PipelineEventPayload:
    def __init__(
        self,
        pipeline_id: str,
        pipeline_name: str,
        pipeline_version: str,
        stage: str,
        duration: Optional[float] = None,
        records_processed: Optional[int] = None,
        error_message: Optional[str] = None,
        retry_count: int = 0
    ):
        self.pipeline_id = pipeline_id
        self.pipeline_name = pipeline_name
        self.pipeline_version = pipeline_version
        self.stage = stage
        self.duration = duration
        self.records_processed = records_processed
        self.error_message = error_message
        self.retry_count = retry_count

class CollaborationEventPayload:
    def __init__(
        self,
        resource_type: str,  # 'canvas', 'project', 'comment'
        resource_id: str,
        action: str,
        participants: List[str],
        session_id: Optional[str] = None,
        changes: Optional[Dict[str, Any]] = None
    ):
        self.resource_type = resource_type
        self.resource_id = resource_id
        self.action = action
        self.participants = participants
        self.session_id = session_id
        self.changes = changes or {}

# Event Producer Examples
class EnhancedEventProducer:
    async def emit_data_upload_event(
        self, 
        file_info: Dict[str, Any], 
        user_id: str,
        project_id: str
    ):
        payload = DataUploadedPayload(
            file_name=file_info['name'],
            file_size=file_info['size'],
            file_type=file_info['type'],
            source_type=file_info['source'],
            project_id=project_id,
            upload_duration=file_info['duration'],
            validation_status=file_info['validation_status']
        )
        
        event = BaseEventV2(
            event_type=ExtendedEventType.DATA_UPLOADED,
            source_service="file-service",
            entity_id=file_info['file_id'],
            user_id=user_id,
            priority=EventPriority.NORMAL,
            category=EventCategory.DATA,
            metadata=payload.__dict__
        )
        
        await self.publish_event(event)
    
    async def emit_pipeline_event(
        self,
        pipeline_info: Dict[str, Any],
        event_type: ExtendedEventType,
        priority: EventPriority = EventPriority.NORMAL
    ):
        payload = PipelineEventPayload(
            pipeline_id=pipeline_info['id'],
            pipeline_name=pipeline_info['name'],
            pipeline_version=pipeline_info['version'],
            stage=pipeline_info['stage'],
            duration=pipeline_info.get('duration'),
            records_processed=pipeline_info.get('records_processed'),
            error_message=pipeline_info.get('error_message'),
            retry_count=pipeline_info.get('retry_count', 0)
        )
        
        event = BaseEventV2(
            event_type=event_type,
            source_service="pipeline-service",
            entity_id=pipeline_info['id'],
            user_id=pipeline_info.get('user_id'),
            priority=priority,
            category=EventCategory.ANALYTICS,
            metadata=payload.__dict__
        )
        
        await self.publish_event(event)
    
    async def emit_collaboration_event(
        self,
        resource_info: Dict[str, Any],
        event_type: ExtendedEventType,
        participants: List[str]
    ):
        payload = CollaborationEventPayload(
            resource_type=resource_info['type'],
            resource_id=resource_info['id'],
            action=resource_info['action'],
            participants=participants,
            session_id=resource_info.get('session_id'),
            changes=resource_info.get('changes')
        )
        
        event = BaseEventV2(
            event_type=event_type,
            source_service="collaboration-service",
            entity_id=resource_info['id'],
            user_id=resource_info.get('initiator_id'),
            priority=EventPriority.HIGH if len(participants) > 5 else EventPriority.NORMAL,
            category=EventCategory.COLLABORATION,
            metadata=payload.__dict__
        )
        
        await self.publish_event(event)

# Event Consumer Patterns
class EventConsumerPatterns:
    """Examples of event consumption patterns"""
    
    async def handle_pipeline_events(self, event: BaseEventV2):
        """Process pipeline-related events"""
        if event.event_type == ExtendedEventType.PIPELINE_FAILED:
            # Trigger retry logic
            if event.metadata['retry_count'] < 3:
                await self.retry_pipeline(event.entity_id)
            else:
                await self.alert_ops_team(event)
        
        elif event.event_type == ExtendedEventType.PIPELINE_COMPLETED:
            # Update metrics and notify stakeholders
            await self.update_pipeline_metrics(event)
            await self.notify_completion(event)
    
    async def handle_collaboration_events(self, event: BaseEventV2):
        """Process collaboration events for real-time sync"""
        if event.category == EventCategory.COLLABORATION:
            # Broadcast to all participants
            participants = event.metadata.get('participants', [])
            for participant_id in participants:
                if participant_id != event.user_id:
                    await self.send_realtime_update(participant_id, event)
    
    async def handle_security_events(self, event: BaseEventV2):
        """Process security-related events"""
        if event.priority == EventPriority.CRITICAL:
            # Immediate action required
            await self.trigger_security_protocol(event)
            await self.notify_security_team(event)
        
        # Log all security events
        await self.log_security_event(event)

# Event Stream Configuration
EVENT_STREAM_CONFIG = {
    "user_events": {
        "partitions": 12,
        "retention_days": 30,
        "compression": "snappy",
        "priority_routing": True
    },
    "data_events": {
        "partitions": 24,
        "retention_days": 90,
        "compression": "lz4",
        "batch_size": 1000
    },
    "pipeline_events": {
        "partitions": 12,
        "retention_days": 180,
        "compression": "gzip",
        "guaranteed_delivery": True
    },
    "collaboration_events": {
        "partitions": 48,
        "retention_days": 7,
        "compression": "snappy",
        "low_latency": True
    },
    "security_events": {
        "partitions": 6,
        "retention_days": 365,
        "compression": "gzip",
        "encryption": True,
        "audit_log": True
    }
}
```