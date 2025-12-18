# Canvas API Tool

## Overview
A Node.js backend service that integrates with the Canvas LMS API to fetch
courses, assignments, and deadlines for students, enabling a centralized
dashboard experience outside of Canvas.

## Problem
Canvas does not provide an easy way for students to aggregate assignments
across courses or integrate them into custom workflows. This tool solves
that by exposing a clean API on top of Canvas data.

## What it Does
- Authenticates using Canvas API access tokens
- Fetches user courses and assignments
- Normalizes and filters assignment data
- Exposes endpoints usable by a frontend dashboard

## Tech Stack
- Node.js
- Express
- Canvas LMS REST API

## Architecture
- Express server handles API requests
- Canvas API client module abstracts external API calls
- Routes map Canvas data into frontend-friendly responses

## Example Endpoints
- GET /api/courses
- GET /api/assignments
- GET /api/assignments/upcoming

## Challenges & Tradeoffs
- Handling Canvas rate limits
- Designing a clean abstraction over a complex external API
- Deciding what data to cache vs fetch live

## Future Improvements
- Add caching for performance
- OAuth-based auth instead of personal access tokens
- Webhook-based updates for assignment changes

## Running Locally
1. Clone the repo
2. Add a Canvas API token
3. Run `npm install && npm start`
