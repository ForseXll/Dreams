//connects to prisma DB and lets us communicate with the sever

const { Prisma } = require('prisma-binding');

const db = new Prisma({
    typeDefs: 'src/generated/prisma.graphql',
    // dev for dev change back -dev
    // endpoint: process.env.PRISMA_ENDPOINT_DEV,
    endpoint: process.env.PRISMA_ENDPOINT,
    secret: process.env.PRISMA_SECRET,
    debug: true,
})


module.exports = db;