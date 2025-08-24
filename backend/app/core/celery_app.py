from celery import Celery
from kombu import Queue
from app.core.config import settings
from celery.schedules import crontab

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
}

celery_app.conf.update(task_routes=task_routes)