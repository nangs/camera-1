import {GraphQLScalarType} from 'graphql';
import {GraphQLError} from 'graphql/error';
import {Kind} from 'graphql/language';
import moment from 'moment'

export default new GraphQLScalarType({
    name: 'DateTime',

    // eslint-disable-next-line max-len
    description: 'Use JavaScript Date object for date/tiem fields.',

    serialize(value) {

        let date = moment(value);

        const isValid = date.isValid();
        if (value && !isValid) {
            throw new TypeError(`Value is not a valid Date: ${value}`);
        }
        return isValid ? date.toJSON() : value;
    },

    parseValue(value) {
        const date = new Date(value);

        if (isNaN(date.getTime())) {
            throw new TypeError(`Value is not a valid Date: ${value}`);
        }

        return date;
    },

    parseLiteral(ast) {
        if (ast.kind !== Kind.STRING) {
            throw new GraphQLError(`Can only parse strings to dates but got a: ${ast.kind}`);
        }

        const value = ast.value;

        let date = moment(value);

        const isValid = date.isValid();
        if (value && !isValid) {
            throw new TypeError(`Value is not a valid Date: ${value}`);
        }
        return isValid ? date.toJSON() : value;

    },
});