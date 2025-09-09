from celery import Celery
from kombu import Queue
from app.core.config import settings

celery_app = Celery(
    "tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.tasks"]
)

celery_app.conf.task_queues = (
    Queue('default', routing_key='task.default'),
    Queue('high_priority', routing_key='task.high_priority'),
)

celery_app.conf.task_default_queue = 'default'
celery_app.conf.task_default_exchange = 'default'
celery_app.conf.task_default_routing_key = 'task.default'

celery_app.conf.worker_log_format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
celery_app.conf.worker_task_log_format = '%(asctime)s - %(task_name)s[%(task_id)s] - %(levelname)s - %(message)s'


task_routes = {
    'app.tasks.process_contribution': {
        'queue': 'default',
        'routing_key': 'task.default',
    },
    'app.tasks.send_contact_sales_email_task': {
        'queue': 'high_priority',
        'routing_key': 'task.high_priority',
    },
    'app.tasks.send_business_verification_email_task': {
        'queue': 'high_priority',
        'routing_key': 'task.high_priority',
    },
    'app.tasks.send_team_invitation_email_task': {
        'queue': 'high_priority',
        'routing_key': 'task.high_priority',
    },
    'app.tasks.update_token_price_task': {
        'queue': 'high_priority',
        'routing_key': 'task.high_priority',
    },
    'app.tasks.create_daily_payout_batch_task': {
        'queue': 'high_priority',
        'routing_key': 'task.high_priority',
    },
    'app.tasks.process_payout_batch': {
        'queue': 'default',
        'routing_key': 'task.default',
    },
    'app.tasks.reconcile_failed_payouts': {
        'queue': 'default',
        'routing_key': 'task.default',
    },
    'app.tasks.recalculate_network_stats_task': {
        'queue': 'default',
        'routing_key': 'task.default',
    },
    'app.tasks.unlock_all_contributions_task': {
        'queue': 'default',
        'routing_key': 'task.default',
    },
    'app.tasks.penalize_contribution_task': {
        'queue': 'high_priority',
        'routing_key': 'task.high_priority',
    },
    'app.tasks.clear_last_contribution_embedding_task': {
        'queue': 'high_priority',
        'routing_key': 'task.high_priority',
    },
    'app.tasks.retry_pending_ai_analysis_task': {
        'queue': 'default',
        'routing_key': 'task.default',
    },
    'app.tasks.reset_user_limits_task': {
        'queue': 'high_priority',
        'routing_key': 'task.high_priority',
    },
}

celery_app.conf.beat_schedule = {
    'update-token-price-every-15-minutes': {
        'task': 'app.tasks.update_token_price_task',
        'schedule': 900.0,
    },
    'reconcile-failed-payouts-hourly': {
        'task': 'app.tasks.reconcile_failed_payouts_task',
        'schedule': 3600.0,
    },
    'retry-failed-ai-analysis-hourly': {
        'task': 'app.tasks.retry_pending_ai_analysis_task',
        'schedule': 3600.0,
    },
}

celery_app.conf.update(task_routes=task_routes)