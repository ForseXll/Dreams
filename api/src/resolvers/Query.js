const { forwardTo } = require('prisma-binding');
const { hasPermission } = require('../utils');

const Query = {
    items: forwardTo('db'),
    item: forwardTo('db'),
    itemsConnection: forwardTo('db'),
    //check for user account
    me(parent, args, ctx, info)
    {
        // check if there is a current user ID
        if (!ctx.request.userId)
        {
            return null;
        }
        return ctx.db.query.user(
            {
                where: { id: ctx.request.userId },
            },
            info
        );
    },
    async users(parent, args, ctx, info)
    {
        //.5 check if they logged in
        if (!ctx.request.userId)
        {
            throw new Error('You must be logged in');
        }
        //1. check if user has permission to query users
        hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE']);
        //2. if the do query all the users
        return ctx.db.query.users({}, info);
    },
    async order(parent, args, ctx, info)
    {
        //make sure they are logged in
        if (!ctx.request.userId)
        {
            throw new Error('You must be logged in');
        }
        //query current order
        const order = await ctx.db.query.order({
            where: { id: args.id },
        },
            info
        );
        // console.group(order);
        //check if the have permissions to see order
        const ownsOrder = order.user.id === ctx.request.userId;
        const hasPermissionToSeeOrder = ctx.request.user.permissions.includes('ADMIN');
        if (!ownsOrder && !hasPermissionToSeeOrder)
        {
            throw new Error("you cannot see this order");
        }
        //return order
        return order;
    },
    async orders(parent, args, ctx, info)
    {
        //check to see if they are logged in
        const { userId } = ctx.request;
        if (!userId)
        {
            throw new Error('You must be logged in');
        }
        //query orders

        //return orders
        return ctx.db.query.orders({
            where: {
                user: { id: userId },
            },
        }, info);
    },
};

module.exports = Query;
