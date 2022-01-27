import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import jwt from 'jsonwebtoken'

declare global{
    var signin: () => string[];
}


let mongo: any;
beforeAll(async () => {
    process.env.JWT_KEY= 'something';
    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();
    await mongoose.connect(mongoUri);
})

beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
})

afterAll (async () => {
    await mongo.stop();
    await mongoose.connection.close();
})

global.signin = () => {
    // fake a JWT payload.
    // then create JWT
    const payload = {
        id: 'acsjjsc',
        email: 'test@test.com'
    }
    const token = jwt.sign(payload, process.env.JWT_KEY!);

    const session = {jwt : token};
    const sessionJSON = JSON.stringify(session);

    // turn into base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    return [`session=${base64}`];
}