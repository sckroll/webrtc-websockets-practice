import express from 'express';

const app = express();

// 뷰 엔진을 Pug로 설정 & 뷰 파일이 위치한 디렉토리를 설정
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

// static 디렉토리 설정
app.use('/public', express.static(__dirname + '/public'));

// 라우트 설정 (home.pug 렌더링 수행)
app.get('/', (req, res) => res.render('home'));

// 다른 라우트를 입력했을 경우 루트 경로로 리다이렉트
app.get('/*', (req, res) => res.redirect('/'));

// 3000 포트로 서버 실행
app.listen(3000);