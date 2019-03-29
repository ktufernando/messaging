// ============================
//  Puerto
// ============================
process.env.PORT = process.env.PORT || 3000;


// ============================
//  Entorno
// ============================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';


// ============================
//  Base de datos
// ============================
let urlDB;

//if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb+srv://pepeargento:iG0VO3m8EabWXwO1@cluster0-8e8qa.mongodb.net/messaging?retryWrites=true';
//} else {
//    urlDB = process.env.MONGO_URI;
//}
process.env.URLDB = urlDB;


// ============================
//  Pure Cloud
// ============================
process.env.PURECLOUD_ORG_ID = '291bf467-8004-4509-9fa5-8ee99e47bdb4';
process.env.PURECLOUD_DEPLOY_ID = 'c5f11f7f-2372-45ce-b54b-1163aa618258';
process.env.PURECLOUD_CREDENTIALS_BASE64 = 'OWJjNTNlZjUtNjRlMC00ZTEwLWJkM2ItZWM4ODVlOWUzMGEyOjUzRVVTQWgyZ1hhNm1qdWlGWVBveEdhcnB6eWRQbnNHSmVHSnRjVFd3X0E=';
process.env.PURECLOUD_CLIENT_ID = '9bc53ef5-64e0-4e10-bd3b-ec885e9e30a2';
process.env.PURECLOUD_CLIENT_SECRET = '53EUSAh2gXa6mjuiFYPoxGarpzydPnsGJeGJtcTWw_A';
process.env.PURECLOUD_AGENT = 'fernandoluis.valdes@bbva.com';
process.env.PURECLOUD_ENVIRONMENT = 'mypurecloud.com';