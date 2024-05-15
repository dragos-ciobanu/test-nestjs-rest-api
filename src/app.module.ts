import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteModule } from './modules/note/note.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'postgres',
      port: parseInt(process.env.POSTGRES_PORT) || 5432,
      username: process.env.POSTGRES_USERNAME || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DATABASE || 'secret_notes',
      autoLoadEntities: true,
      synchronize: true,
    }),
    NoteModule,
  ],
})

export class AppModule {}
