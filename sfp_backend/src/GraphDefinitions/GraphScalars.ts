import { GraphQLScalarType, GraphQLString, Kind } from "graphql";

const DateScalar = new GraphQLScalarType({
    name: 'Date',
    parseValue(value) {
        if(typeof value === 'string'){
            return new Date(value);
        }
        return new Date(); // value from the client
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.STRING) {
            return new Date(ast.value) // ast value is always in string format
        }
        return new Date();
    },
    serialize(value) {
        if(typeof value === 'string'){
            return value;
        }
        if(value instanceof Date){
            return (value as Date).toISOString();
        }
        return (new Date()).toISOString(); // value sent to the client
    }
});


export {DateScalar};