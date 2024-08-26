import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationBootstrapOptions } from 'src/common/interfaces/application-bootstrap-options.interface';
import { EVENT_STORE_CONNECTION } from './core.constants';

@Module({
    imports: [
        MongooseModule.forRoot('mongodb://localhost:27018/vf-event-store', {
            connectionName: EVENT_STORE_CONNECTION,
            directConnection: true,
        }),
    ],
})
export class CoreModule {
    static forRoot(options: ApplicationBootstrapOptions) {
        const imports = 
        options.driver === 'orm'
        ? [
            // We are going to hardcode the connection options for simplicity
            // but you can use a configuration file or environment variables
            TypeOrmModule.forRoot({
                type: 'postgres',
                host: 'localhost',
                port: 5432,
                password: 'postgres',
                username: 'postgres',
                autoLoadEntities: true,
                synchronize: true,
            }),
            MongooseModule.forRoot('mongodb://localhost:27017/vf-read-db')
        ]
        : [];

        return {
            module: CoreModule,
            imports
        }
    }
}
