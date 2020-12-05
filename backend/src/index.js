const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

// let's go!
require('dotenv').config({ path: 'variables.env' });
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

//TODO: use express middle ware to handle cookies(JWT)
//handling cookies
server.express.use(cookieParser());
//TODO use express middleware to populate current user
//decode the JWT so we can get the user ID on each request
server.express.use((req, res, next) =>
{
    const { token } = req.cookies;
    // console.log(token);
    if (token)
    {
        const { userId } = jwt.verify(token, process.env.APP_SECRET);
        //put user 
        req.userId = userId;
    }
    next();
});
//create a middleware that populates user on each request
server.express.use(async (req, res, next) =>
{
    if (!req.userId) return next();
    const user = await db.query.user({
        where: {
            id: req.userId
        }
    },
        '{id, permissions, email, name}'
    );
    req.user = user;
    next();
})

//for starting server
server.start({
    cors: {
        credentials: true,
        origin: process.env.FRONTEND_URL,
    },

},
    details =>
    {
        console.log(`Server is now running on port http://localhost:${details.port}`);
    }
);
