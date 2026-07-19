---
title: "Everything I know as a Software Engineer (pre-2024)"
category: Technology
date: "Dec 10, 2024"
readTime: "4 min read"
slug: everything-i-know-as-a-software-engineer-pre-2024
cover: empty
---

A brain dump of the things I've found durable after 5 years of building production systems.

## On Distributed Systems

- Network partitions happen. Design for it, don't hope against it.
- Eventual consistency is not the same as broken — but you need to explain the lag to users.
- Kafka is powerful and operationally heavy. Don't reach for it before you've exhausted simpler queues.

## On Databases

- Indexes are the first answer to slow queries, not application-layer caching.
- Schema migrations on large tables require a plan. Online schema change tools exist for a reason.
- PostgreSQL can handle more than you think before you need something else.

## On Python

- Type hints pay for themselves after the second engineer touches the code.
- Celery is not hard to use but is hard to operate at scale. Monitor it aggressively.
- Django's ORM is good. Raw SQL is sometimes better. Know when.

## On Engineering in General

- The fastest way to go slower is to skip the design doc.
- "It works on my machine" is a debugging starting point, not a resolution.
- Boring technology finishes projects. Exciting technology starts them.
