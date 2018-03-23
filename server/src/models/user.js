import Model from "./index";
import {GraphQLString, GraphQLNonNull, GraphQLID, GraphQLObjectType, GraphQLBoolean} from 'graphql'
import Email from '../types/email'
import DateTime from '../types/datetime'
import Role from '../types/role'
import bcrypt from 'bcrypt'
import {SEP, strToArray} from "../types/role";
import _ from 'lodash'

export default class User extends Model {
    constructor(database) {
        super(database, 'users', 'user');
    }

    async get(id) {

        let model = null;

        try {
            model = await super.get(id);
        } catch (err) {
            console.log(err);
        }

        if (model) {

            if (_.get(model, 'roles')) {
                model.roles = strToArray(_.get(model, 'roles'));
            } else {
                model.roles = [];
            }

        }
        return new Promise((resolve, reject) => {

            return model ? resolve(model) : reject('Not found');
        });

    }

    /**
     * Override validate
     * @param id
     * @param model
     * @returns {Promise<any>}
     */
    async validate(id = null, model) {

        let error = [];

        const roleModels = await this.database.models().role.find(null);

        try {
            model = await super.validate(id, model);
        }
        catch (err) {

            if (Array.isArray(err)) {
                error = error.concat(err);
            } else {
                error.push(err);
            }
        }


        return new Promise((resolve, reject) => {
            if (error.length) {
                return reject(error);
            }

            let roles = [];

            _.each(roleModels, (r) => {
                roles.push(r.name);
            });

            const uRoles = _.get(model, 'roles', []);
            let userRoles = strToArray(uRoles);


            if (Array.isArray(_.get(model, 'roles'))) {
                userRoles = uRoles;
                model.roles = _.join(uRoles, SEP);
            }
            _.each(userRoles, (r) => {
                if (!_.includes(roles, r)) {
                    error.push(`Role name: ${r} does not exist.`);
                }
            });

            return error.length ? reject(error) : resolve(model);


        });

    }

    /**
     * Login
     * @param email
     * @param password
     * @returns {Promise<any>}
     */
    login(email, password) {

        const db = this.getDataSource();
        const prefix = this.prefix();

        return new Promise((resolve, reject) => {
            if (!email || !this.isEmail(email)) {
                return reject("Invalid Email");
            }
            if (!password || password === "") {
                return reject("Password is required");
            }

            email = _.toLower(email);


            // Email field is unique , we did set it, and get userId by email key
            db.get(`${prefix}:unique:email:${email}`, (err, userId) => {
                if (err || !userId) {
                    // an error or email is not found
                    return reject("Email Not found");
                }

                // then we get user model by userId

                this.get(userId).then((model) => {

                    const originalPassword = _.get(model, 'password');
                    const isMatched = bcrypt.compareSync(password, originalPassword);
                    if (!isMatched) {
                        return reject("Password does not match.");
                    }
                    // let create token

                    this.database.models().token.save(null, {
                        userId: userId
                    }).then((tokenModel) => {

                        tokenModel = _.setWith(tokenModel, 'user', model);

                        return resolve(tokenModel);
                    }).catch(err => {
                        return reject(err);
                    })


                }).catch((err) => {
                    return reject(err);
                })
            });


        });

    }

    /**
     * Logout user
     * @param token
     * @returns {Promise<any>}
     */
    logout(token) {

        const db = this.getDataSource();

        const tokenPrefix = this.database.models().token.prefix();

        const args = `${tokenPrefix}:unique:token:${token}`;
        return new Promise((resolve, reject) => {

            db.get(args, (err, tokenId) => {
                if (err) {
                    return reject(err);
                }

                this.database.models().token.delete(tokenId).then(() => {

                    return resolve(tokenId);

                }).catch((err) => {
                    return reject(err);
                })

            });
        })


    }


    /**
     *
     * Override query
     */
    query() {

        const parentQuery = super.query();

        const query = {
            me: {
                type: this.schema(),
                args: {},
                resolve: (value, args, request) => {

                    const userId = _.get(request, 'token.userId');

                    console.log(userId);

                    return new Promise((resolve, reject) => {
                        this.get(userId).then((user) => {
                            return resolve(user);
                        }).catch(() => {
                            return reject("Access denied");
                        });

                    });


                }
            },

        };

        return Object.assign(parentQuery, query);
    }


    /**
     * Mutation
     */
    mutation() {
        const parentMutation = super.mutation();

        const mutation = {
            login: {
                type: new GraphQLObjectType({
                    name: 'login',
                    fields: () => (Object.assign(this.database.models().token.fields(), {
                        user: {
                            type: this.schema(),
                        }
                    }))
                }),
                args: {
                    email: {
                        name: 'email',
                        type: GraphQLNonNull(Email),
                    },
                    password: {
                        name: 'password',
                        type: GraphQLNonNull(GraphQLString),
                    }
                },
                resolve: (value, args, request) => {

                    return this.login(_.get(args, 'email'), _.get(args, 'password'));
                }
            },
            logout: {

                type: GraphQLBoolean,
                args: {
                    token: {
                        name: 'token',
                        type: GraphQLNonNull(GraphQLString),
                    }
                },
                resolve: (value, args, request) => {

                    return new Promise((resolve, reject) => {
                        const token = _.get(args, 'token');
                        this.logout(token).then(() => {
                            return resolve(true);
                        }).catch(err => {
                            return reject(err);
                        })

                    });

                }
            },

        };

        return Object.assign(parentMutation, mutation);
    }

    relations() {

        return {
            tokens: {
                model: this.database.models().token,
                localField: 'id',
                targetField: 'userId',
                type: 'hasMany',
                name: 'tokens',
                delete: true,
            }
        }
    }

    /**
     * Override field schema
     */
    fields() {

        return {
            id: {
                primary: true,
                index: true,
                autoId: true,
                type: GraphQLID
            },
            email: {
                unique: true,
                index: true,
                type: Email,
                email: true,
                required: true,
                lowercase: true,
                acl: {
                    read: ['administrator', 'owner'],
                    create: ['administrator', 'everyone'],
                    update: ['administrator', 'owner']
                }
            },
            roles: {
                type: Role,
                acl: {
                    read: ['administrator', 'owner'],
                    create: ['administrator'],
                    update: ['administrator', 'owner']
                }
            },
            password: {
                password: true,
                type: GraphQLString,
                required: true,
                minLength: 3,
            },
            firstName: {
                type: GraphQLString
            },
            lastName: {
                type: GraphQLString
            },
            created: {
                type: DateTime,
                defaultValue: new Date().toJSON(),
            },
            updated: {
                type: DateTime,
                defaultValue: null,
            }
        }
    }
}