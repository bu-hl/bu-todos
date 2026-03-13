const express = require("express");
const todoRoutes = require("./routes/todos");
const { testConnection } = require("./config/database");
const initializeDatabase = require("./database/init");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  const origin = req.headers.origin;

  // 같은 호스트의 3001 포트 허용 (localhost, AWS IP 등)
  if (origin && origin.includes(":3001")) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use("/api/todos", todoRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Todo API 서비스에 오신 것을 환영합니다!",
    endpoints: {
      "GET /api/todos": "모든 Todo 조회",
      "GET /api/todos/:id": "특정 Todo 조회",
      "POST /api/todos": "새 Todo 생성",
      "PUT /api/todos/:id": "Todo 수정",
      "DELETE /api/todos/:id": "Todo 삭제",
    },
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "요청한 경로를 찾을 수 없습니다." });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "서버 오류가 발생했습니다." });
});

async function startServer() {
  try {
    await initializeDatabase();

    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.log(
        "⚠️  데이터베이스 연결 실패. 서버는 계속 실행되지만 일부 기능이 작동하지 않을 수 있습니다."
      );
      console.log(
        "💡 MySQL이 실행 중인지 확인하고 .env 파일의 설정을 확인하세요."
      );
    }
  } catch (error) {
    console.error("⚠️  데이터베이스 초기화 중 오류 발생:", error.message);
    console.log(
      "💡 서버는 계속 실행되지만 데이터베이스 기능이 작동하지 않을 수 있습니다."
    );
  }

  app.listen(PORT, () => {
    console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  });
}

startServer();
