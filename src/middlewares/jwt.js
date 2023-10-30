import jwt from 'jsonwebtoken';
import db from '../models';

const User = db.user;
const Role = db.role;

/**
 * Verify token from req
 * 
 * @
 */
function verifyToken(req, res, next) {
    let token = req.headers['token'];
    let secret = process.env.JWT_SECRET;

    if (!token) {
        return apiResponse.unauthorizedResponse(res, 'There is not Token in the request');
    }

    jwt.verify(token, secret,
        (err, decoded) => {
            if (err) {
                apiResponse.unauthorizedResponse(res);
            }
            req.userId = decoded.id;
            next();
        });
};

/** 
 * Check Roles is admin
 * @param {Request} req Http Request
 * @param {Response} res Http Response
 * @param {Callback} next Call back function Next process
 */
function isAdmin(req, res, next) {
    User.findById(req.userId).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        Role.find(
            {
                _id: { $in: user.roles }
            },
            (err, roles) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }

                for (let i = 0; i < roles.length; i++) {
                    if (roles[i].name === 'admin') {
                        next();
                        return;
                    }
                }

                res.status(403).send({ message: 'Require Admin Role!' });
                return;
            }
        );
    });
};


const authJwt = {
    verifyToken,
    isAdmin
};

export default authJwt;