# IPL Analytics Platform

A full-stack, data-first application that centralises every Indian Premier League match, player, and team record across all historical seasons into a unified, query-optimised backend, and surfaces it through a responsive web interface and native mobile experience.

## Components

- **Data Source**: Cricsheet CSV/JSON
- **Ingestion**: Python + pandas
- **Transformation**: dbt + PostgreSQL 16
- **API**: FastAPI (Python)
- **Web App**: React, TypeScript, Vite
- **Mobile Client**: React Native + Expo
- **Orchestration**: Apache Airflow

## Setup Instructions

1. Run `docker-compose up -d` to start the PostgreSQL and Redis containers.
2. Follow up with data ingestion, transformation, and API execution.

_Version 1.0_
