const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { transport, makeANiceEmail } = require('../mail');
const { hasPermission } = require('../utils');
const stripe = require('../stripe');



const Mutations = {
    async createItem(parent, args, ctx, info)
    {
        //TODO check if they are logged in
        if (!ctx.request.userId)
        {
            throw new Error(`You must be logged in to do that.`);
        }

        const item = await ctx.db.mutation.createItem({
            data: {
                //how we provide relationship with user and item
                user: {
                    connect: {
                        id: ctx.request.userId
                    }
                },
                //same as manually spreading them
                // title: args.title, <= manual implementation
                ...args,
            }
        }, info);
        return item;
    },
    async updateItem(parent, args, ctx, info)
    {
        const where = { id: args.id };
        //if item belongs to user
        const item = await ctx.db.query.item({ where }, `{id title user { id }}`);
        //check if they have permission
        const ownsItem = item.user.id === ctx.request.userId;
        const hasPermissions = ctx.request.user.permissions.some(permission => ['ADMIN', 'ITEMUPDATE'].includes(permission))
        if (!ownsItem && !hasPermissions)
        {
            throw new Error(`You don't have permission to update that item.`);
        }
        //copy of the updates
        const updates = { ...args };
        //remove id from the updates
        delete updates.id;
        //run the update
        return ctx.db.mutation.updateItem(
            {
                data: updates,
                where: {
                    id: args.id,
                }
            },
            info
        );
    },
    async deleteItem(parent, args, ctx, info)
    {
        const where = { id: args.id };
        //find the item
        const item = await ctx.db.query.item({ where }, `{id title user { id }}`);
        //check if they have permission
        const ownsItem = item.user.id === ctx.request.userId;
        const hasPermissions = ctx.request.user.permissions.some(permission => ['ADMIN', 'ITEMDELETE'].includes(permission))
        if (!ownsItem && !hasPermissions)
        {
            throw new Error(`You don't have permission to do delete this item.`);
        }
        //delete the item 
        return ctx.db.mutation.deleteItem({ where }, info);
    },
    async signUp(parent, args, ctx, info)
    {
        //if email is empty or invalid
        if (args.email == '' || null)
        {
            throw new Error('Please input a valid email');
        }
        //lowercase their email
        args.email = args.email.toLowerCase();
        //hash their password
        const password = await bcrypt.hash(args.password, 10);
        //create the user in the data base
        const user = await ctx.db.mutation.createUser(
            {
                data: {
                    ...args,
                    password,
                    permissions: { set: ['USER'] },
                },
            },
            info
        );
        //create the JWT token for user
        const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
        //set cookie the jwt as a cookie on the 
        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
        });
        //finally return user to browser
        return user;
    },
    async signIn(parent, { email, password }, ctx, info)
    {
        //1.if user with email exist
        const user = await ctx.db.query.user({
            where: { email }
        });
        if (!user)
        {
            throw new Error(`That email doesn't exist, please try again or sign up.`);
        }
        //2.Check if password is correct
        const valid = await bcrypt.compare(password, user.password);
        if (!valid)
        {
            throw new Error('Invalid Password!');
        }
        //3.generate JWT token
        const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
        //4. set the cookie with token
        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
        });
        //5. return user
        return user;
    },
    signOut(parent, args, ctx, info)
    {
        ctx.response.clearCookie('token');
        return { message: "later" }
    },
    async requestReset(parent, args, ctx, info)
    {
        //1. check to see if it's a real user
        const user = await ctx.db.query.user({ where: { email: args.email } });
        if (!user)
        {
            if (!args.email)
            {
                throw new Error(`No email input`);
            }
            throw new Error(`No user with ${args.email}`);
        }
        //2. send real and expiry
        const resetToken = (await promisify(randomBytes)(20)).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000;
        const res = await ctx.db.mutation.updateUser({
            where: { email: args.email },
            data: { resetToken, resetTokenExpiry },
        });
        //3. send email
        const mailResponse = await transport.sendMail({
            from: 'Ilya Indik',
            to: user.email,
            subject: 'Your Password reset',
            html: makeANiceEmail(`Your password reset token came in
            \n\n
            <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click here to reset</a>
            `
            ),

        })
        //4. return message
        return { message: 'Thanks' };
    },
    async resetPassword(parent, args, ctx, info)
    {
        //1. Check is passwords match
        if (args.password !== args.confirmPassword)
        {
            throw new Error('Passwords do not match!');
        }
        //2. Check if legit resetToken
        //3. Check if expired
        const [user] = await ctx.db.query.users({
            where: {
                resetToken: args.resetToken,
                resetTokenExpiry_gte: Date.now() - 360000,
            },
        });
        if (!user)
        {
            throw new Error(`This token is either invalid or expired`);
        }
        //4. hash new password
        const password = await bcrypt.hash(args.password, 10);
        //5. Save new password and remove reset tokens
        const updateUser = await ctx.db.mutation.updateUser({
            where: { email: user.email },
            data: {
                password: password,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });
        //6. Generate JWT
        const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
        //7. Set JET
        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
        });
        //8. return user
        return user;
    },
    async updatePermissions(parent, args, ctx, info)
    {
        //1. check if they are logged in
        if (!ctx.request.userId)
        {
            throw new Error(`Must be logged in`);
        }
        //2. query current User
        const currentUser = await ctx.db.query.user({
            where: {
                id: ctx.request.userId,
            },
        }, info);
        //3. check if they have permissions
        hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);
        //4. update permission
        return ctx.db.mutation.updateUser(
            {
                data: {
                    permissions: {
                        set: args.permissions,
                    },
                },
                where: {
                    id: args.userId,
                },

            },
            info
        );
    },
    async addToCart(parent, args, ctx, info)
    {
        //1. check if they are signed in
        const userId = ctx.request.userId;
        if (!ctx.request.userId)
        {
            throw new Error(`Must be logged in`);
        }
        //2. query users current cart
        const [existingItems] = await ctx.db.query.cartItems({
            where: {
                user: { id: userId },
                item: { id: args.id },
            }
        }, info);
        //3. check if that item is already in their cart and increment
        if (existingItems)
        {
            console.log(`this item is already in the cart`);
            return ctx.db.mutation.updateCartItem({
                where: { id: existingItems.id },
                data: { quantity: existingItems.quantity + 1 },
            }, info);
        }
        //4 creat fresh cart item
        return ctx.db.mutation.createCartItem({
            data: {
                user: {
                    connect: { id: userId },
                },
                item: {
                    connect: { id: args.id },
                },
            },
        }, info);
    },
    async removeFromCart(parent, args, ctx, info)
    {
        //1. find their cart item
        const cartItem = await ctx.db.query.cartItem({
            where: {
                id: args.id,
            },
        }, `{id, user { id }}`);
        if (!cartItem)
        {
            throw new Error('No Cart item found');
        }
        //2. make sure they own the cart item
        if (cartItem.user.id !== ctx.request.userId)
        {
            throw new Error('Trying to do something?');
        }
        //3. delete that cart
        return ctx.db.mutation.deleteCartItem({
            where: {
                id: args.id,
            },
        }, info);
    },
    async createOrder(parent, args, ctx, info)
    {
        //1. Query current user to make sure they are signed in
        // if (!ctx.request.userId)
        const { userId } = ctx.request;
        if (!userId)
        {
            throw new Error(`You must be logged in to do that.`);
        }
        const user = await ctx.db.query.user({
            where: {
                id: userId,
            }
        },
            `{
                id 
                name 
                email 
                cart {
                    id 
                    quantity 
                    item {
                        title 
                        price 
                        id 
                        description 
                        image
                        largeImage
                    }
                }
            }`
        );
        //2. recalculate total price
        const amount = user.cart.reduce((tally, cartItem) =>
            tally + cartItem.item.price * cartItem.quantity, 0);
        // console.log(` charging card ${amount} `);
        //3. create stripe charge (turn token into $$)
        const charge = await stripe.charges.create({
            amount: amount,
            currency: 'USD',
            source: args.token,
        });
        //4. convert cart items to order
        const orderItems = user.cart.map(cartItem =>
        {
            const orderItem = {
                ...cartItem.item,
                quantity: cartItem.quantity,
                user: { connect: { id: userId } },
            };
            delete orderItem.id;
            return orderItem;
        }, info);
        //5. create the order
        const order = await ctx.db.mutation.createOrder({
            data: {
                total: charge.amount,
                charge: charge.id,
                items: {
                    create: orderItems
                },
                user: {
                    connect: { id: userId }
                },
            },
        }, info);
        // console.log(`This is where we get ${order}`);
        //6. clean up clean user delete cart items
        const cartItemIds = user.cart.map(cartItem => cartItem.id);
        await ctx.db.mutation.deleteManyCartItems({
            where: {
                id_in: cartItemIds,
            },
        }, info);
        //7. return the order of the client.
        return order;
    },
};

module.exports = Mutations;
