#!/bin/bash

# Wait for RabbitMQ to be ready
echo "Waiting for RabbitMQ to be ready..."
while ! rabbitmqctl -n rabbit@$RABBITMQ_HOST status; do
  sleep 1
done

# Create exchanges
rabbitmqadmin -H $RABBITMQ_HOST -u $RABBITMQ_USER -p $RABBITMQ_PASSWORD declare exchange name=shipment_events type=topic durable=true
rabbitmqadmin -H $RABBITMQ_HOST -u $RABBITMQ_USER -p $RABBITMQ_PASSWORD declare exchange name=analytics_events type=topic durable=true

# Create queues
rabbitmqadmin -H $RABBITMQ_HOST -u $RABBITMQ_USER -p $RABBITMQ_PASSWORD declare queue name=shipment_status_updates durable=true
rabbitmqadmin -H $RABBITMQ_HOST -u $RABBITMQ_USER -p $RABBITMQ_PASSWORD declare queue name=analytics_reports durable=true

# Bind queues to exchanges
rabbitmqadmin -H $RABBITMQ_HOST -u $RABBITMQ_USER -p $RABBITMQ_PASSWORD declare binding source=shipment_events destination=shipment_status_updates routing_key=shipment.status.*
rabbitmqadmin -H $RABBITMQ_HOST -u $RABBITMQ_USER -p $RABBITMQ_PASSWORD declare binding source=analytics_events destination=analytics_reports routing_key=analytics.report.*

# Set queue policies
rabbitmqadmin -H $RABBITMQ_HOST -u $RABBITMQ_USER -p $RABBITMQ_PASSWORD declare policy name=shipment_status_policy pattern="^shipment_status_updates$" definition='{"max-length":10000,"max-length-bytes":10485760}'
rabbitmqadmin -H $RABBITMQ_HOST -u $RABBITMQ_USER -p $RABBITMQ_PASSWORD declare policy name=analytics_reports_policy pattern="^analytics_reports$" definition='{"max-length":1000,"max-length-bytes":5242880}'

echo "RabbitMQ initialized successfully" 