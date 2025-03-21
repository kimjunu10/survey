const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const uri = process.env.MONGO_URI; // 환경 변수에서 MongoDB 연결 주소 가져옴

const client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

let db;

// MongoDB 연결 (앱 시작 시 한 번만 실행)
async function connectDB() {
    try {
        await client.connect();
        db = client.db('surveyDB'); // 사용할 데이터베이스 지정
        console.log("✅ MongoDB 연결 성공!");
    } catch (error) {
        console.error("❌ MongoDB 연결 실패:", error);
    }
}
connectDB();

// 미들웨어 설정
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// 예약 데이터 저장 API (MongoDB에 저장)
app.post('/api/reservations', async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: '이름과 이메일은 필수입니다.' });
    }

    try {
        const collection = db.collection('reservations'); // 'reservations' 컬렉션 가져오기
        const newReservation = { name, email, message: message || '', createdAt: new Date() };
        await collection.insertOne(newReservation);
        res.status(201).json({ message: '예약 저장 성공!', reservation: newReservation });
    } catch (error) {
        console.error("❌ 저장 오류:", error);
        res.status(500).json({ error: '데이터 저장 중 오류 발생' });
    }
});

// 서버 시작
app.listen(port, () => {
    console.log(`✅ 서버 실행 중 (포트: ${port})`);
});
