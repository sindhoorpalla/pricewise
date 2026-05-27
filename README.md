# PriceWise — Java Spring Boot Backend

A product price comparison platform powered by **Java Spring Boot** and the **Amazon Real-Time Data API** via RapidAPI.

## 🚀 Tech Stack
- **Backend:** Java 17, Spring Boot 3.2, Spring Cache (Caffeine)
- **Frontend:** HTML5, CSS3, Vanilla JS (served as static content)
- **API:** RapidAPI — Real-Time Amazon Data
- **Build:** Maven

## 📁 Project Structure
```
pricewise/
├── src/main/java/com/pricewise/
│   ├── PriceWiseApplication.java     ← Main entry point
│   ├── CacheConfig.java              ← Caffeine cache config
│   ├── controller/
│   │   └── ProductController.java    ← REST API endpoints
│   ├── service/
│   │   └── AmazonService.java        ← Fetches from RapidAPI
│   └── model/
│       ├── Product.java              ← Product data model
│       └── ProductSearchResponse.java ← API response model
├── src/main/resources/
│   ├── application.properties        ← Config (add your API key here)
│   └── static/index.html             ← Frontend UI
└── pom.xml                           ← Maven dependencies
```

## ⚙️ Setup & Run

### 1. Add your RapidAPI key
Edit `src/main/resources/application.properties`:
```properties
rapidapi.key=YOUR_RAPIDAPI_KEY_HERE
```

### 2. Run locally
```bash
mvn spring-boot:run
```

### 3. Open in browser
```
http://localhost:8080
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/search?q=laptop` | Search products |
| GET | `/api/product/{asin}` | Product details |
| GET | `/api/offers/{asin}` | Product offers/prices |

## 👨‍💻 Developer
**Sai Sindhoor Reddy** — Senior Java / Full Stack Developer
- LinkedIn: [linkedin.com/in/sai-sindhoor-reddy-palla](https://www.linkedin.com/in/sai-sindhoor-reddy-palla/)
- Live site: [price-comparater.netlify.app](https://price-comparater.netlify.app)
