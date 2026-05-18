# Lab 4 — synchronous and asynchronous communication

This version uses RabbitMQ for the asynchronous variant in the running application.

## Modes

- `POST /items/:id/buy-sync` — direct synchronous audit call
- `POST /items/:id/buy-async` — publish `item.purchased` to RabbitMQ
- `GET /audit-logs` — inspect audit entries

## Environment

The async transport is selected by `ASYNC_TRANSPORT`:

- `rabbitmq` — runtime mode for the lab demo
- `inmemory` — test-friendly mode without external broker

Required RabbitMQ env vars:

- `RABBITMQ_URL`
- `RABBITMQ_EXCHANGE`
- `RABBITMQ_AUDIT_QUEUE`
- `RABBITMQ_ITEM_PURCHASED_KEY`
