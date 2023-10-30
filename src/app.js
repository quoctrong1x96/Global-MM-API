import session from 'express-session';
import MongoStore from 'connect-mongo';
import { promisify } from 'es6-promisify';
import dotenv from 'dotenv';
import {glob} from 'glob';

// Import the necessary modules using ESM syntax
import morgan from 'morgan';
import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import mongoose from 'mongoose';

//Import Swager
import swaggerDefinition from './helpers/swaggerDefine.js';
import errorHandler from './handlers/errorHandler.js';
import logger from './helpers/loggerWinston.js';

// Import your custom routes
import addressRouter from './routes/address.js';
import typeRouter from './routes/type.js';
import indexRouter from './routes/index.js';

/*________________________Environment settings_______________*/
//Run config environment
dotenv.config();
//Connect to MongoDB
let MONGODB_URL = process.env.MONGODB_URL;

/*________________________Application settings_______________*/
// New Express App
var app = express();

// Takes the raw requests and turns them into usable properties on req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//don't show the log when it is test
// if (process.env.NODE_ENV !== 'test') {
//   app.use(logger('dev'));
// }
// // Sessions allow us to Contact data on visitors from request to request
// // This keeps admins logged in and allows us to send flash messages
// app.use(
//   session({
//     secret: process.env.SECRET,
//     key: process.env.KEY,
//     resave: false,
//     saveUninitialized: false,
//     store: MongoStore.create({ mongoUrl: process.env.MONGODB_URL }),
//   })
// );

// pass variables to our templates + all requests
// app.use((req, res, next) => {
//   res.locals.admin = req.admin || null;
//   res.locals.currentPath = req.path;
//   next();
// });

// // promisify some callback based APIs
// app.use((req, res, next) => {
//   req.login = promisify(req.login, req);
//   next();
// });

// // Here our API Routes
// app.use(function (req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*';
//   res.header('Access-Control-Allow-Credentials', 'true';
//   res.header('Access-Control-Allow-Methods', 'GET,PATCH,PUT,POST,DELETE';
//   res.header('Access-Control-Expose-Headers', 'Content-Length';
//   res.header(
//     'Access-Control-Allow-Headers',
//     'Accept, Authorization,x-auth-token, Content-Type, X-Requested-With, Range'
//   );
//   if (req.method === 'OPTIONS') {
//     return res.sendStatus(200);
//   } else {
//     return next();
//   }
// });

//

// app.use(cookieParser());

// serves up static files from the public folder. Anything in public/ will just be served up as the file it is
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '/src/public/uploads')));

//App set views
app.set('views', path.join(__dirname, 'public', 'views'));
app.set('view engine', 'ejs');


//App set Route prefixes
app.use('/', indexRouter);
app.use('/api/address', addressRouter);
app.use('/api/type', typeRouter);

//If user UnAuthorized then handler it
app.use(errorHandler.unauthorizedErrors);

// If that above routes didnt work, we 404 them and forward to error handler
app.use(errorHandler.notFound);

// Otherwise this was a really bad error we didn't expect! Shoot eh
if (app.get('env') === 'development') {
  /* Development Error Handler - Prints stack trace */
  app.use(errorHandler.developmentErrors);
}

// production error handler
app.use(errorHandler.productionErrors);


/*________________________Swagger settings___________________*/
//App Config swagger for API
const options = {
  swaggerDefinition,
  apis: ['./routes/*.js'], // Thay thế 'app.js' bằng đường dẫn đến tệp chứa các chú thích Swagger
};
//Swagger config
const swaggerSpec = swaggerJSDoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/*________________________MongoDB settings__________________________*/
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
/*__________________________Load all Mongo Model_____________________*/
//Connect to MongoDB
mongoose
  .connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    //don't show this LOGS when it is test
    if (process.env.NODE_ENV !== 'test') {
      console.log('Connected to %s', MONGODB_URL);
      console.log('App is running ....');
      console.log('Press CTRL + C to stop process. \n');
    }
  })
  .catch((err) => {
    logger.error('🚫 Error → : ${err.message} ');
    process.exit(1);
  });


export default app;
