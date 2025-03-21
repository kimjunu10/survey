// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// 미들웨어 설정
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// 데이터를 저장할 JSON 파일 경로 설정
const filePath = path.join(__dirname, 'reservations.json');

// 기본 라우트 (서버 확인용)
app.get('/', (req, res) => {
    res.send('서버가 정상적으로 작동 중입니다.');
});

// 예약 데이터 저장 API (JSON 파일에 저장)
app.post('/api/reservations', (req, res) => {
    const { name, email, message } = req.body;

    // 필수 항목 체크
    if (!name || !email) {
        return res.status(400).json({ error: '이름과 이메일은 필수입니다.' });
    }

    // 새 예약 데이터 생성
    const newReservation = {
        name,
        email,
        message: message || '',
        createdAt: new Date().toISOString()
    };

    // 기존 JSON 파일 읽고, 데이터가 있으면 파싱 후 배열에 추가
    fs.readFile(filePath, 'utf8', (readErr, data) => {
        let reservations = [];
        if (!readErr) {
            try {
                reservations = JSON.parse(data);
                if (!Array.isArray(reservations)) {
                    reservations = [];
                }
            } catch (parseErr) {
                reservations = [];
            }
        }

        // 새 예약 정보를 배열에 추가
        reservations.push(newReservation);

        // 업데이트된 배열을 JSON 파일에 다시 쓰기
        fs.writeFile(filePath, JSON.stringify(reservations, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('저장 오류:', writeErr);
                return res.status(500).json({ error: '예약 정보를 저장하는 중 오류가 발생했습니다.' });
            }
            res.status(201).json({
                message: '예약 정보가 성공적으로 저장되었습니다.',
                reservation: newReservation,
            });
        });
    });
});

// 서버 시작
app.listen(port, () => {
    console.log(`서버가 포트 ${port}번에서 실행 중입니다.`);
});

app.get('/ping', (req, res) => {
    res.status(200).send('Server is alive');
});