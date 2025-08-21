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

task_routes = {
    'app.tasks.process_contribution': {
        'queue': 'default',
        'routing_key': 'task.default',
    },
    'app.tasks.process_claim': {
        'queue': 'high_priority',
        'routing_key': 'task.high_priority',
    },
    'app.tasks.send_contact_sales_email_task': {
        'queue': 'high_priority',
        'routing_key': 'task.high_priority',
    }
}

celery_app.conf.update(task_routes=task_routes)