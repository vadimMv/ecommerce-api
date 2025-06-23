# Ecommerce API

A RESTful API for ecommerce applications built with Node.js, featuring user authentication, product management, and shopping cart functionality.

## Prerequisites

This project requires Docker and Docker Compose to be installed on your system.

**Install Docker:**
- Windows/Mac: [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Linux: [Docker Engine](https://docs.docker.com/engine/install/)

## Quick Start

### First clone this repo to your pc

```bash
cd C:\path-to-project\ecommerce-api


docker-compose up --build
```

The API will be running at:
- API: http://localhost:3000
- Swagger Documentation: http://localhost:3000/api

## Testing the API

### Demo Credentials
- **Username**: `demo`
- **Password**: `password123`

### Test Flow
1. **Login** - Get JWT token
2. **Get Categories** - Browse available categories
3. **Get Products** - View products by category
4. **Add to Cart** - Add products to shopping cart
5. **Manage Cart** - Update quantities, remove items

### Postman Collection
Import the included `E-commerce API.postman_collection.json` file for pre-configured API endpoints with environment variables.

## API Documentation

- **Swagger UI**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

## Features

- User authentication with JWT tokens
- Product catalog management
- Category organization
- Shopping cart functionality
- RESTful API design
- Comprehensive API documentation
- Health monitoring

## Development

The API includes:
- JWT-based authentication
- Product and category management
- Shopping cart operations
- Input validation
- Error handling
- API documentation with Swagger

## Support

For issues or questions, please check the API documentation at http://localhost:3000/api when the server is running.
