import express from "express";
import expressGraphQL from "express-graphql";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import schema from "./graphql/GraphQLSchema";
import ValidationError from "./graphql/ValidationError";

import dotenv from "dotenv";
dotenv.config();

import jwt from "express-jwt";

const auth = jwt({
    secret: process.env.JWT_SECRET,
    credentialsRequired: false,
});

const app = express();

const PORT = process.env.PORT || "8000";
const db = process.env.MONGODB_URL;

const oprions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    autoIndex: true,
    useCreateIndex: true,
};

mongoose.connect(db, oprions).then(()=>{
    console.log("Connected to MongoDB");
}).catch(error => console.log(error));

app.use(
    "/graphql",
    cors(),
    // Incase you need to allow cors
    // cors({
    //     credentials: true,
    //     origin: 'http://localhost:3001'
    // }),
    bodyParser.json(),
    auth,
    expressGraphQL(req => {
        return {
            schema: schema,
            context: {
                user: req.user
            },
            graphiql: true, // позволява графичния интерфейс
            formatError: error => {
                if (error.originalError instanceof ValidationError) {
                    return {
                        message: error.mesage,
                        validationErrors: error.originalError && error.originalError.validationErrors,
                        // locations: error.locations,
                        // path: error.path
                    }
                }
                
                return error;
            },
        }
    })
)

app.listen(PORT, ()=> {
    console.log(`Server running at: ${PORT}`)
});