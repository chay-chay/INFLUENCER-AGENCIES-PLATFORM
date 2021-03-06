import bodyParser from "body-parser";
import compression from "compression";
import config from 'config';
import cors from "cors";
import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from "helmet";
import mongoose from "mongoose";

import connect from './utils/connect';
import loger from './utils/logger';
import routes from './routes/routes';



const PORT = config.get<number>('port')

const app: Application = express();

app.use(compression());
app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

app.use(express.json({ limit: '10kb' }));



const server = app.listen(PORT, async () => {

    loger.info(`App is running at http://localhost:${ PORT }`);

    await connect();

    routes(app);


    // UnKnown Routes
    app.all('*', (req: Request, res: Response, next: NextFunction) => {
        const err = new Error(`Route ${ req.originalUrl } not found`) as any;
        err.statusCode = 404;
        next(err);
    });

    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
        err.status = err.status || 'error';
        err.statusCode = err.statusCode || 500;

        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    });
})


process.on('SIGINT', () => {
    loger.info(`SIGINT: Process ${ process.pid } has been interrupted`)

    server.close(function (err) {
        if (err) {
            loger.error(err)
            process.exit(1)
        }
        mongoose.connection.close(function () {
            loger.info('Mongoose connection disconnected')
            process.exit()
        })

        setTimeout(() => {
            loger.info(`SIGINT setTimeout`)
            process.exit()
        }, 500).unref()
    });
});

process.on('SIGTERM', function () {
    loger.info(`Process ${ process.pid } received a SIGTERM signal`)
    server.close(function () {
       
        setTimeout(() => {
            loger.info(`SIGTERM setTimeout`)
            process.exit(0)
        }, 1000).unref()
        process.exit(0);
    });
});


